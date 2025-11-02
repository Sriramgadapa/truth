// src/hooks/useAnalysis.ts
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cacheService } from "@/lib/clientCache";

// Helper function to create a SHA-256 hash
async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface AnalysisResult {
  status: 'verified' | 'suspicious' | 'false';
  confidence: number;
  issues: string[];
  counterContent: {
    factCheck: string;
    visualContent: string;
    shortForm: string;
  };
}

export const useAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async (
    inputText: string,
    inputUrl: string,
    uploadedFile: File | null
  ) => {
    const content = inputText || inputUrl || (uploadedFile ? `Analyzing ${uploadedFile.type.split('/')[0]} file: ${uploadedFile.name}` : '');

    if (!content.trim() && !uploadedFile) {
      toast({
        title: "Content Required",
        description: "Please enter some text, URL, or upload a file to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 100));
    }, 500);

    try {
      const contentIdentifier = uploadedFile ? uploadedFile.name + uploadedFile.size : content;
      const contentHash = await sha256(contentIdentifier);

      // Check client-side cache
      const cachedResult = await cacheService.get(contentHash);
      if (cachedResult) {
        setAnalysisResults(cachedResult);
        toast({
          title: "Analysis Complete (Cached)",
          description: "Loaded result from local cache.",
        });
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        return;
      }

      let analysisType: 'text' | 'url' | 'image' | 'video' | 'audio' = 'text';
      let contentToSend = content;
      let fileData: string | undefined;

      if (uploadedFile) {
        const fileType = uploadedFile.type.split('/')[0];
        if (fileType === 'image') {
          analysisType = 'image';
          const reader = new FileReader();
          fileData = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(uploadedFile);
          });
        } else if (fileType === 'video') {
          analysisType = 'video';
        } else if (fileType === 'audio') {
          analysisType = 'audio';
        }
        contentToSend = uploadedFile.name;
      } else if (inputUrl) {
        analysisType = 'url';
        contentToSend = inputUrl;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: analysisType,
            content: contentToSend,
            fileData
          })
        }
      );

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();

      const mappedResult = {
        status: result.status === 'verified' ? 'verified' :
                result.status === 'false' || result.status === 'manipulated' ? 'false' :
                'suspicious',
        confidence: result.truthScore,
        issues: result.warnings && result.warnings.length > 0 ? result.warnings :
                result.claims.map((c: any) => c.explanation || c.text).slice(0, 3),
        counterContent: generateCounterContent(content, result)
      };

      setAnalysisResults(mappedResult as AnalysisResult);
      await cacheService.set(contentHash, mappedResult);

      toast({
        title: "Analysis Complete",
        description: `Truth Score: ${result.truthScore}% - ${result.status}`,
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const generateCounterContent = (content: string, analysis: any) => {
    const topics = {
      climate: {
        factCheck: "According to NASA and 97% of climate scientists, human activities are the primary cause of recent climate change. This is supported by decades of peer-reviewed research.",
        visualContent: "Interactive chart showing global temperature trends and scientific consensus",
        shortForm: "🌍 FACT: Climate change is real and human-caused. 97% of scientists agree based on solid evidence. #ClimateScience #FactsFirst"
      },
      default: {
        factCheck: "This claim lacks credible evidence. Always verify information through reputable sources and fact-checking organizations.",
        visualContent: "Guide to identifying reliable sources and fact-checking methods",
        shortForm: "🔍 FACT-CHECK: Verify before you share! Check multiple reputable sources for accurate information. #FactCheck"
      }
    };

    const lowerContent = content.toLowerCase();
    let topic = 'default';

    if (lowerContent.includes('climate') || lowerContent.includes('global warming')) topic = 'climate';

    return topics[topic as keyof typeof topics];
  };

  return {
    isAnalyzing,
    analysisProgress,
    analysisResults,
    handleAnalysis
  };
};

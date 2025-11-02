import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAnalysis } from "@/hooks/useAnalysis";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Globe,
  Target,
  Copy,
  Share,
  Download
} from "lucide-react";

export const AnalysisInterface = () => {
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [generatedInfographic, setGeneratedInfographic] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const { toast } = useToast();

  const {
    isAnalyzing,
    analysisProgress,
    analysisResults,
    handleAnalysis: performAnalysis
  } = useAnalysis();

  const handleAnalysis = () => {
    performAnalysis(inputText, inputUrl, uploadedFile);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard."
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy content.",
        variant: "destructive"
      });
    }
  };

  const shareContent = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TruthGen Fact Check',
          text: text
        });
      } catch (err) {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const generateInfographic = async () => {
    if (!analysisResults) return;
    
    setIsGeneratingInfographic(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-infographic`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: analysisResults.status,
            confidence: analysisResults.confidence,
            issues: analysisResults.issues,
            factCheck: analysisResults.counterContent.factCheck
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate infographic');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setGeneratedInfographic(data.imageUrl);
        toast({
          title: "Success!",
          description: "Infographic generated successfully."
        });
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Infographic generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate infographic.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInfographic(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video' | 'audio') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg']
    };

    if (!validTypes[fileType].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a valid ${fileType} file.`,
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);

    // Create preview for images
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview('');
    }

    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded successfully.`
    });
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFilePreview('');
  };

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Try the <span className="bg-gradient-hero bg-clip-text text-transparent">TruthGen Engine</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload content or paste text to see our AI analyze and generate truth-based responses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-1">
                    <Mic className="h-4 w-4" />
                    Audio
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL or Text Content</label>
                    <Input 
                      placeholder="https://example.com/article"
                      className="mb-3"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                    />
                    <Textarea 
                      placeholder="Or paste the full text content here for analysis..."
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:border-primary transition-colors"
                    >
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Drop image here or click to upload</p>
                      <p className="text-sm text-muted-foreground">Supports deepfake detection</p>
                    </label>
                    {filePreview && (
                      <div className="relative">
                        <img src={filePreview} alt="Preview" className="w-full rounded-lg" />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={clearFile}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="video" className="space-y-4">
                  <div className="space-y-4">
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                    <label
                      htmlFor="video-upload"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:border-primary transition-colors"
                    >
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Drop video here or click to upload</p>
                      <p className="text-sm text-muted-foreground">Advanced manipulation detection</p>
                    </label>
                    {uploadedFile && uploadedFile.type.startsWith('video/') && (
                      <div className="relative">
                        <div className="bg-muted rounded-lg p-4">
                          <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-center">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground text-center">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={clearFile}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="audio" className="space-y-4">
                  <div className="space-y-4">
                    <input
                      type="file"
                      id="audio-upload"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, 'audio')}
                      className="hidden"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:border-primary transition-colors"
                    >
                      <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Drop audio here or click to upload</p>
                      <p className="text-sm text-muted-foreground">Voice cloning detection</p>
                    </label>
                    {uploadedFile && uploadedFile.type.startsWith('audio/') && (
                      <div className="relative">
                        <div className="bg-muted rounded-lg p-4">
                          <Mic className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-center">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground text-center">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={clearFile}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={handleAnalysis}
                disabled={isAnalyzing || (!inputText.trim() && !inputUrl.trim() && !uploadedFile)}
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {analysisProgress < 25 && "Preprocessing content..."}
                    {analysisProgress >= 25 && analysisProgress < 50 && "Fact-checking claims..."}
                    {analysisProgress >= 50 && analysisProgress < 75 && "Detecting manipulation..."}
                    {analysisProgress >= 75 && "Generating counter-content..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-verification" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResults && !isAnalyzing && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Upload content to see analysis results</p>
                </div>
              )}
              
              {analysisResults && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysisResults.status === 'verified' && (
                        <>
                          <CheckCircle className="h-5 w-5 text-verification" />
                          <span className="font-medium text-verification">Status: Verified Content</span>
                        </>
                      )}
                      {analysisResults.status === 'suspicious' && (
                        <>
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          <span className="font-medium text-warning">Status: Suspicious Content</span>
                        </>
                      )}
                      {analysisResults.status === 'false' && (
                        <>
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <span className="font-medium text-destructive">Status: False Information</span>
                        </>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${analysisResults.status === 'verified' ? 'bg-verification/10 text-verification' : ''}
                        ${analysisResults.status === 'suspicious' ? 'bg-warning/10 text-warning' : ''}
                        ${analysisResults.status === 'false' ? 'bg-destructive/10 text-destructive' : ''}
                      `}
                    >
                      {analysisResults.confidence}% Confidence
                    </Badge>
                  </div>
                  
                  {/* Issues Found */}
                  <div>
                    <h4 className="font-medium mb-3">Issues Detected:</h4>
                    <div className="space-y-2">
                      {analysisResults.issues.map((issue: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${
                            analysisResults.status === 'verified' ? 'bg-verification' :
                            analysisResults.status === 'suspicious' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Generated Counter-Content */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-verification" />
                      Generated Truth Content:
                    </h4>
                    <Tabs defaultValue="factcheck" className="w-full">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="factcheck">Fact Check</TabsTrigger>
                        <TabsTrigger value="visual">Visual</TabsTrigger>
                        <TabsTrigger value="social">Social</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="factcheck" className="mt-4">
                        <div className="bg-verification/5 border border-verification/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-verification" />
                            <span className="font-medium text-verification">Verified Fact</span>
                          </div>
                          <p className="text-sm">{analysisResults.counterContent.factCheck}</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="visual" className="mt-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="h-4 w-4 text-primary" />
                            <span className="font-medium text-primary">Visual Content</span>
                          </div>
                          <p className="text-sm">{analysisResults.counterContent.visualContent}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={generateInfographic}
                            disabled={isGeneratingInfographic}
                          >
                            {isGeneratingInfographic ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Infographic'
                            )}
                          </Button>
                          {generatedInfographic && (
                            <div className="mt-4">
                              <img 
                                src={generatedInfographic} 
                                alt="Generated infographic" 
                                className="w-full rounded-lg border border-border"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = generatedInfographic;
                                  link.download = 'fact-check-infographic.png';
                                  link.click();
                                }}
                              >
                                Download Infographic
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="social" className="mt-4">
                        <div className="bg-accent/50 border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium">Social Media Ready</span>
                          </div>
                          <p className="text-sm">{analysisResults.counterContent.shortForm}</p>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(analysisResults.counterContent.shortForm)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => shareContent(analysisResults.counterContent.shortForm)}
                            >
                              <Share className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
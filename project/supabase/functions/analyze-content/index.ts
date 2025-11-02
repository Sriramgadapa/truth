import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Helper function to create a SHA-256 hash
async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'text' | 'url' | 'image' | 'video' | 'audio';
  content: string;
  fileData?: string; // base64 for files
}

interface AnalysisResult {
  truthScore: number;
  status: 'verified' | 'partially-verified' | 'unverified' | 'false' | 'manipulated';
  claims: Array<{
    text: string;
    score: number;
    status: string;
    explanation: string;
    sources: string[];
  }>;
  overallExplanation: string;
  detailedAnalysis: string;
  warnings: string[];
  metadata: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const requestBody: AnalysisRequest = await req.json();
    const { type, content, fileData } = requestBody;
    console.log(`Analyzing ${type} content...`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const contentIdentifier = fileData ? fileData.substring(0, 100) : content;
    const contentHash = await sha256(contentIdentifier);

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('analysis_cache')
      .select('result')
      .eq('hash', contentHash)
      .single();

    if (cachedData && !cacheError) {
      console.log('Cache hit!');
      return new Response(JSON.stringify(cachedData.result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Cache miss. Performing new analysis.');

    let analysisResult: AnalysisResult;

    switch (type) {
      case 'text':
        analysisResult = await analyzeText(content, LOVABLE_API_KEY);
        break;
      case 'url':
        analysisResult = await analyzeURL(content, LOVABLE_API_KEY);
        break;
      case 'image':
        analysisResult = await analyzeImage(content, fileData, LOVABLE_API_KEY);
        break;
      case 'video':
        analysisResult = await analyzeVideo(content, LOVABLE_API_KEY);
        break;
      case 'audio':
        analysisResult = await analyzeAudio(content, LOVABLE_API_KEY);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    // Store new result in cache
    await supabase.from('analysis_cache').insert({
      hash: contentHash,
      result: analysisResult,
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        truthScore: 0,
        status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeText(text: string, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `You are TruthEngine, an advanced AI fact-checker and content verification system. 
Your role is to analyze text for factual accuracy, detect misinformation, and provide evidence-based verification.

Analysis Process:
1. Extract all factual claims from the text
2. For each claim, assess:
   - Factual accuracy (0-100)
   - Supporting/contradicting evidence
   - Source reliability
3. Detect manipulation tactics: emotional language, logical fallacies, cherry-picking
4. Provide overall truth score and detailed explanation

Output strict JSON format:
{
  "claims": [{"text": "claim", "score": 85, "status": "verified", "explanation": "...", "sources": ["..."]}],
  "truthScore": 75,
  "status": "partially-verified",
  "overallExplanation": "...",
  "detailedAnalysis": "...",
  "warnings": ["..."],
  "metadata": {}
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this text for truthfulness:\n\n${text}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return normalizeResult(result);
}

async function analyzeURL(url: string, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `You are TruthEngine analyzing a URL/webpage for credibility and content verification.

Analysis Process:
1. Assess domain reputation and authority
2. Check for known misinformation sources
3. Analyze content claims (if URL content provided)
4. Verify publication dates and source citations
5. Detect clickbait, sensationalism, or bias

Output strict JSON format with claims, truthScore, status, explanations, warnings, and metadata.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this URL for credibility and truth:\n\n${url}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return normalizeResult(result);
}

async function analyzeImage(filename: string, fileData: string | undefined, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `You are TruthEngine specialized in image forensics and manipulation detection.

Analysis Capabilities:
1. Detect AI-generated images (deepfakes, GANs, diffusion models)
2. Identify photo manipulation (cloning, splicing, retouching)
3. Verify image authenticity and metadata
4. Detect misleading context or deceptive framing
5. Assess visual evidence credibility

Analyze for:
- Compression artifacts and inconsistencies
- Lighting and shadow irregularities
- Edge detection anomalies
- Facial manipulation (deepfakes)
- Content authenticity

Output strict JSON format with truthScore, status, detailedAnalysis, warnings, and metadata including technical indicators.`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (fileData) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: `Analyze this image for authenticity and manipulation. Filename: ${filename}` },
        { type: 'image_url', image_url: { url: fileData } }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: `Analyze image metadata and context for: ${filename}`
    });
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return normalizeResult(result);
}

async function analyzeVideo(filename: string, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `You are TruthEngine specialized in video forensics and deepfake detection.

Analysis Capabilities:
1. Detect deepfake videos (face swaps, voice synthesis)
2. Identify video manipulation (cuts, splices, timing manipulation)
3. Analyze temporal consistency and frame artifacts
4. Detect AI-generated synthetic media
5. Verify authenticity markers and metadata

Detection Techniques:
- Facial micro-expressions and blinking patterns
- Lip-sync accuracy and audio-visual alignment
- Frame-to-frame consistency
- Compression and encoding anomalies
- Temporal artifacts

Output strict JSON with truthScore, status (verified/manipulated), detailedAnalysis including technical indicators, warnings about potential manipulation methods.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this video file for deepfakes and manipulation: ${filename}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return normalizeResult(result);
}

async function analyzeAudio(filename: string, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `You are TruthEngine specialized in audio forensics and voice cloning detection.

Analysis Capabilities:
1. Detect AI-generated voices and cloned speech
2. Identify audio manipulation (splicing, pitch shifting)
3. Analyze voice authenticity and consistency
4. Detect text-to-speech artifacts
5. Verify speaker identity and audio integrity

Detection Methods:
- Spectral analysis for synthetic artifacts
- Prosody and intonation patterns
- Background noise consistency
- Compression and encoding irregularities
- Voice biometric anomalies

Output strict JSON with truthScore, status (authentic/manipulated/synthetic), detailedAnalysis including acoustic indicators, warnings about potential voice cloning or synthesis.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this audio file for voice cloning and manipulation: ${filename}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return normalizeResult(result);
}

function normalizeResult(result: any): AnalysisResult {
  return {
    truthScore: result.truthScore || result.score || 50,
    status: result.status || 'unverified',
    claims: result.claims || [],
    overallExplanation: result.overallExplanation || result.explanation || 'Analysis completed',
    detailedAnalysis: result.detailedAnalysis || result.details || '',
    warnings: result.warnings || [],
    metadata: result.metadata || {}
  };
}
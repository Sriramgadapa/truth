import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  Globe, 
  Target, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Users, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Multi-Format Detection",
    description: "Advanced AI detection across text, images, videos, and audio content including deepfakes and voice cloning.",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Real-Time Generation",
    description: "Instantly creates engaging counter-content including memes, infographics, and viral-ready fact-checks.",
    color: "text-verification"
  },
  {
    icon: Globe,
    title: "100+ Languages",
    description: "Culturally adapted truth content delivered in local languages with regional context and nuances.",
    color: "text-primary"
  },
  {
    icon: Target,
    title: "Precision Fact-Checking",
    description: "Cross-references multiple authoritative sources with real-time verification and confidence scoring.",
    color: "text-verification"
  },
  {
    icon: RefreshCw,
    title: "Truth Restoration",
    description: "Reconstructs original versions of manipulated media and highlights specific changes made.",
    color: "text-primary"
  },
  {
    icon: Eye,
    title: "Bias Detection",
    description: "Identifies emotional manipulation, loaded language, and creates neutral, balanced alternatives.",
    color: "text-verification"
  },
  {
    icon: Sparkles,
    title: "Viral Counter-Content",
    description: "Generates shareable, engaging truth content designed to spread faster than misinformation.",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Community Verification",
    description: "Crowdsourced validation with expert review networks and transparency scoring systems.",
    color: "text-verification"
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description: "Track truth content performance, reach metrics, and misinformation reduction effectiveness.",
    color: "text-primary"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Powerful <span className="bg-gradient-hero bg-clip-text text-transparent">AI Capabilities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TruthGen combines cutting-edge detection with generative AI to create a comprehensive 
            misinformation defense system that works at internet scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-elegant hover:shadow-primary transition-all duration-300 hover:-translate-y-1 border-0 bg-background/50 backdrop-blur"
            >
              <CardHeader>
                <div className={`h-12 w-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
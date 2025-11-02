import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, Search, Zap, Share2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Input Content",
    description: "Upload or paste text, images, videos, or audio content from any source",
    badge: "Multi-format"
  },
  {
    icon: Search,
    title: "AI Analysis",
    description: "Advanced algorithms detect manipulation, fact-check claims, and identify bias patterns",
    badge: "Real-time"
  },
  {
    icon: Zap,
    title: "Generate Truth",
    description: "Create engaging counter-content: memes, infographics, videos, and fact-checks",
    badge: "Viral-ready"
  },
  {
    icon: Share2,
    title: "Deploy & Track",
    description: "Share truth content across platforms and monitor its impact against misinformation",
    badge: "Global reach"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How <span className="bg-gradient-hero bg-clip-text text-transparent">TruthGen</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our four-step process transforms misinformation detection into truth generation
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="shadow-elegant hover:shadow-primary transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="mb-6">
                    <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {step.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  <div className="mt-6 text-2xl font-bold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-surface rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            The Result: <span className="text-verification">Truth at Scale</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            TruthGen doesn't just flag misinformation—it fights back with engaging, 
            shareable content that makes truth more compelling than lies. Every piece of 
            counter-content is designed to spread virally while maintaining factual accuracy.
          </p>
        </div>
      </div>
    </section>
  );
};
import { Button } from "@/components/ui/button";
import { Shield, Zap, Target, Globe } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  return (
    <section className="relative py-20 bg-gradient-surface overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Fighting Misinformation with AI</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  TruthGen
                </span>
                <br />
                <span className="text-foreground">
                  AI Truth Engine
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Advanced generative AI that detects misinformation and creates engaging, 
                fact-based counter-content in real-time. Fight fire with fire.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Detect</p>
                <p className="text-xs text-muted-foreground">Misinformation</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-verification/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-verification" />
                </div>
                <p className="text-sm font-medium">Generate</p>
                <p className="text-xs text-muted-foreground">Truth Content</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Scale</p>
                <p className="text-xs text-muted-foreground">100+ Languages</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Truth Analysis
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage} 
              alt="TruthGen AI Engine protecting against misinformation"
              className="relative z-10 w-full h-auto rounded-2xl shadow-elegant"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
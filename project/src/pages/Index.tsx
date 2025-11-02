import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const AnalysisInterface = lazy(() =>
  import("@/components/AnalysisInterface").then(module => ({ default: module.AnalysisInterface }))
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisInterface />
      </Suspense>
      <Footer />
    </div>
  );
};

const AnalysisSkeleton = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  </section>
);

export default Index;

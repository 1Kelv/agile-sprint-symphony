
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import AdvantagesSection from "@/components/landing/AdvantagesSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-agile-primary/10 blur-3xl" />
        <div className="absolute top-[60%] -left-40 w-96 h-96 rounded-full bg-agile-secondary/10 blur-3xl" />
      </div>

      <LandingNavbar user={user} />
      <HeroSection user={user} />
      <AdvantagesSection />
      <CtaSection user={user} />
      <LandingFooter />
    </div>
  );
};

export default Index;

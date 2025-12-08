import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
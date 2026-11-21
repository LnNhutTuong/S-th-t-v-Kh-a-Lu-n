import HeroSection from "./hero-section";
import TrustSection from "./trust-section";
import AboutSection from "./about-section";
import FeaturesSection from "./features-section";
import WorkflowSection from "./workflow-section";
import CTASection from "./cta-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      <main>
        <HeroSection />
        <TrustSection />
        <AboutSection />
        <FeaturesSection />
        <WorkflowSection />
        <CTASection />
      </main>
    </div>
  );
}

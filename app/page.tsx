import { Navigation } from "./_components/landing/navigation";
import { Hero } from "./_components/landing/hero";
import { SocialProof } from "./_components/landing/social-proof";
import { Features } from "./_components/landing/features";
import { HowItWorks } from "./_components/landing/how-it-works";
import { CTASection } from "./_components/landing/cta-section";
import { Footer } from "./_components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navigation />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

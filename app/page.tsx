import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Trust } from "@/components/landing/trust";
import { Features } from "@/components/landing/features";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { Automation } from "@/components/landing/automation";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative overflow-x-clip">
      <LandingNavbar />
      <Hero />
      <Trust />
      <Features />
      <DashboardShowcase />
      <Automation />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}

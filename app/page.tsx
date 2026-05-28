import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductShot } from "@/components/landing/product-shot";
import { NumberedSteps } from "@/components/landing/numbered-steps";
import { ValueProps } from "@/components/landing/value-props";
import { CaseStudy } from "@/components/landing/case-study";
import { Journal } from "@/components/landing/journal";
import { Testimonial } from "@/components/landing/testimonial";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-bone-50" aria-hidden />
      <main className="relative overflow-x-clip bg-bone-50 text-ink-300 font-sans selection:bg-signal-500/20 selection:text-ink-300 antialiased">
        <LandingNavbar />
        <Hero />
        <ProductShot />
        <NumberedSteps />
        <ValueProps />
        <CaseStudy />
        <Journal />
        <Testimonial />
        <FinalCTA />
        <LandingFooter />
      </main>
    </>
  );
}

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
      {/* Base bone canvas */}
      <div className="fixed inset-0 -z-20 bg-bone-50" aria-hidden />

      {/*
        Ambient warm wash — placed fixed so it persists through scroll.
        Two soft radial blobs, top-left and top-right, well below 10% opacity.
        Reads as morning light catching the room, not as a colour overlay.
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(60% 50% at 8% 0%, rgba(255, 125, 63, 0.10), transparent 65%)",
            "radial-gradient(55% 45% at 95% 5%, rgba(255, 156, 102, 0.07), transparent 70%)",
            "radial-gradient(45% 35% at 50% 100%, rgba(255, 90, 31, 0.05), transparent 70%)",
          ].join(","),
        }}
      />

      <main className="relative overflow-x-clip text-ink-300 font-sans selection:bg-signal-500/20 selection:text-ink-300 antialiased">
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

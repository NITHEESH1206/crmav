import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductShot } from "@/components/landing/product-shot";
import { NumberedSteps } from "@/components/landing/numbered-steps";
import { ValueProps } from "@/components/landing/value-props";
import { CaseStudy } from "@/components/landing/case-study";
import { Journal } from "@/components/landing/journal";
import { Testimonial } from "@/components/landing/testimonial";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      {/* Base bone canvas */}
      <div className="fixed inset-0 -z-30 bg-bone-50" aria-hidden />

      {/*
        Ambient brand wash — multiple signal-orange blobs at 0.12-0.20 opacity.
        Stronger than before so the glass surfaces above pick up the colour
        through their backdrop-saturate filters. This is how the brand is
        "everywhere" without painting it directly on each card.
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(55% 45% at 12% 8%, rgba(255, 125, 63, 0.22), transparent 60%)",
            "radial-gradient(50% 40% at 92% 12%, rgba(255, 156, 102, 0.16), transparent 65%)",
            "radial-gradient(60% 50% at 50% 55%, rgba(255, 90, 31, 0.08), transparent 70%)",
            "radial-gradient(45% 35% at 8% 92%, rgba(255, 125, 63, 0.14), transparent 65%)",
            "radial-gradient(50% 40% at 88% 88%, rgba(255, 90, 31, 0.10), transparent 70%)",
          ].join(","),
        }}
      />

      {/* Subtle noise overlay — keeps the gradient from looking too digital */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          mixBlendMode: "multiply",
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
        <Pricing />
        <FinalCTA />
        <LandingFooter />
      </main>
    </>
  );
}

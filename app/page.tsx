import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Trust } from "@/components/landing/trust";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      {/* Paint over the global dark <body> background for this route only. */}
      <div className="fixed inset-0 -z-10 bg-bone-100" aria-hidden />
      <main className="relative overflow-x-clip bg-bone-100 text-ink-300 font-sans selection:bg-signal-500/25 selection:text-ink-300">
        <LandingNavbar />
        <Hero />
        <Trust />
        <Features />
        <Pricing />
        <LandingFooter />
      </main>
    </>
  );
}

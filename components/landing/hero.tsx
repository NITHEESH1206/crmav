"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-40 pb-24 sm:pt-44 sm:pb-28 overflow-hidden"
    >
      {/* Soft lavender → signal wash from top */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,90,31,0.10),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,rgba(10,10,10,0.04),transparent_70%)]"
      />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur border border-bone-300/60 px-5 py-2 text-[13px] font-medium text-ink-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-500" />
            </span>
            One Platform. Every AV Project.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-7 font-display font-bold tracking-[-0.045em] leading-[0.95] text-ink-300 text-5xl sm:text-6xl md:text-7xl lg:text-[88px]"
          >
            All-in-One CRM to Run
            <br />
            Your AV Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-7 mx-auto max-w-2xl text-[17px] sm:text-lg text-ink-300/60 leading-relaxed"
          >
            Projects, opportunities, service tickets, inventory, procurement, billing — plus AV-native tools like rack builder, signal flow and device monitoring. Built for integrators, consultants and service teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/dashboard">
              <PrimaryPill>Ready to Try Free</PrimaryPill>
            </Link>
            <Link href="#features">
              <OutlinePill>Get Started</OutlinePill>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-ink-300/55"
          >
            <Tick>No credit card required</Tick>
            <Tick>Cancel anytime &amp; no hidden charge</Tick>
            <Tick>14-day money-back guarantee</Tick>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-ink-300/70" strokeWidth={2.4} />
      {children}
    </span>
  );
}

export function PrimaryPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full bg-ink-300 pl-7 pr-2 py-2 text-[15px] font-medium text-bone-100 hover:bg-ink-200 transition-all hover:shadow-[0_10px_30px_-10px_rgba(10,10,10,0.6)]",
        className
      )}
    >
      {children}
      <span className="h-9 w-9 rounded-full bg-bone-100/15 group-hover:bg-signal-500 flex items-center justify-center transition-colors">
        <ArrowRight className="h-4 w-4 text-bone-100 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.2} />
      </span>
    </span>
  );
}

export function OutlinePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full bg-white border border-bone-300/70 pl-7 pr-2 py-2 text-[15px] font-medium text-ink-300 hover:border-ink-300/40 transition-all",
        className
      )}
    >
      {children}
      <span className="h-9 w-9 rounded-full bg-ink-300 flex items-center justify-center">
        <ArrowRight className="h-4 w-4 text-bone-100 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.2} />
      </span>
    </span>
  );
}

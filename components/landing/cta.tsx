"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Aurora } from "@/components/motion/aurora";

export function FinalCTA() {
  return (
    <section className="relative py-32 sm:py-40">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-ink-200/40 backdrop-blur-2xl p-12 sm:p-20">
          <Aurora />
          <div className="absolute inset-0 grid-pattern" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aether-500/[0.04] to-transparent" />

          {/* Wave bg */}
          <svg
            className="absolute inset-x-0 -bottom-1 w-full opacity-30"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff6b00" stopOpacity="0" />
                <stop offset="50%" stopColor="#ff6b00" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 100 Q 300 40 600 100 T 1200 100 L 1200 200 L 0 200 Z"
              fill="url(#wave)"
              animate={{
                d: [
                  "M0 100 Q 300 40 600 100 T 1200 100 L 1200 200 L 0 200 Z",
                  "M0 100 Q 300 140 600 100 T 1200 100 L 1200 200 L 0 200 Z",
                  "M0 100 Q 300 40 600 100 T 1200 100 L 1200 200 L 0 200 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          <FadeIn className="relative text-center max-w-3xl mx-auto">
            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
              Built for AV. <br />
              <span className="text-gradient">Ready in 10 minutes.</span>
            </h2>
            <p className="mt-6 text-white/55 leading-relaxed">
              Bring your projects, vendors, and inventory into one cinematic platform. Free for 14 days — no credit card required.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="xl">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="xl" variant="secondary">
                <PlayCircle className="h-4 w-4" />
                Book a Demo
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

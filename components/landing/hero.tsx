"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-[820px]"
        >
          <span className="inline-flex items-center gap-2 mb-8 font-mono text-[13px] text-ink-300/60 uppercase tracking-[0.06em]">
            <span className="h-1 w-1 rounded-full bg-signal-500" />
            AV operations · redesigned
          </span>

          <h1 className="text-[40px] sm:text-[56px] md:text-[64px] lg:text-[80px] leading-[1.04] tracking-[-0.03em] text-ink-300 font-medium">
            Operations clarity,
            <br />
            built for AV integrators.
          </h1>

          <p className="mt-7 text-[18px] md:text-[20px] leading-[1.55] text-ink-300/65 max-w-[640px]">
            Run opportunities, projects, BOQs, racks, signal flows and AMC contracts from one operating system — with AI that drafts proposals, assembles racks and watches your SLAs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/dashboard" className="group">
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-300 text-bone-100 px-6 py-3.5 text-[16px] font-medium hover:bg-ink-200 transition-colors w-full sm:w-auto">
                Request a demo
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </span>
            </Link>
            <Link href="#product" className="group">
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent text-ink-300 border border-ink-300/20 hover:border-ink-300/50 px-6 py-3.5 text-[16px] font-medium transition-colors w-full sm:w-auto">
                Explore the platform
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[24px] bg-ink-300 text-bone-100 px-8 md:px-14 py-14 md:py-20 overflow-hidden"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,90,31,0.18),transparent_55%)]"
          />
          <div className="relative max-w-[680px]">
            <span className="inline-flex items-center gap-2 text-[12.5px] text-bone-100/55 font-medium mb-5">
              <span className="h-1 w-1 rounded-full bg-signal-500" />
              Get started
            </span>
            <h2 className="font-display text-[36px] md:text-[52px] leading-[1.05] tracking-[-0.03em] font-medium">
              Run your AV business from one operating system.
            </h2>
            <p className="mt-5 text-[16px] md:text-[18px] leading-[1.55] text-bone-100/70 max-w-[560px]">
              14-day trial. No credit card. Onboard with one room and see your full project rendered in 3D in under five minutes.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/dashboard" className="group">
                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-bone-100 text-ink-300 px-6 py-3.5 text-[14.5px] font-medium hover:bg-bone-200 transition-colors w-full sm:w-auto">
                  Start your trial
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2}
                  />
                </span>
              </Link>
              <Link href="#" className="group">
                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent text-bone-100 border border-bone-100/30 hover:border-bone-100/60 px-6 py-3.5 text-[14.5px] font-medium transition-colors w-full sm:w-auto">
                  Book a 20-min walkthrough
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

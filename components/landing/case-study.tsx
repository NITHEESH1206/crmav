"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Layers3, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CaseStudy() {
  return (
    <section id="customers" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-300/55 font-medium mb-5">
              <span className="h-1 w-1 rounded-full bg-signal-500" />
              Case study
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] leading-[1.05] tracking-[-0.03em] text-ink-300 font-medium">
              Why Soundstage AV chose ZynexAV.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-ink-300/65 max-w-[520px]">
              With fragmented data across Excel, AutoCAD and three SaaS subscriptions, Soundstage's project margin was being eroded by re-keying alone. They moved their full opportunity-to-AMC pipeline to ZynexAV in 11 days.
            </p>

            {/* Metrics */}
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-[480px]">
              <Metric value="68%" label="Less time spent on BOQ assembly" />
              <Metric value="3×" label="Faster proposal turnaround" />
              <Metric value="$1.2M" label="Pipeline previously missed by SLA gaps" />
            </div>

            <Link
              href="#"
              className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-300 hover:text-signal-600 group"
            >
              Read the case study
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </Link>
          </motion.div>

          {/* Visual — abstract "studio" tile in signal-orange duotone */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative aspect-[4/5] rounded-[20px] overflow-hidden bg-gradient-to-br from-signal-500/[0.08] via-bone-100 to-bone-200/60 border border-bone-300/55"
          >
            {/* Signal-orange duotone texture — built from CSS so no image dependency */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,90,31,0.25),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(255,125,63,0.18),transparent_55%),radial-gradient(circle_at_55%_60%,rgba(10,10,10,0.08),transparent_55%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-50 mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")",
              }}
            />

            {/* Soundstage "tile" content — a stylised AV room schematic */}
            <div className="relative h-full flex flex-col p-7">
              <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-ink-300/70 font-semibold">
                <Building2 className="h-3 w-3" />
                Soundstage AV · NYC HQ
              </div>

              <div className="mt-6 flex-1 grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-md ${
                      i % 4 === 0
                        ? "bg-ink-300"
                        : i % 3 === 0
                          ? "bg-signal-500/70"
                          : "bg-white/70 border border-bone-300/55"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-ink-300/15 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-ink-300/70">
                  <Layers3 className="h-3 w-3" />
                  42 rooms · 1,284 devices
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-signal-700">
                  <TrendingUp className="h-3 w-3" />
                  +68%
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[24px] md:text-[28px] font-medium tracking-[-0.02em] text-ink-300">
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-ink-300/55 leading-[1.4]">{label}</div>
    </div>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

const PANELS = [
  {
    title: "One canvas for every workflow",
    desc: "Switch between Opportunities, Projects, Service, and Inventory without losing context. Every module shares a unified data model and design language.",
    tag: "Unified UX",
  },
  {
    title: "Engineered for AV-specific data",
    desc: "Serial numbers, DSP files, rack diagrams, site survey photos, signal flows — first-class citizens, not afterthoughts bolted onto a generic CRM.",
    tag: "AV-Native",
  },
  {
    title: "AI that actually understands the deal",
    desc: "Generate proposals, summarize service tickets, forecast revenue, and pre-fill BOQs — trained on AV terminology, not just generic sales prompts.",
    tag: "AI Built-In",
  },
];

export function DashboardShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section id="showcase" ref={ref} className="relative py-32 sm:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aether-500/[0.04] to-transparent" />

      <div className="container">
        <FadeIn className="max-w-3xl mb-20">
          <div className="text-[11px] uppercase tracking-[0.3em] text-aether-400 font-medium">
            Cinematic by design
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            A CRM your team will <span className="text-gradient">actually want to open.</span>
          </h2>
        </FadeIn>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div className="space-y-16 lg:sticky lg:top-32">
            {PANELS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
              >
                <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/55">
                  {p.tag}
                </div>
                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-white/55 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div style={{ y }} className="relative">
            <div className="absolute -inset-x-10 -inset-y-10 bg-aether-500/15 blur-[120px] -z-10" />
            <div className="rotate-[1.5deg]">
              <DashboardPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

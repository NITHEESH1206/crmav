"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";
import { FadeIn } from "@/components/motion/fade-in";

const STATS = [
  { value: 2400, suffix: "+", label: "AV companies onboarded" },
  { value: 18, suffix: "M", prefix: "$", label: "Pipeline tracked monthly" },
  { value: 142000, suffix: "+", label: "Devices under management" },
  { value: 99.98, suffix: "%", decimals: 2, label: "Platform uptime" },
];

const LOGOS = [
  "Crestron",
  "Q-SYS",
  "Extron",
  "Biamp",
  "Shure",
  "Harman",
  "Yamaha",
  "AVer",
  "Poly",
  "Logitech",
  "Bose",
  "Genelec",
];

export function Trust() {
  return (
    <section className="relative py-24 sm:py-32 border-y border-white/[0.04] bg-ink-200/30 backdrop-blur-xl">
      <div className="container">
        <FadeIn className="text-center mb-16">
          <div className="text-[11px] uppercase tracking-[0.3em] text-aether-400 font-medium">
            Trusted by AV teams worldwide
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            The operating system for modern AV businesses
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="relative rounded-2xl glass-card p-6 text-center hover-lift"
            >
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-aether-500/40 to-transparent" />
              <CountUp
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
                className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-gradient"
              />
              <div className="mt-3 text-xs text-white/45">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Logo marquee */}
        <div className="relative marquee overflow-hidden">
          <div className="flex gap-12 animate-scroll-x w-max">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex items-center text-white/30 hover:text-white/60 transition-colors font-display text-2xl font-medium tracking-tight whitespace-nowrap"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

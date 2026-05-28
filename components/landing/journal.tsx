"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Layers3, Network, Sparkles } from "lucide-react";

const ARTICLES = [
  {
    cat: "Engineering",
    minutes: "6",
    title: "Designing the 2024 boardroom for hybrid",
    icon: Layers3,
    accent: "from-signal-500/15 to-signal-500/[0.02]",
  },
  {
    cat: "Standards",
    minutes: "8",
    title: "AVoIP vs HDBaseT: an integrator's call",
    icon: Network,
    accent: "from-ink-300/15 to-ink-300/[0.02]",
  },
  {
    cat: "Product",
    minutes: "4",
    title: "Inside the ZynexAV AI Builder",
    icon: Sparkles,
    accent: "from-signal-500/15 to-signal-500/[0.02]",
  },
];

export function Journal() {
  return (
    <section id="journal" className="relative py-24 md:py-32 bg-bone-100/50">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12 md:mb-16"
        >
          <div>
            <span className="inline-flex items-center gap-2 mb-6 font-mono text-[13px] text-ink-300/60 uppercase tracking-[0.06em]">
              <span className="h-1 w-1 rounded-full bg-signal-500" />
              Journal
            </span>
            <h2 className="text-[32px] md:text-[40px] leading-[1.08] tracking-[-0.024em] text-ink-300 font-medium">
              Notes from the AV operations floor.
            </h2>
          </div>
          <Link
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 text-[14px] text-ink-300/70 hover:text-ink-300 group"
          >
            View all articles
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.article
                key={a.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="group cursor-pointer"
              >
                <div
                  className={`aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${a.accent} border border-bone-300/55 relative`}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,90,31,0.18),transparent_55%)] mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      className="h-14 w-14 text-ink-300/30 group-hover:text-signal-500/70 transition-colors"
                      strokeWidth={1.2}
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="font-mono text-[12px] text-ink-300/55 uppercase tracking-[0.05em]">
                    {a.cat} <span className="text-ink-300/30 mx-1">·</span> {a.minutes} min read
                  </div>
                  <h3 className="mt-3 text-[20px] leading-[1.3] tracking-[-0.012em] text-ink-300 font-medium group-hover:text-signal-700 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

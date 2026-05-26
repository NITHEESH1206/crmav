"use client";

import { motion } from "framer-motion";
import { FileSignature, Bot, Wrench, Receipt, Bell, Workflow } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

const NODES = [
  { icon: Bot, label: "AI drafts proposal", color: "from-signal-400 to-signal-600" },
  { icon: FileSignature, label: "Client signs quote", color: "from-violet-400 to-violet-600" },
  { icon: Wrench, label: "Project auto-created", color: "from-sky-400 to-sky-600" },
  { icon: Workflow, label: "Tasks assigned to techs", color: "from-emerald-400 to-emerald-600" },
  { icon: Receipt, label: "Invoice scheduled", color: "from-amber-400 to-amber-600" },
  { icon: Bell, label: "Client portal notified", color: "from-pink-400 to-pink-600" },
];

export function Automation() {
  return (
    <section id="automation" className="relative py-32 sm:py-40">
      <div className="container">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.3em] text-signal-400 font-medium">
            Workflow Automation
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Automation that <span className="text-gradient">moves the project forward</span> on its own.
          </h2>
          <p className="mt-5 text-white/55 leading-relaxed">
            Compose multi-step automations across modules. Triggered by a stage change, a tech check-in, a signed proposal, or anything else.
          </p>
        </FadeIn>

        <div className="mt-20 relative rounded-3xl border border-white/[0.08] bg-ink-200/40 backdrop-blur-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-signal-mesh opacity-30" />
          <div className="absolute inset-0 grid-pattern" />

          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {NODES.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="relative rounded-2xl border border-white/[0.08] bg-ink-100/60 backdrop-blur-xl p-4 text-center"
                  >
                    <div className={`mx-auto h-10 w-10 rounded-xl bg-gradient-to-br ${n.color} flex items-center justify-center shadow-glow-sm`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div className="mt-3 text-xs font-medium leading-snug">{n.label}</div>
                  </motion.div>

                  {i < NODES.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 w-4">
                      <motion.svg
                        viewBox="0 0 16 8"
                        className="w-full h-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 + 0.3 }}
                      >
                        <motion.line
                          x1="0"
                          y1="4"
                          x2="16"
                          y2="4"
                          stroke="url(#flow-line)"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.12 + 0.3 }}
                        />
                        <defs>
                          <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                      </motion.svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pulse on the line */}
          <motion.div
            className="hidden lg:block absolute top-[58%] left-12 right-12 h-px bg-gradient-to-r from-transparent via-signal-500/40 to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

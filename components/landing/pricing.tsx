"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "yearly";

const TIERS = [
  {
    name: "Basic Package",
    monthly: 49,
    yearly: 39,
    desc: "Perfect for boutique integrators just getting structured.",
    features: [
      "Up to 5 users",
      "Opportunities, Projects, Service",
      "1,000 inventory SKUs",
      "Email support",
      "Standard integrations",
    ],
    cta: "Start 14-Day Free Trial",
    featured: false,
  },
  {
    name: "Standard Package",
    monthly: 129,
    yearly: 99,
    desc: "The most-loved plan for mid-sized AV firms scaling up.",
    features: [
      "Up to 25 users",
      "Everything in Basic",
      "Procurement + Inventory + RMA",
      "AV Rack Builder + Signal Flow",
      "AMC + Preventive Maintenance",
      "AI proposal generator",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    featured: true,
  },
  {
    name: "Custom Package",
    monthly: 249,
    yearly: 199,
    desc: "For large integrators and AV consultancies.",
    features: [
      "Unlimited users",
      "Everything in Standard",
      "SSO, SAML, audit logs",
      "Dedicated CSM",
      "Custom integrations",
      "99.99% uptime SLA",
    ],
    cta: "Talk to Sales",
    featured: false,
  },
];

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent to-bone-50/60">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full bg-white border border-bone-300/60 px-4 py-1.5 text-[13px] font-medium text-ink-300">
            Choose your Plan
          </div>
          <h2 className="mt-6 font-display font-bold tracking-[-0.04em] leading-[1.02] text-4xl sm:text-5xl md:text-6xl text-ink-300">
            Flexible Pricing for Every Stage
          </h2>
          <p className="mt-5 text-[16px] text-ink-300/60 leading-relaxed mx-auto max-w-xl">
            Whether you&apos;re just getting started or scaling fast — transparent plans, no hidden fees, cancel anytime.
          </p>

          {/* Cycle toggle */}
          <div className="mt-8 inline-flex items-center rounded-full bg-white border border-bone-300/60 p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={cn(
                "px-5 py-2 text-[13px] font-medium rounded-full transition-all",
                cycle === "monthly"
                  ? "bg-ink-300 text-bone-100"
                  : "text-ink-300/60 hover:text-ink-300"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={cn(
                "px-5 py-2 text-[13px] font-medium rounded-full transition-all",
                cycle === "yearly"
                  ? "bg-ink-300 text-bone-100"
                  : "text-ink-300/60 hover:text-ink-300"
              )}
            >
              Yearly &mdash; Save 23%
            </button>
          </div>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto items-start">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className={cn(
                "relative",
                t.featured && "lg:-mt-6"
              )}
            >
              {/* Header tab */}
              <div
                className={cn(
                  "rounded-t-[28px] py-4 text-center text-[15px] font-semibold",
                  t.featured
                    ? "bg-ink-300 text-bone-100"
                    : "bg-white border-x border-t border-bone-300/50 text-ink-300"
                )}
              >
                {t.name}
              </div>

              {/* Body */}
              <div
                className={cn(
                  "rounded-b-[28px] bg-white border-x border-b border-bone-300/50 p-7 sm:p-8",
                  t.featured && "shadow-[0_30px_70px_-30px_rgba(10,10,10,0.3)]"
                )}
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.04em] text-ink-300">
                    ${cycle === "monthly" ? t.monthly : t.yearly}.00
                  </span>
                  <span className="text-[13px] text-ink-300/55 font-medium">
                    /{cycle === "monthly" ? "monthly" : "yearly"}
                  </span>
                </div>

                <p className="mt-3 text-[14px] text-ink-300/60 leading-relaxed">
                  {t.desc}
                </p>

                <button
                  type="button"
                  className={cn(
                    "mt-6 group inline-flex items-center justify-between w-full rounded-full pl-5 pr-1.5 py-2 text-[14px] font-medium transition-all",
                    t.featured
                      ? "bg-ink-300 text-bone-100 hover:bg-ink-200"
                      : "bg-bone-50 text-ink-300 border border-bone-300/70 hover:border-ink-300/40"
                  )}
                >
                  {t.cta}
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center transition-colors",
                      t.featured
                        ? "bg-bone-100/15 group-hover:bg-signal-500"
                        : "bg-ink-300 text-bone-100"
                    )}
                  >
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.2} />
                  </span>
                </button>

                <div className="mt-7 pt-6 border-t border-bone-300/60 space-y-3">
                  {t.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2.5 text-[14px] text-ink-300/75"
                    >
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-signal-500/10 border border-signal-500/30 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-signal-600" strokeWidth={3} />
                      </span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Starter",
    price: 49,
    desc: "For boutique integrators just getting structured.",
    features: [
      "Up to 5 users",
      "Opportunities, Projects, Service",
      "1,000 inventory SKUs",
      "Email support",
      "Standard integrations",
    ],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Growth",
    price: 129,
    desc: "The standard plan for mid-sized AV firms.",
    features: [
      "Up to 25 users",
      "Everything in Starter",
      "Procurement + Inventory + RMA",
      "AV Rack Builder + Signal Flow",
      "AMC + Preventive Maintenance",
      "AI proposal generator",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: null,
    desc: "For large integrators and consultancies.",
    features: [
      "Unlimited users",
      "Everything in Growth",
      "SSO, SAML, audit logs",
      "Dedicated CSM",
      "Custom integrations",
      "On-prem option",
      "99.99% SLA",
    ],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 sm:py-40">
      <div className="container">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.3em] text-aether-400 font-medium">
            Pricing
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Plans that scale with <span className="text-gradient">your team.</span>
          </h2>
          <p className="mt-5 text-white/55 leading-relaxed">
            Pay per user. No hidden fees. Cancel anytime. 14-day free trial on every plan.
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {TIERS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className={cn(
                "relative rounded-3xl p-7 hover-lift",
                t.featured
                  ? "bg-gradient-to-b from-aether-500/[0.12] to-transparent border border-aether-500/30 shadow-[0_0_60px_-20px_rgba(255,107,0,0.5)]"
                  : "glass-card"
              )}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-aether-500 px-3 py-1 text-[10px] uppercase tracking-wider text-white font-semibold shadow-glow-sm">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-semibold tracking-tight">{t.name}</h3>
                {t.featured && (
                  <span className="text-[10px] uppercase tracking-wider text-aether-400">Recommended</span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/45 leading-relaxed">{t.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                {t.price !== null ? (
                  <>
                    <span className="font-display text-5xl font-semibold tracking-tight text-gradient">
                      ${t.price}
                    </span>
                    <span className="text-sm text-white/50">/user/mo</span>
                  </>
                ) : (
                  <span className="font-display text-4xl font-semibold tracking-tight text-gradient">
                    Custom
                  </span>
                )}
              </div>

              <Button
                variant={t.featured ? "default" : "secondary"}
                size="lg"
                className="mt-6 w-full"
              >
                {t.cta}
              </Button>

              <div className="mt-7 space-y-3">
                {t.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2.5 text-sm text-white/65">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-aether-500/15 border border-aether-500/30 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-aether-400" strokeWidth={3} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

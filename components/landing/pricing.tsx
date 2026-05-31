"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Minus, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const EXTRA_USER_PRICE = 6999; // per user / month
const ANNUAL_DISCOUNT = 0.2; // 20% off when billed annually

type Plan = {
  id: "basic" | "pro" | "enterprise";
  name: string;
  tagline: string;
  basePrice: number | null; // monthly; null = contact sales
  includedUsers: number;
  canExtend: boolean;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For small teams getting their pipeline and projects in order.",
    basePrice: 14999,
    includedUsers: 2,
    canExtend: true,
    features: [
      "2 users included",
      "Opportunities, proposals & BOQ",
      "Projects, rooms & catalog",
      "Rack builder & signal flow",
      "Invoicing with Razorpay",
      "Email support",
    ],
    cta: { label: "Start with Basic", href: "/dashboard" },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "The full operating system for a growing AV integration team.",
    basePrice: 49999,
    includedUsers: 12,
    canExtend: true,
    highlight: true,
    features: [
      "12 users included",
      "Everything in Basic",
      "AI Builder & AI Co-pilot",
      "Operations Center + remote control",
      "Automations engine",
      "Client portal & e-signature",
      "Priority support",
    ],
    cta: { label: "Start with Pro", href: "/dashboard" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For multi-branch integrators with security & scale needs.",
    basePrice: null,
    includedUsers: 0,
    canExtend: false,
    features: [
      "Everything in Pro",
      "Unlimited users",
      "SSO & advanced permissions",
      "Dedicated success manager",
      "Custom integrations & SLAs",
      "Managed connector fleet",
    ],
    cta: { label: "Contact sales", href: "mailto:sales@zynexav.com?subject=ZynexAV%20Enterprise" },
  },
];

function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-[760px] mb-10 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 mb-6 font-mono text-[13px] text-ink-300/60 uppercase tracking-[0.06em]">
            <span className="h-1 w-1 rounded-full bg-signal-500" />
            Pricing
          </span>
          <h2 className="text-[32px] md:text-[40px] leading-[1.08] tracking-[-0.024em] text-ink-300 font-medium">
            Simple pricing that scales with your team.
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] leading-[1.55] text-ink-300/65">
            Start with a plan, add seats whenever you grow — every extra user is a flat{" "}
            <span className="text-ink-300 font-medium">{inr(EXTRA_USER_PRICE)}/mo</span>. No hidden
            tiers, no per-feature paywalls. Pay annually and save 20%.
          </p>
        </motion.div>

        {/* Billing period toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex justify-center"
        >
          <div className="glass inline-flex items-center gap-1 rounded-full p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "h-9 px-5 rounded-full text-[13.5px] font-medium transition-all",
                !annual ? "glass-pill-active text-ink-300" : "text-ink-300/60 hover:text-ink-300"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "h-9 pl-5 pr-2 rounded-full text-[13.5px] font-medium transition-all inline-flex items-center gap-2",
                annual ? "glass-pill-active text-ink-300" : "text-ink-300/60 hover:text-ink-300"
              )}
            >
              Annual
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  annual ? "bg-signal-500 text-white" : "bg-signal-500/15 text-signal-700"
                )}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} annual={annual} />
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-300/50">
          Prices per month, exclusive of GST. Annual plans are billed once a year at 20% off.
          Extra users can be added or removed anytime.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan, index, annual }: { plan: Plan; index: number; annual: boolean }) {
  const [users, setUsers] = useState(plan.includedUsers);
  const extraUsers = Math.max(0, users - plan.includedUsers);

  const factor = annual ? 1 - ANNUAL_DISCOUNT : 1;
  const hasPrice = plan.basePrice !== null;

  // Undiscounted monthly total (for strikethrough reference)
  const origMonthly = hasPrice ? plan.basePrice! + extraUsers * EXTRA_USER_PRICE : 0;
  // Effective per-month figures for the selected billing period
  const effBase = hasPrice ? Math.round(plan.basePrice! * factor) : 0;
  const effExtra = Math.round(EXTRA_USER_PRICE * factor);
  const monthlyTotal = effBase + extraUsers * effExtra;
  const annualTotal = monthlyTotal * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col p-7 md:p-8 rounded-3xl",
        plan.highlight
          ? "glass-strong ring-1 ring-signal-500/30 shadow-[0_20px_60px_-24px_rgba(255,90,31,0.45)]"
          : "glass-card"
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-signal-500 text-white text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1 shadow-md">
          Most popular
        </span>
      )}

      {/* Name + tagline */}
      <div>
        <h3 className="text-[22px] font-medium tracking-[-0.014em] text-ink-300">{plan.name}</h3>
        <p className="mt-2 text-[14px] leading-[1.5] text-ink-300/60 min-h-[42px]">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="mt-6 pb-6 border-b border-bone-300/45">
        {hasPrice ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[40px] md:text-[44px] leading-none tracking-tight text-ink-300">
                {inr(monthlyTotal)}
              </span>
              <span className="text-[14px] text-ink-300/55">/ month</span>
            </div>

            {annual ? (
              <p className="mt-2 text-[12.5px] text-ink-300/55">
                <span className="line-through text-ink-300/40">{inr(origMonthly)}/mo</span>{" "}
                <span className="text-signal-700 font-medium">20% off</span> · billed annually at{" "}
                <span className="text-ink-300/75 font-medium">{inr(annualTotal)}/yr</span>
              </p>
            ) : (
              <p className="mt-2 text-[12.5px] text-ink-300/55">
                {inr(effBase)} base
                {extraUsers > 0 && (
                  <>
                    {" "}+ {extraUsers} extra {extraUsers === 1 ? "user" : "users"} × {inr(effExtra)}
                  </>
                )}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="font-display text-[40px] md:text-[44px] leading-none tracking-tight text-ink-300">
              Let&apos;s talk
            </div>
            <p className="mt-2 text-[12.5px] text-ink-300/55">Custom pricing for your organisation.</p>
          </>
        )}
      </div>

      {/* User extender */}
      {plan.canExtend ? (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-ink-300/70">
              Team size
              <span className="block text-[11.5px] text-ink-300/45">
                {plan.includedUsers} included · {inr(effExtra)} per extra user
              </span>
            </div>
            <div className="flex items-center gap-1 glass rounded-full p-1">
              <button
                type="button"
                onClick={() => setUsers((u) => Math.max(plan.includedUsers, u - 1))}
                disabled={users <= plan.includedUsers}
                className="h-7 w-7 rounded-full flex items-center justify-center text-ink-300/70 hover:bg-white/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Remove user"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[28px] text-center font-mono text-[15px] text-ink-300 tabular-nums">
                {users}
              </span>
              <button
                type="button"
                onClick={() => setUsers((u) => Math.min(999, u + 1))}
                className="h-7 w-7 rounded-full flex items-center justify-center text-ink-300/70 hover:bg-white/60 transition-colors"
                aria-label="Add user"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 text-[13px] text-ink-300/70">
          Team size
          <span className="block text-[11.5px] text-ink-300/45">Unlimited users</span>
        </div>
      )}

      {/* CTA */}
      <Link href={plan.cta.href} className="group mt-6">
        <span
          className={cn(
            "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-[14px] font-medium",
            plan.highlight ? "btn-glass-signal" : "btn-glass-primary"
          )}
        >
          {plan.cta.label}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </span>
      </Link>

      {/* Features */}
      <ul className="mt-7 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-ink-300/75">
            <span
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                plan.highlight ? "bg-signal-500/15 text-signal-700" : "bg-ink-300/8 text-ink-300/70"
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Layers,
  LineChart,
  Wrench,
  Cable,
  Network,
  Sparkles,
  ShieldCheck,
  Boxes,
  Cpu,
} from "lucide-react";
import { PrimaryPill } from "@/components/landing/hero";

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full bg-white border border-bone-300/60 px-4 py-1.5 text-[13px] font-medium text-ink-300">
            Core Features
          </div>
          <h2 className="mt-6 font-display font-bold tracking-[-0.04em] leading-[1.02] text-4xl sm:text-5xl md:text-6xl text-ink-300">
            Boost Productivity with These
            <br />
            Game-Changing Features
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LeadCard />
          <AnalyticsCard />
          <CollaborationCard />
        </div>
      </div>
    </section>
  );
}

/* ───────── Large dark feature card (BOQ / Projects) ───────── */
function LeadCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="relative lg:col-span-1 rounded-[28px] bg-ink-300 text-bone-100 p-7 sm:p-8 overflow-hidden min-h-[520px] flex flex-col"
    >
      <div className="h-11 w-11 rounded-2xl bg-bone-100/10 flex items-center justify-center mb-5">
        <Layers className="h-5 w-5 text-signal-500" strokeWidth={1.8} />
      </div>

      <h3 className="font-display text-2xl sm:text-[26px] font-bold tracking-[-0.02em] leading-tight">
        Projects &amp; BOQ Management
      </h3>
      <p className="mt-3 text-[14px] text-bone-100/60 leading-relaxed max-w-sm">
        Stay organised with room-wise BOQ tracking, live profitability and milestone-aware Gantt — every device, hour and cost in one view.
      </p>

      <ul className="mt-6 space-y-2.5 text-[14px]">
        {[
          "BOQ & commissioning tracking",
          "Real-time project profitability",
          "Vendor & procurement workflows",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <span className="h-4 w-4 rounded-sm bg-signal-500 flex items-center justify-center">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                <path d="M2 6.5L4.7 9 10 3.5" stroke="#0A0A0A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <PrimaryPill>Get Started</PrimaryPill>
      </div>

      {/* Mini dashboard mock anchored to bottom */}
      <div className="mt-8 relative flex-1 -mb-7 -mx-2 sm:-mx-3">
        <div className="absolute inset-x-2 sm:inset-x-3 top-0 rounded-t-2xl border border-bone-100/10 bg-bone-100 text-ink-300 p-3 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold">Income Tracker</div>
            <span className="text-[10px] text-ink-300/40 px-2 py-0.5 rounded-full bg-bone-100 border border-bone-300/60">
              Week ▾
            </span>
          </div>
          <svg viewBox="0 0 200 60" className="w-full h-[60px]" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="200" y2="50" stroke="#ddd6c8" strokeDasharray="2 3" />
            <path d="M0,40 L25,38 L50,30 L75,32 L100,20 L125,22 L150,12 L175,16 L200,8" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="20" r="3" fill="#FF5A1F" stroke="#fff" strokeWidth="1.2" />
          </svg>
          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-ink-300 text-bone-100 px-2 py-0.5 text-[10px] font-medium">
            $2,567
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── Light card — Analytics ───────── */
function AnalyticsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: 0.08 }}
      className="relative rounded-[28px] bg-bone-50 border border-bone-300/50 p-7 sm:p-8 min-h-[520px] flex flex-col"
    >
      <div className="h-11 w-11 rounded-2xl bg-white border border-bone-300/60 flex items-center justify-center mb-5">
        <LineChart className="h-5 w-5 text-ink-300" strokeWidth={1.8} />
      </div>

      <h3 className="font-display text-2xl font-bold tracking-[-0.02em] leading-tight text-ink-300">
        Advanced Analytics &amp;
        <br /> Reporting
      </h3>
      <p className="mt-3 text-[14px] text-ink-300/60 leading-relaxed">
        Pipeline, revenue, SLA, utilisation and customer health — live from your Neon-backed data warehouse.
      </p>

      {/* Mini weekly chart */}
      <div className="mt-auto rounded-2xl bg-white border border-bone-300/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold text-ink-300">Weekly Overview</div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-300 text-bone-100">20 views</span>
        </div>
        <div className="mt-3 h-[110px] flex items-end gap-2">
          {[28, 42, 18, 60, 35, 92, 50].map((h, i) => (
            <div key={i} className="flex-1 flex items-end h-full">
              <div
                className={`w-full rounded-t-md ${
                  i === 5 ? "bg-ink-300" : "bg-bone-300"
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-300/40 font-medium">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── Light card — Collaboration / AV-native tools ───────── */
function CollaborationCard() {
  const icons = [
    { Icon: Cable, tone: "bg-white" },
    { Icon: Cpu, tone: "bg-white" },
    { Icon: Network, tone: "bg-white" },
    { Icon: Wrench, tone: "bg-white" },
    { Icon: Sparkles, tone: "bg-ink-300 text-bone-100" },
    { Icon: ShieldCheck, tone: "bg-white" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: 0.16 }}
      className="relative rounded-[28px] bg-bone-50 border border-bone-300/50 p-7 sm:p-8 min-h-[520px] flex flex-col"
    >
      <div className="h-11 w-11 rounded-2xl bg-white border border-bone-300/60 flex items-center justify-center mb-5">
        <Boxes className="h-5 w-5 text-ink-300" strokeWidth={1.8} />
      </div>

      <h3 className="font-display text-2xl font-bold tracking-[-0.02em] leading-tight text-ink-300">
        AV-Native Tools &amp;
        <br /> Collaboration
      </h3>
      <p className="mt-3 text-[14px] text-ink-300/60 leading-relaxed">
        Rack builder, signal flow designer, device monitoring, AI proposals — every AV-specific workflow built in.
      </p>

      {/* Icon grid */}
      <div className="mt-auto grid grid-cols-3 gap-3">
        {icons.map(({ Icon, tone }, i) => (
          <div
            key={i}
            className={`aspect-square rounded-2xl ${tone} border border-bone-300/50 flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${tone.includes("ink-300") ? "" : "text-ink-300/80"}`} strokeWidth={1.7} />
          </div>
        ))}
      </div>

      <p className="mt-5 text-[13px] text-ink-300/55 leading-relaxed">
        We work better together with your stack — Crestron, Q-SYS, Extron, Biamp natively supported.
      </p>
    </motion.div>
  );
}

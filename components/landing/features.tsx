"use client";

import { motion } from "framer-motion";
import {
  Target,
  FolderKanban,
  LifeBuoy,
  Boxes,
  Cable,
  Network,
  Sparkles,
  FileText,
  ShoppingCart,
  Receipt,
  Activity,
  MonitorCheck,
} from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Target,
    title: "Sales Pipeline & Opportunities",
    desc: "Stage-aware kanban, AI deal scoring, quotation builder with live AV catalog pricing.",
    big: true,
  },
  {
    icon: FolderKanban,
    title: "AV Project Management",
    desc: "Room-wise BOQ tracking, Gantt timelines, milestones, real-time profitability.",
  },
  {
    icon: LifeBuoy,
    title: "Service Desk & AMC",
    desc: "SLA-aware tickets, preventive maintenance, technician dispatch, client portal.",
  },
  {
    icon: Boxes,
    title: "Inventory & RMA",
    desc: "Serial-number tracking, barcode scanning, multi-warehouse, device lifecycle.",
  },
  {
    icon: ShoppingCart,
    title: "Procurement",
    desc: "Vendor management, quote comparison, approval workflows, shipment tracking.",
  },
  {
    icon: Cable,
    title: "AV Rack Builder",
    desc: "Drag-and-drop rack layouts with auto-generated wiring and signal flow.",
    big: true,
  },
  {
    icon: Network,
    title: "Signal Flow Designer",
    desc: "Visual AV signal flows. Crestron, Q-SYS, Extron, Biamp integrations native.",
  },
  {
    icon: MonitorCheck,
    title: "Device Health Monitoring",
    desc: "Live IP tracking, uptime checks, DSP config storage, commissioning checklists.",
  },
  {
    icon: Receipt,
    title: "Billing & Subscriptions",
    desc: "Invoices, recurring billing, AMC contracts, Stripe payments, multi-currency.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 sm:py-40">
      <div className="container">
        <FadeIn className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-signal-400 font-medium">
            Built end-to-end
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Every part of your AV business — <span className="text-gradient">one platform.</span>
          </h2>
          <p className="mt-5 text-base text-white/55 leading-relaxed">
            From the first lead to the final commissioning checklist, ZynexAV brings every workflow your team runs into a single, beautifully designed CRM.
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(220px,_auto)]">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
                className={cn(
                  "group relative rounded-3xl p-6 lg:p-7 glass-card hover-lift overflow-hidden",
                  f.big && "lg:col-span-1 lg:row-span-2"
                )}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-signal-500/[0.08] via-transparent to-transparent" />
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-signal-500/60 to-transparent" />
                </div>

                <div className="relative flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center group-hover:border-signal-500/30 group-hover:bg-signal-500/[0.08] transition-all duration-500">
                      <Icon className="h-4.5 w-4.5 text-signal-400" strokeWidth={1.8} />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.desc}</p>

                  {f.big && (
                    <div className="mt-6 flex-1 flex items-end">
                      <FeatureVisual variant={i} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureVisual({ variant }: { variant: number }) {
  // Two distinct micro-visuals for the "big" cards
  if (variant === 0) {
    // Sales pipeline mini board
    return (
      <div className="relative w-full grid grid-cols-3 gap-2">
        {["Discovery", "Quote", "Won"].map((col, i) => (
          <div key={col} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-2">{col}</div>
            <div className="space-y-1.5">
              <div className="h-8 rounded-md bg-white/[0.04] border border-white/[0.04]" />
              {i === 0 && <div className="h-8 rounded-md bg-white/[0.04] border border-white/[0.04]" />}
              {i === 2 && (
                <div className="h-8 rounded-md bg-signal-500/15 border border-signal-500/30 flex items-center px-2 text-[10px] text-signal-400 font-mono">
                  $128k
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // Rack builder visual
  return (
    <div className="relative w-full">
      <div className="rounded-lg border border-white/[0.06] bg-ink-200/40 p-2 space-y-1">
        {[
          { u: "1U", label: "Q-SYS Core 110f", color: "from-signal-500 to-signal-700" },
          { u: "2U", label: "Crestron DM-NVX-360", color: "from-sky-500 to-sky-700" },
          { u: "1U", label: "Extron SMP 351", color: "from-emerald-500 to-emerald-700" },
          { u: "2U", label: "Biamp Tesira Forté", color: "from-violet-500 to-violet-700" },
        ].map((r, i) => (
          <div
            key={i}
            className={`relative flex items-center gap-2 rounded-md bg-gradient-to-r ${r.color} bg-opacity-15 border border-white/[0.06] px-2 py-1.5`}
          >
            <span className="text-[9px] text-white/50 font-mono">{r.u}</span>
            <span className="text-[10px] text-white font-medium">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

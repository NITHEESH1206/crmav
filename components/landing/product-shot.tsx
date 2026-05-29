"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShoppingCart,
  FileWarning,
  Boxes,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

/**
 * In-page mockup of the Mission Control dashboard — built in code rather than
 * a screenshot so it's crisp, theme-aware, and tiny in bundle size.
 */
export function ProductShot() {
  return (
    <section id="product" className="relative pb-24 md:pb-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="glass-card relative overflow-hidden"
        >
          {/* Mock topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-bone-300/45">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-bone-300/65" />
              <div className="h-2.5 w-2.5 rounded-full bg-bone-300/65" />
              <div className="h-2.5 w-2.5 rounded-full bg-bone-300/65" />
              <div className="ml-3 text-[11px] font-mono text-ink-300/50">
                zynexav.app / dashboard
              </div>
            </div>
            <div className="text-[10.5px] text-ink-300/40 font-medium uppercase tracking-[0.14em]">
              Mission Control
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-7 bg-bone-50/40 space-y-3">
            {/* Attention bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              <span className="text-[10px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold pr-2 shrink-0">
                Attention
              </span>
              <Chip icon={AlertTriangle} tone="danger" text="SLA breach · TKT-844 · 18m" />
              <Chip icon={ShoppingCart} tone="warning" text="PO #2147 · 2d late · $84k" />
              <Chip icon={FileWarning} tone="danger" text="INV-4521 · 47d overdue" />
              <Chip icon={Boxes} tone="warning" text="Crestron DM-NVX · low stock" />
            </div>

            {/* Row 1 — 4 mini widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <MiniWidget eyebrow="Today" title="Operations" value="3" sub="installs in progress" />
              <MiniWidget eyebrow="Pipeline" title="Open" value="$2.4M" sub="92% of Q target" tint />
              <MiniWidget eyebrow="Build" title="Utilization" value="78%" sub="14 techs · 12 on jobsite" />
              <MiniWidget
                eyebrow="AI Brief"
                title="Today"
                icon={Sparkles}
                lines={[
                  "Marriott NYC: 2 risk milestones",
                  "DBS commissioning Friday",
                ]}
              />
            </div>

            {/* Row 2 — 3 medium widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ListWidget
                title="At-risk projects"
                count={3}
                icon={AlertTriangle}
                items={[
                  { p: "Hilton Toronto", s: "Commissioning · HIGH", r: "$1.4M" },
                  { p: "DBS Singapore", s: "Installation · MED",   r: "$890k" },
                  { p: "ICC Mumbai",    s: "Engineering · MED",    r: "$620k" },
                ]}
              />
              <ListWidget
                title="Overdue invoices"
                count={6}
                icon={FileWarning}
                items={[
                  { p: "INV-4521 · Marriott",  s: "47d overdue", r: "$128k" },
                  { p: "INV-4498 · Walmart",   s: "22d overdue", r: "$64k" },
                  { p: "INV-4475 · Coupang",   s: "11d overdue", r: "$42k" },
                ]}
              />
              <ListWidget
                title="AMC renewals (90d)"
                count={5}
                icon={Shield}
                items={[
                  { p: "Marriott NYC · Premier", s: "expires 14d", r: "$8.4k/mo" },
                  { p: "DBS Singapore HQ",       s: "expires 32d", r: "$5.2k/mo" },
                  { p: "Westin Boston",          s: "expires 58d", r: "$3.8k/mo" },
                ]}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Chip({
  icon: Icon,
  tone,
  text,
}: {
  icon: typeof AlertTriangle;
  tone: "danger" | "warning";
  text: string;
}) {
  const tones = {
    danger:  "border-status-danger-fg/35 bg-status-danger-bg text-status-danger-fg",
    warning: "border-status-warning-fg/35 bg-status-warning-bg text-status-warning-fg",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap shrink-0 ${tones[tone]}`}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}

function MiniWidget({
  eyebrow,
  title,
  value,
  sub,
  tint,
  icon: Icon,
  lines,
}: {
  eyebrow: string;
  title: string;
  value?: string;
  sub?: string;
  tint?: boolean;
  icon?: typeof TrendingUp;
  lines?: string[];
}) {
  return (
    <div
      className={`rounded-2xl ${tint ? "glass-signal" : "glass-strong"} p-4`}
    >
      <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
        {Icon && <Icon className="h-3 w-3 text-signal-500" />}
        {eyebrow}
      </div>
      <div className="mt-1 text-[12px] font-semibold text-ink-300">{title}</div>
      {value && (
        <div className="mt-2 font-display text-[28px] tracking-tight text-ink-300 leading-none">
          {value}
        </div>
      )}
      {sub && <div className="mt-1 text-[10.5px] text-ink-300/55">{sub}</div>}
      {lines && (
        <ul className="mt-2 space-y-1">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-1.5 text-[10.5px] text-ink-300/80">
              <span className="font-mono text-[9.5px] text-signal-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListWidget({
  title,
  count,
  icon: Icon,
  items,
}: {
  title: string;
  count: number;
  icon: typeof AlertTriangle;
  items: { p: string; s: string; r: string }[];
}) {
  return (
    <div className="rounded-2xl glass-strong overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-bone-300/45">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-ink-300/55" />
          <div className="text-[12px] font-semibold text-ink-300">{title}</div>
        </div>
        <span className="text-[10px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100">
          {count}
        </span>
      </div>
      <ul className="px-2 py-1">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-bone-50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-status-warning-fg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-ink-300 truncate">{it.p}</div>
              <div className="text-[10.5px] text-ink-300/55 truncate">{it.s}</div>
            </div>
            <span className="text-[11px] font-mono text-ink-300/70 shrink-0">{it.r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

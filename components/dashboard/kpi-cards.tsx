"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  FolderKanban,
  LifeBuoy,
  Target,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { staggerContainer, staggerItem } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

type KPI = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  icon: LucideIcon;
  spark: number[];
};

export function KpiCards({
  revenueCents,
  activeProjects,
  openTickets,
  pipelineCents,
}: {
  revenueCents: number;
  activeProjects: number;
  openTickets: number;
  pipelineCents: number;
}) {
  const KPIS: KPI[] = [
    {
      label: "Total revenue (paid)",
      value: revenueCents / 100,
      prefix: "$",
      change: 18.2,
      icon: DollarSign,
      spark: [40, 45, 42, 50, 48, 56, 58, 64, 62, 70, 78, 84],
    },
    {
      label: "Active projects",
      value: activeProjects,
      change: 12.8,
      icon: FolderKanban,
      spark: [22, 24, 24, 28, 30, 32, 34, 38, 38, 42, 44, 47],
    },
    {
      label: "Open service tickets",
      value: openTickets,
      change: -22.3,
      icon: LifeBuoy,
      spark: [28, 26, 24, 22, 24, 20, 18, 16, 16, 14, 13, 12],
    },
    {
      label: "Pipeline value",
      value: pipelineCents / 100,
      prefix: "$",
      change: 24.6,
      icon: Target,
      spark: [44, 46, 50, 48, 54, 58, 62, 68, 72, 78, 82, 88],
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {KPIS.map((k) => (
        <KpiCard key={k.label} kpi={k} />
      ))}
    </motion.div>
  );
}

function KpiCard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon;
  const positive = kpi.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative rounded-2xl glass-card p-5 overflow-hidden hover:shadow-card-hover hover:border-aether-500/20"
    >
      <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-aether-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center group-hover:bg-aether-500/[0.08] group-hover:border-aether-500/30 transition-all">
          <Icon className="h-4 w-4 text-aether-400" strokeWidth={1.8} />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
            positive
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20"
          )}
        >
          <Trend className="h-3 w-3" />
          {positive ? "+" : ""}
          {kpi.change.toFixed(1)}%
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-white/45">{kpi.label}</div>
        <div className="font-display text-3xl font-semibold tracking-tight">
          <CountUp
            value={kpi.value}
            prefix={kpi.prefix ?? ""}
            suffix={kpi.suffix ?? ""}
            decimals={kpi.decimals ?? 0}
          />
        </div>
      </div>

      <div className="mt-4">
        <Sparkline data={kpi.spark} />
      </div>
    </motion.div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100 / (data.length - 1);
  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * w},${100 - ((p - min) / range) * 90 - 5}`)
    .join(" ");
  const area = `${path} L 100,100 L 0,100 Z`;
  const gradId = `spark-${data.join("")}`;

  return (
    <div className="relative h-10">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={path}
          fill="none"
          stroke="#ff8a33"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

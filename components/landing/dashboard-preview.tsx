"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  FolderKanban,
  LifeBuoy,
  TrendingUp,
  ArrowUpRight,
  Activity,
  DollarSign,
  Users,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative rounded-3xl border border-white/[0.08] bg-ink-100/60 backdrop-blur-2xl overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
      {/* Top window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-ink-200/60">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="mx-auto rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-white/40 font-mono">
          app.ZynexAV.com/dashboard
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0 min-h-[480px]">
        {/* Sidebar */}
        <div className="col-span-2 border-r border-white/[0.06] bg-ink-200/40 p-3 hidden md:block">
          <div className="space-y-1">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Target, label: "Opportunities" },
              { icon: FolderKanban, label: "Projects" },
              { icon: LifeBuoy, label: "Service" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.06 }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                    item.active
                      ? "bg-signal-500/15 text-signal-400 ring-1 ring-signal-500/30"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main */}
        <div className="col-span-12 md:col-span-10 p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Revenue", value: "$1.42M", change: "+18.2%", icon: DollarSign },
              { label: "Active Projects", value: "47", change: "+6", icon: FolderKanban },
              { label: "Open Tickets", value: "12", change: "-3", icon: LifeBuoy },
              { label: "Pipeline", value: "$3.8M", change: "+24.6%", icon: TrendingUp },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-6 w-6 rounded-md bg-signal-500/15 flex items-center justify-center">
                      <Icon className="h-3 w-3 text-signal-400" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">{kpi.change}</span>
                  </div>
                  <div className="text-lg font-semibold tracking-tight">{kpi.value}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{kpi.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Chart + side */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-white/40">Pipeline Velocity</div>
                  <div className="text-base font-semibold">Last 12 weeks</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-signal-400">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+32.4%</span>
                </div>
              </div>
              <MiniChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.45 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="text-xs text-white/40 mb-3">Active Technicians</div>
              <div className="space-y-2.5">
                {[
                  { name: "M. Chen", task: "Hilton Boardroom", color: "from-signal-500 to-signal-700" },
                  { name: "L. Rivera", task: "Westin DSP recom.", color: "from-sky-500 to-sky-700" },
                  { name: "A. Patel", task: "AMC service call", color: "from-emerald-500 to-emerald-700" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[10px] font-semibold`}>
                      {t.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium truncate">{t.name}</div>
                      <div className="text-[10px] text-white/40 truncate">{t.task}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
              <Activity className="h-3 w-3" />
              <span>Realtime Activity</span>
            </div>
            <div className="space-y-2">
              {[
                "PO #2147 approved · Crestron Flex Mini Bar — $14,820",
                "Project Hilton Garden Inn moved to Commissioning",
                "Service Ticket #844 SLA met by L. Rivera (1h 12m)",
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 + i * 0.1 }}
                  className="flex items-center gap-2 text-[11px] text-white/55"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-signal-500 shadow-glow-sm" />
                  <span>{line}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [40, 36, 52, 48, 64, 58, 72, 68, 82, 78, 92, 88];
  const max = Math.max(...points);
  const w = 100 / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * w},${100 - (p / max) * 80}`)
    .join(" ");
  const area = `${path} L 100,100 L 0,100 Z`;

  return (
    <div className="relative h-32">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8a33" />
            <stop offset="100%" stopColor="#ff6b00" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#chart-gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#chart-stroke)"
          strokeWidth="0.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.4, duration: 1.6, ease: "easeInOut" }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

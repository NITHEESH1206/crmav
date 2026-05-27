"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Building2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icon keys map — pass a string from server, resolve to a component on the client.
// Necessary because Lucide icon components can't cross the server→client RSC boundary.
const STAT_ICONS = {
  dollar: DollarSign,
  trending: TrendingUp,
  building: Building2,
  wrench: Wrench,
} as const;
type StatIconKey = keyof typeof STAT_ICONS;
import { formatCompact } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background: "rgba(11,11,13,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
};

// ── 1. Revenue trend ─────────────────────────────────────────────────────
export function RevenueTrendCard({ data }: { data: { label: string; billed: number; paid: number }[] }) {
  const total = data.reduce((s, m) => s + m.paid, 0);
  const lastMonth = data[data.length - 1]?.paid ?? 0;
  const prevMonth = data[data.length - 2]?.paid ?? 0;
  const change = prevMonth === 0 ? 0 : Math.round(((lastMonth - prevMonth) / prevMonth) * 100);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Revenue trend</CardTitle>
          <p className="text-xs text-white/45 mt-1">Billed vs. paid — last 12 months</p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold tracking-tight text-gradient">
            ${formatCompact(total)}
          </div>
          <Badge variant={change >= 0 ? "success" : "destructive"} className="gap-1 mt-1">
            <ArrowUpRight className={`h-3 w-3 ${change < 0 ? "rotate-90" : ""}`} />
            {change >= 0 ? "+" : ""}{change}% MoM
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g-billed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7d3f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#ff5a1f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-paid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4f2ec" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#f4f2ec" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${formatCompact(v as number)}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "rgba(244,242,236,0.5)" }}
                formatter={(v: number) => [`$${formatCompact(v)}`, ""]} />
              <Area type="monotone" dataKey="billed" stroke="rgba(244,242,236,0.4)" strokeWidth={1.5} fill="url(#g-paid)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="paid" stroke="#ff7d3f" strokeWidth={2.2} fill="url(#g-billed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 2. Pipeline funnel ───────────────────────────────────────────────────
export function PipelineFunnelCard({ data }: { data: { stage: string; count: number; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalCount = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline funnel</CardTitle>
        <p className="text-xs text-white/45 mt-1">{totalCount} deals · by stage</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((row, i) => {
          const width = Math.max(10, (row.value / maxValue) * 100);
          return (
            <motion.div
              key={row.stage}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white/75 font-medium">{row.stage}</span>
                  <span className="text-white/35 font-mono">{row.count}</span>
                </div>
                <span className="text-white/55 font-mono">${formatCompact(row.value)}</span>
              </div>
              <div className="relative h-7 rounded-md bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="h-full rounded-md bg-gradient-to-r from-signal-500/70 via-signal-500/40 to-signal-500/10 border-r border-signal-500/40 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-shine bg-[length:200%_100%] opacity-30 animate-shimmer" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── 3. Project profitability ─────────────────────────────────────────────
export function ProfitabilityCard({ data }: { data: { name: string; margin: number; value: number }[] }) {
  const avg = data.length === 0 ? 0 : Math.round(data.reduce((s, p) => s + p.margin, 0) / data.length);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Project profitability</CardTitle>
          <p className="text-xs text-white/45 mt-1">Gross margin % by project</p>
        </div>
        <Badge variant="success" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {avg}% avg
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} angle={-15} dy={6} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Margin"]} />
              <Bar dataKey="margin" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.margin >= 40 ? "#ff7d3f" : d.margin >= 30 ? "#ff5a1f" : d.margin >= 20 ? "#b8350c" : "#7a705f"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 4. SLA compliance trend ──────────────────────────────────────────────
export function SLAComplianceCard({ data }: { data: { label: string; compliance: number }[] }) {
  const latest = data[data.length - 1]?.compliance ?? 0;
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Service SLA compliance</CardTitle>
          <p className="text-xs text-white/45 mt-1">% of tickets resolved within SLA · last 12 weeks</p>
        </div>
        <Badge variant={latest >= 90 ? "success" : latest >= 75 ? "warning" : "destructive"}>
          {latest}% this week
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g-sla" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Compliance"]} />
              <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 5. Technician utilization ────────────────────────────────────────────
export function UtilizationCard({ data }: { data: { name: string; utilization: number; billable: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician utilization</CardTitle>
        <p className="text-xs text-white/45 mt-1">Billable hours / 40h target · this week</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && <div className="text-xs text-white/40 italic">No time entries this week.</div>}
        {data.map((u, i) => (
          <motion.div
            key={u.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/85 font-medium">{u.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/45 font-mono">{u.billable}h</span>
                <span className={`font-mono font-semibold ${u.utilization >= 80 ? "text-emerald-400" : u.utilization >= 50 ? "text-signal-400" : "text-amber-400"}`}>
                  {u.utilization}%
                </span>
              </div>
            </div>
            <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(u.utilization, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`h-full rounded-full ${u.utilization >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : u.utilization >= 50 ? "bg-gradient-to-r from-signal-600 to-signal-400" : "bg-gradient-to-r from-amber-600 to-amber-400"}`}
              />
              {u.utilization > 100 && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse" />
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── 6. Customer health distribution ──────────────────────────────────────
const HEALTH_TONE: Record<string, string> = {
  red: "#ef4444",
  amber: "#f59e0b",
  signal: "#ff7d3f",
  emerald: "#10b981",
};

export function HealthDistributionCard({ data }: { data: { range: string; count: number; value: number; tone: string }[] }) {
  const total = data.reduce((s, b) => s + b.count, 0);
  const healthy = data.filter((b) => b.tone === "signal" || b.tone === "emerald").reduce((s, b) => s + b.count, 0);
  const pctHealthy = total === 0 ? 0 : Math.round((healthy / total) * 100);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Customer health</CardTitle>
          <p className="text-xs text-white/45 mt-1">Account distribution by health score</p>
        </div>
        <Badge variant={pctHealthy >= 70 ? "success" : "warning"}>{pctHealthy}% healthy</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(_v: number, _n, item) => {
                  const row = (item.payload ?? {}) as { count: number; value: number };
                  return [
                    `${row.count} accounts · $${formatCompact(row.value)}`,
                    "Range",
                  ];
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={HEALTH_TONE[d.tone] ?? "#ff5a1f"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Top stats strip ──────────────────────────────────────────────────────
export function ReportStat({
  label,
  value,
  iconKey,
}: {
  label: string;
  value: string;
  iconKey?: StatIconKey;
}) {
  const Icon = iconKey ? STAT_ICONS[iconKey] : null;
  return (
    <Card>
      <CardContent className="p-5">
        {Icon && (
          <div className="h-9 w-9 rounded-xl border bg-signal-500/10 border-signal-500/30 flex items-center justify-center mb-3">
            <Icon className="h-4 w-4 text-signal-400" />
          </div>
        )}
        <div className="text-xs text-white/45">{label}</div>
        <div className="font-display text-3xl font-semibold tracking-tight mt-1 text-gradient">{value}</div>
      </CardContent>
    </Card>
  );
}

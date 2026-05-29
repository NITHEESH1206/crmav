"use client";

import { AlertTriangle, ShoppingCart, FileWarning, Boxes, Shield, Users, TrendingUp, Calendar } from "lucide-react";
import { cn, formatCompact, formatDate } from "@/lib/utils";
import { WidgetCard, WidgetRow, WidgetEmpty } from "./widget-card";

type Project = {
  id: string;
  name: string;
  phase: string;
  riskLevel: string;
  contractValueCents: number;
  account: { name: string } | null;
};

type PO = {
  id: string;
  number: string;
  totalCents: number;
  expectedDate: Date | null;
  vendor: { name: string };
};

type Invoice = {
  id: string;
  number: string;
  totalCents: number;
  dueAt: Date | null;
  account: { name: string } | null;
};

type Inv = {
  id: string;
  stock: number;
  reorderLevel: number;
  catalogItem: { name: string; brand: string; sku: string };
};

type AMC = {
  id: string;
  endDate: Date;
  monthlyValueCents: number;
  tier: string;
  account: { name: string };
};

function daysUntil(date: Date) {
  return Math.floor((+date - +new Date()) / 86_400_000);
}
function daysOverdue(date: Date) {
  return Math.max(0, Math.floor((+new Date() - +date) / 86_400_000));
}

/* ─── At-risk projects ─── */
export function AtRiskProjectsWidget({ projects }: { projects: Project[] }) {
  return (
    <WidgetCard
      icon={AlertTriangle}
      eyebrow="Build"
      title="At-risk projects"
      count={projects.length}
      href="/projects?risk=high"
      tone="warning"
    >
      {projects.length === 0 ? (
        <WidgetEmpty message="No projects at risk." />
      ) : (
        projects.map((p) => (
          <WidgetRow
            key={p.id}
            href={`/projects?project=${p.id}`}
            toneDot={p.riskLevel === "HIGH" ? "danger" : "warning"}
            primary={p.name}
            secondary={`${p.account?.name ?? "—"} · ${p.phase.toLowerCase()}`}
            trailing={`$${formatCompact(p.contractValueCents / 100)}`}
          />
        ))
      )}
    </WidgetCard>
  );
}

/* ─── Delayed procurement ─── */
export function DelayedProcurementWidget({ pos }: { pos: PO[] }) {
  return (
    <WidgetCard
      icon={ShoppingCart}
      eyebrow="Operate"
      title="Delayed procurement"
      count={pos.length}
      href="/procurement?status=delayed"
      tone="warning"
    >
      {pos.length === 0 ? (
        <WidgetEmpty message="All POs on schedule." />
      ) : (
        pos.map((po) => {
          const late = po.expectedDate ? daysOverdue(po.expectedDate) : 0;
          return (
            <WidgetRow
              key={po.id}
              href={`/procurement?po=${po.id}`}
              toneDot={late > 5 ? "danger" : "warning"}
              primary={`${po.number} · ${po.vendor.name}`}
              secondary={
                po.expectedDate
                  ? `Expected ${formatDate(po.expectedDate, { month: "short", day: "numeric" })} · ${late}d late`
                  : "No ETA"
              }
              trailing={`$${formatCompact(po.totalCents / 100)}`}
            />
          );
        })
      )}
    </WidgetCard>
  );
}

/* ─── Overdue invoices ─── */
export function OverdueInvoicesWidget({
  items,
  totalCents,
  totalCount,
}: {
  items: Invoice[];
  totalCents: number;
  totalCount: number;
}) {
  return (
    <WidgetCard
      icon={FileWarning}
      eyebrow="Finance"
      title="Overdue invoices"
      count={totalCount}
      href="/billing?status=overdue"
      tone="danger"
      footer={
        totalCount > 0
          ? `Outstanding · $${formatCompact(totalCents / 100)} across ${totalCount} invoices`
          : undefined
      }
    >
      {items.length === 0 ? (
        <WidgetEmpty message="No overdue invoices." />
      ) : (
        items.map((inv) => (
          <WidgetRow
            key={inv.id}
            href={`/billing?invoice=${inv.id}`}
            toneDot={(inv.dueAt && daysOverdue(inv.dueAt) > 30) ? "danger" : "warning"}
            primary={`${inv.number} · ${inv.account?.name ?? "—"}`}
            secondary={inv.dueAt ? `${daysOverdue(inv.dueAt)}d overdue` : "—"}
            trailing={`$${formatCompact(inv.totalCents / 100)}`}
          />
        ))
      )}
    </WidgetCard>
  );
}

/* ─── Low stock ─── */
export function LowStockWidget({ items, totalLow }: { items: Inv[]; totalLow: number }) {
  return (
    <WidgetCard
      icon={Boxes}
      eyebrow="Operate"
      title="Low stock"
      count={totalLow}
      href="/inventory?filter=low-stock"
      tone="warning"
    >
      {items.length === 0 ? (
        <WidgetEmpty message="All stock above reorder threshold." />
      ) : (
        items.map((i) => {
          const ratio = i.stock / Math.max(1, i.reorderLevel);
          return (
            <WidgetRow
              key={i.id}
              href={`/inventory?sku=${i.catalogItem.sku}`}
              toneDot={ratio < 0.4 ? "danger" : "warning"}
              primary={i.catalogItem.name}
              secondary={`${i.catalogItem.brand} · reorder ${i.reorderLevel}`}
              trailing={`${i.stock}`}
            />
          );
        })
      )}
    </WidgetCard>
  );
}

/* ─── AMC renewals ─── */
export function AMCRenewalsWidget({
  items,
  totalMrrCents,
}: {
  items: AMC[];
  totalMrrCents: number;
}) {
  return (
    <WidgetCard
      icon={Shield}
      eyebrow="Service"
      title="AMC renewals (90d)"
      count={items.length}
      href="/service?filter=amc-expiring"
      tone="info"
      footer={
        items.length > 0
          ? `MRR at renewal · $${formatCompact(totalMrrCents / 100)}/mo across ${items.length} contracts`
          : undefined
      }
    >
      {items.length === 0 ? (
        <WidgetEmpty message="No AMCs renewing in 90 days." />
      ) : (
        items.map((amc) => (
          <WidgetRow
            key={amc.id}
            href={`/service?amc=${amc.id}`}
            toneDot="info"
            primary={amc.account.name}
            secondary={`${amc.tier.toLowerCase()} · expires ${formatDate(amc.endDate, { month: "short", day: "numeric" })}`}
            trailing={`${daysUntil(amc.endDate)}d`}
          />
        ))
      )}
    </WidgetCard>
  );
}

/* ─── Today's ops ─── */
export function TodaysOpsWidget({
  installs,
  amcVisits,
  openCommissioningProjects,
  commissioningTasks,
}: {
  installs: number;
  amcVisits: number;
  openCommissioningProjects: number;
  commissioningTasks: number;
}) {
  return (
    <WidgetCard icon={Calendar} eyebrow="Today" title="Operations" href="/calendar">
      <div className="grid grid-cols-2 gap-2 p-2">
        {[
          { label: "Installs in progress", value: installs, href: "/calendar?type=install" },
          { label: "AMC visits today", value: amcVisits, href: "/calendar?type=amc" },
          { label: "Commissioning projects", value: openCommissioningProjects, href: "/projects?phase=commissioning" },
          { label: "Open tasks due today", value: commissioningTasks, href: "/todos?due=today" },
        ].map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="rounded-2xl bg-white/55 hover:bg-white/80 backdrop-blur-md border border-white/60 p-3.5 transition-all hover:-translate-y-px shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(10,10,10,0.03)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_12px_-4px_rgba(10,10,10,0.1)]"
          >
            <div className="text-display-lg font-display tracking-tight text-ink-300 leading-none">
              {s.value}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-300/60 leading-snug">{s.label}</div>
          </a>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ─── Pipeline & revenue ─── */
export function PipelineRevenueWidget({
  openPipelineCents,
  openCount,
  closingThisWeek,
  revenueThisMonthCents,
}: {
  openPipelineCents: number;
  openCount: number;
  closingThisWeek: number;
  revenueThisMonthCents: number;
}) {
  return (
    <WidgetCard icon={TrendingUp} eyebrow="Sell · Finance" title="Pipeline & revenue" href="/opportunities" tone="signal">
      <div className="p-3 space-y-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-300/50">
            Open pipeline
          </div>
          <div className="text-display-lg font-display tracking-tight text-signal-700 leading-tight mt-0.5">
            ${formatCompact(openPipelineCents / 100)}
          </div>
          <div className="text-[11px] text-ink-300/55 mt-0.5">
            {openCount} active · {closingThisWeek} closing this week
          </div>
        </div>
        <div className="pt-3 border-t border-signal-500/15">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-300/50">
            Revenue MTD
          </div>
          <div className="text-heading-lg font-display tracking-tight text-ink-300 mt-0.5">
            ${formatCompact(revenueThisMonthCents / 100)}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ─── Team utilization ─── */
export function TeamUtilizationWidget({
  avgUtilization,
  onJobsite,
  totalMembers,
}: {
  avgUtilization: number;
  onJobsite: number;
  totalMembers: number;
}) {
  const util = Math.max(0, Math.min(100, avgUtilization));
  return (
    <WidgetCard icon={Users} eyebrow="Build · Service" title="Team utilization" href="/time-entries">
      <div className="p-3 space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/50 font-semibold">
              Avg utilization (7d)
            </span>
            <span className="text-[13px] font-mono text-ink-300/85">{util}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                util >= 85
                  ? "bg-gradient-to-r from-signal-400 to-signal-600 shadow-[0_0_8px_rgba(255,90,31,0.4)]"
                  : "bg-gradient-to-r from-ink-200 to-ink-300"
              )}
              style={{ width: `${util}%` }}
            />
          </div>
        </div>
        <div className="pt-3 border-t border-bone-300/45 flex items-baseline justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/50 font-semibold">
              On jobsite now
            </div>
            <div className="text-heading-lg font-display tracking-tight text-ink-300 mt-0.5">
              {onJobsite} / {totalMembers}
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

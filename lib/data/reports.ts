import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

// ─── 1. Revenue by month (last 12 months) ────────────────────────────────
export async function revenueByMonth() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setMonth(start.getMonth() - 11);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId, issuedAt: { gte: start } },
    select: { issuedAt: true, totalCents: true, status: true },
  });

  const months: { key: string; label: string; billed: number; paid: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      billed: 0,
      paid: 0,
    });
  }

  for (const inv of invoices) {
    if (!inv.issuedAt) continue;
    const key = `${inv.issuedAt.getFullYear()}-${String(inv.issuedAt.getMonth() + 1).padStart(2, "0")}`;
    const month = months.find((m) => m.key === key);
    if (month) {
      month.billed += inv.totalCents / 100;
      if (inv.status === "PAID") month.paid += inv.totalCents / 100;
    }
  }

  return months.map((m) => ({ label: m.label, billed: Math.round(m.billed), paid: Math.round(m.paid) }));
}

// ─── 2. Pipeline funnel with counts + value ──────────────────────────────
export async function pipelineFunnelDetail() {
  const workspaceId = await getCurrentWorkspaceId();
  const groups = await prisma.opportunity.groupBy({
    by: ["stage"],
    where: { workspaceId },
    _count: { _all: true },
    _sum: { valueCents: true },
  });

  const ORDER = ["DISCOVERY", "SITE_SURVEY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"] as const;
  const LABELS: Record<string, string> = {
    DISCOVERY: "Discovery",
    SITE_SURVEY: "Site Survey",
    PROPOSAL: "Proposal",
    NEGOTIATION: "Negotiation",
    CLOSED_WON: "Closed Won",
  };

  return ORDER.map((stage) => {
    const g = groups.find((x) => x.stage === stage);
    return {
      stage: LABELS[stage],
      count: g?._count._all ?? 0,
      value: Math.round((g?._sum.valueCents ?? 0) / 100),
    };
  });
}

// ─── 3. Project profitability (margin %) ─────────────────────────────────
export async function projectProfitability() {
  const workspaceId = await getCurrentWorkspaceId();
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: { boqItems: { include: { catalogItem: true } } },
    orderBy: { contractValueCents: "desc" },
  });
  return projects.map((p) => {
    const cost = p.boqItems.reduce(
      (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
      0
    );
    const margin =
      p.contractValueCents > 0
        ? Math.round(((p.contractValueCents - cost) / p.contractValueCents) * 100)
        : 0;
    return {
      name: p.name.length > 18 ? p.name.slice(0, 16) + "…" : p.name,
      margin: Math.max(0, margin),
      value: p.contractValueCents / 100,
      phase: p.phase,
    };
  });
}

// ─── 4. SLA compliance trend (last 12 weeks) ────────────────────────────
export async function slaComplianceTrend() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7 * 12);

  const tickets = await prisma.serviceTicket.findMany({
    where: {
      workspaceId,
      resolvedAt: { not: null, gte: start },
    },
    select: { createdAt: true, slaDueAt: true, resolvedAt: true },
  });

  const weeks: { key: string; label: string; met: number; missed: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    weeks.push({ key, label: key, met: 0, missed: 0 });
  }

  for (const t of tickets) {
    if (!t.resolvedAt || !t.slaDueAt) continue;
    const weekIdx = Math.floor((t.resolvedAt.getTime() - start.getTime()) / (7 * 86_400_000));
    if (weekIdx < 0 || weekIdx >= 12) continue;
    if (t.resolvedAt <= t.slaDueAt) weeks[weekIdx].met++;
    else weeks[weekIdx].missed++;
  }

  return weeks.map((w) => {
    const total = w.met + w.missed;
    return {
      label: w.label,
      compliance: total === 0 ? 100 : Math.round((w.met / total) * 100),
      met: w.met,
      missed: w.missed,
    };
  });
}

// ─── 5. Technician utilization (week) ────────────────────────────────────
export async function technicianUtilization() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7);

  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId, date: { gte: start } },
    include: { user: true },
  });

  const byUser = new Map<string, { name: string; total: number; billable: number }>();
  for (const e of entries) {
    const cur = byUser.get(e.userId) ?? { name: e.user.name, total: 0, billable: 0 };
    cur.total += e.minutes;
    if (e.billable) cur.billable += e.minutes;
    byUser.set(e.userId, cur);
  }

  const TARGET = 2400; // 40h * 60min
  return Array.from(byUser.values())
    .map((u) => ({
      name: u.name.split(" ")[0] + " " + (u.name.split(" ")[1]?.[0] ?? ""),
      utilization: Math.round((u.billable / TARGET) * 100),
      billable: +(u.billable / 60).toFixed(1),
      total: +(u.total / 60).toFixed(1),
    }))
    .sort((a, b) => b.utilization - a.utilization);
}

// ─── 6. Customer health distribution ────────────────────────────────────
export async function customerHealthDistribution() {
  const workspaceId = await getCurrentWorkspaceId();
  const accounts = await prisma.account.findMany({
    where: { workspaceId },
    select: { healthScore: true, tier: true, ltvCents: true },
  });

  const buckets = [
    { range: "0–40", min: 0, max: 40, count: 0, value: 0, tone: "red" },
    { range: "41–60", min: 41, max: 60, count: 0, value: 0, tone: "amber" },
    { range: "61–80", min: 61, max: 80, count: 0, value: 0, tone: "signal" },
    { range: "81–100", min: 81, max: 100, count: 0, value: 0, tone: "emerald" },
  ];

  for (const a of accounts) {
    const b = buckets.find((b) => a.healthScore >= b.min && a.healthScore <= b.max);
    if (b) {
      b.count++;
      b.value += a.ltvCents / 100;
    }
  }

  return buckets.map((b) => ({
    range: b.range,
    count: b.count,
    value: Math.round(b.value),
    tone: b.tone,
  }));
}

// ─── Top-line summary ────────────────────────────────────────────────────
export async function reportsSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [rev, projects, accounts, tickets] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: "PAID" },
      _sum: { totalCents: true },
    }),
    prisma.project.findMany({
      where: { workspaceId },
      include: { boqItems: { include: { catalogItem: true } } },
    }),
    prisma.account.count({ where: { workspaceId } }),
    prisma.serviceTicket.count({ where: { workspaceId, resolvedAt: { not: null } } }),
  ]);
  const margins = projects.map((p) => {
    const cost = p.boqItems.reduce(
      (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
      0
    );
    return p.contractValueCents === 0 ? 0 : ((p.contractValueCents - cost) / p.contractValueCents) * 100;
  });
  const avgMargin =
    margins.length === 0 ? 0 : margins.reduce((s, m) => s + m, 0) / margins.length;
  return {
    revenueYtdCents: rev._sum.totalCents ?? 0,
    avgMargin: +avgMargin.toFixed(1),
    activeAccounts: accounts,
    resolvedTickets: tickets,
  };
}

// Legacy aliases (still used by older /reports compile path)
export async function projectMarginData() {
  return (await projectProfitability()).slice(0, 6).map((p) => ({ name: p.name, margin: p.margin }));
}
export async function serviceMix() {
  const workspaceId = await getCurrentWorkspaceId();
  const rooms = await prisma.room.findMany({ where: { workspaceId } });
  const counts = rooms.reduce<Record<string, number>>((acc, r) => {
    acc[r.roomType] = (acc[r.roomType] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

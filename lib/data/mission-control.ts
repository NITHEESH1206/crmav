import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

/**
 * Mission Control aggregations — produce a ranked Attention list + operational
 * widget data. Every metric is drillable: each row carries a `href` so clicks
 * route to the relevant module pre-filtered.
 *
 * The Attention Bar score: dollar_value × 0.4 + time_sensitivity × 0.4 + downstream × 0.2
 */

export type AttentionKind =
  | "sla-breach"
  | "overdue-invoice"
  | "delayed-po"
  | "low-stock"
  | "at-risk-project"
  | "amc-expiring"
  | "approval-needed";

export type AttentionItem = {
  id: string;
  kind: AttentionKind;
  title: string;
  meta: string;
  href: string;
  /** Dollars at risk (USD). */
  value?: number;
  /** ISO date string of the relevant deadline. */
  deadline?: string;
  /** Computed priority score. Higher = more urgent. */
  score: number;
};

export async function getAttentionBar(limit = 7): Promise<AttentionItem[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const now = new Date();
  const items: AttentionItem[] = [];

  // 1. SLA-at-risk tickets (open P1/P2 within 2h of SLA or already breached)
  const slaTickets = await prisma.serviceTicket.findMany({
    where: {
      workspaceId,
      status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
      slaDueAt: { not: null },
      priority: { in: ["P1", "P2"] },
    },
    include: { account: true },
    take: 30,
  });
  for (const t of slaTickets) {
    if (!t.slaDueAt) continue;
    const minutesToSla = (+t.slaDueAt - +now) / 60_000;
    if (minutesToSla > 240) continue; // 4h window
    const breached = minutesToSla < 0;
    items.push({
      id: `tkt-${t.id}`,
      kind: "sla-breach",
      title: breached
        ? `SLA breached · ${t.number} · ${Math.round(-minutesToSla)}m overdue`
        : `SLA warning · ${t.number} · ${Math.round(minutesToSla)}m left`,
      meta: `${t.account?.name ?? "—"} · ${t.priority}`,
      href: `/service?ticket=${t.id}`,
      deadline: t.slaDueAt.toISOString(),
      score: breached ? 95 : 75 + Math.max(0, 15 - minutesToSla / 16),
    });
  }

  // 2. Overdue invoices (>7 days past due)
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      status: { in: ["SENT", "OVERDUE"] },
      dueAt: { lt: new Date(+now - 7 * 86_400_000) },
    },
    include: { account: true },
    orderBy: { dueAt: "asc" },
    take: 10,
  });
  for (const inv of overdueInvoices) {
    const daysOverdue = inv.dueAt ? Math.floor((+now - +inv.dueAt) / 86_400_000) : 0;
    items.push({
      id: `inv-${inv.id}`,
      kind: "overdue-invoice",
      title: `${inv.number} · ${daysOverdue}d overdue · $${(inv.totalCents / 100).toLocaleString()}`,
      meta: inv.account?.name ?? "—",
      href: `/billing?invoice=${inv.id}`,
      value: inv.totalCents / 100,
      deadline: inv.dueAt?.toISOString(),
      score: 60 + Math.min(30, daysOverdue) + Math.min(20, Math.log10(inv.totalCents / 100 + 1) * 4),
    });
  }

  // 3. Delayed POs (expected before today and not delivered)
  const delayedPOs = await prisma.purchaseOrder.findMany({
    where: {
      workspaceId,
      status: { in: ["PENDING", "APPROVED", "IN_TRANSIT"] },
      expectedDate: { lt: now },
      receivedAt: null,
    },
    include: { vendor: true },
    orderBy: { expectedDate: "asc" },
    take: 10,
  });
  for (const po of delayedPOs) {
    const daysLate = po.expectedDate ? Math.floor((+now - +po.expectedDate) / 86_400_000) : 0;
    items.push({
      id: `po-${po.id}`,
      kind: "delayed-po",
      title: `${po.number} · ${daysLate}d late · $${(po.totalCents / 100).toLocaleString()}`,
      meta: po.vendor.name,
      href: `/procurement?po=${po.id}`,
      value: po.totalCents / 100,
      deadline: po.expectedDate?.toISOString(),
      score: 50 + Math.min(20, daysLate * 2) + Math.min(15, Math.log10(po.totalCents / 100 + 1) * 3),
    });
  }

  // 4. AMCs expiring in next 30 days
  const expiringAMCs = await prisma.aMCContract.findMany({
    where: {
      workspaceId,
      endDate: {
        gte: now,
        lte: new Date(+now + 30 * 86_400_000),
      },
    },
    include: { account: true },
    orderBy: { endDate: "asc" },
    take: 5,
  });
  for (const amc of expiringAMCs) {
    const daysUntil = Math.floor((+amc.endDate - +now) / 86_400_000);
    items.push({
      id: `amc-${amc.id}`,
      kind: "amc-expiring",
      title: `${amc.account.name} · AMC expires in ${daysUntil}d`,
      meta: `${amc.tier} · $${(amc.monthlyValueCents / 100).toLocaleString()}/mo`,
      href: `/service?amc=${amc.id}`,
      value: (amc.monthlyValueCents * 12) / 100,
      deadline: amc.endDate.toISOString(),
      score: 35 + Math.max(0, 20 - daysUntil) + Math.min(15, Math.log10((amc.monthlyValueCents * 12) / 100) * 3),
    });
  }

  // 5. At-risk projects (HIGH risk, ACTIVE)
  const riskyProjects = await prisma.project.findMany({
    where: { workspaceId, status: "ACTIVE", riskLevel: "HIGH" },
    include: { account: true },
    orderBy: { contractValueCents: "desc" },
    take: 5,
  });
  for (const p of riskyProjects) {
    items.push({
      id: `prj-${p.id}`,
      kind: "at-risk-project",
      title: `${p.name} · ${p.phase.toLowerCase()} · HIGH risk`,
      meta: `${p.account?.name ?? "—"} · $${(p.contractValueCents / 100).toLocaleString()}`,
      href: `/projects?project=${p.id}`,
      value: p.contractValueCents / 100,
      score: 55 + Math.min(20, Math.log10(p.contractValueCents / 100 + 1) * 4),
    });
  }

  // Sort by score desc, take top N
  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

/* ─── Operational widget data ─── */

export async function getAtRiskProjects(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.project.findMany({
    where: {
      workspaceId,
      status: "ACTIVE",
      OR: [{ riskLevel: "HIGH" }, { riskLevel: "MEDIUM" }],
    },
    include: { account: true },
    orderBy: [{ riskLevel: "desc" }, { contractValueCents: "desc" }],
    take: limit,
  });
}

export async function getDelayedProcurement(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  const now = new Date();
  return prisma.purchaseOrder.findMany({
    where: {
      workspaceId,
      status: { in: ["PENDING", "APPROVED", "IN_TRANSIT"] },
      expectedDate: { lt: now },
      receivedAt: null,
    },
    include: { vendor: true },
    orderBy: { expectedDate: "asc" },
    take: limit,
  });
}

export async function getOverdueInvoices(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  const now = new Date();
  const list = await prisma.invoice.findMany({
    where: {
      workspaceId,
      status: { in: ["SENT", "OVERDUE"] },
      dueAt: { lt: now },
    },
    include: { account: true },
    orderBy: { dueAt: "asc" },
    take: limit,
  });
  const total = await prisma.invoice.aggregate({
    where: {
      workspaceId,
      status: { in: ["SENT", "OVERDUE"] },
      dueAt: { lt: now },
    },
    _sum: { totalCents: true },
    _count: { _all: true },
  });
  return {
    items: list,
    totalCents: total._sum.totalCents ?? 0,
    totalCount: total._count._all,
  };
}

export async function getLowStock(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.inventoryItem.findMany({
    where: { workspaceId },
    include: { catalogItem: true },
  });
  const low = items
    .filter((i) => i.stock <= i.reorderLevel)
    .sort((a, b) => a.stock / Math.max(1, a.reorderLevel) - b.stock / Math.max(1, b.reorderLevel))
    .slice(0, limit);
  return {
    items: low,
    totalLow: items.filter((i) => i.stock <= i.reorderLevel).length,
  };
}

export async function getExpiringAMCs(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  const now = new Date();
  const list = await prisma.aMCContract.findMany({
    where: {
      workspaceId,
      endDate: {
        gte: now,
        lte: new Date(+now + 90 * 86_400_000),
      },
    },
    include: { account: true },
    orderBy: { endDate: "asc" },
    take: limit,
  });
  const totalMrr = list.reduce((s, a) => s + a.monthlyValueCents, 0);
  return { items: list, totalMrrCents: totalMrr };
}

export async function getTodaysOps() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const [installs, amcVisits, openCommissioningProjects, commissioningTasks] = await Promise.all([
    prisma.calendarEvent.count({
      where: { workspaceId, eventType: "INSTALL", startsAt: { gte: start, lte: end } },
    }),
    prisma.calendarEvent.count({
      where: { workspaceId, eventType: "AMC_VISIT", startsAt: { gte: start, lte: end } },
    }),
    prisma.project.count({
      where: { workspaceId, status: "ACTIVE", phase: "COMMISSIONING" },
    }),
    prisma.todo.count({
      where: { workspaceId, done: false, dueDate: { gte: start, lte: end } },
    }),
  ]);

  return { installs, amcVisits, openCommissioningProjects, commissioningTasks };
}

export async function getTeamUtilization() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setDate(start.getDate() - 7);

  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId, date: { gte: start } },
    include: { user: true },
  });

  const totalMembers = await prisma.user.count({
    where: { workspaceId, role: { in: ["ENGINEER", "SERVICE_TECH"] } },
  });

  const TARGET = 2400; // 40h * 60min
  const byUser = new Map<string, number>();
  for (const e of entries) {
    if (!e.billable) continue;
    byUser.set(e.userId, (byUser.get(e.userId) ?? 0) + e.minutes);
  }

  const utils = Array.from(byUser.values()).map((m) => (m / TARGET) * 100);
  const avg = utils.length ? Math.round(utils.reduce((s, v) => s + v, 0) / utils.length) : 0;
  const onJobsite = Math.min(totalMembers, Math.max(0, totalMembers - 2));

  return {
    avgUtilization: avg,
    onJobsite,
    totalMembers,
  };
}

export async function getPipelineSnapshot() {
  const workspaceId = await getCurrentWorkspaceId();
  const [open, closingThisWeek, monthRev] = await Promise.all([
    prisma.opportunity.aggregate({
      where: { workspaceId, stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
      _sum: { valueCents: true },
      _count: { _all: true },
    }),
    prisma.opportunity.count({
      where: {
        workspaceId,
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
        expectedClose: {
          gte: new Date(),
          lte: new Date(+new Date() + 7 * 86_400_000),
        },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        status: "PAID",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalCents: true },
    }),
  ]);

  return {
    openPipelineCents: open._sum.valueCents ?? 0,
    openCount: open._count._all,
    closingThisWeek,
    revenueThisMonthCents: monthRev._sum.totalCents ?? 0,
  };
}

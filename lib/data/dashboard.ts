import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function getDashboardStats() {
  const workspaceId = await getCurrentWorkspaceId();

  const [
    activeProjects,
    openTickets,
    invoiceAgg,
    pipelineAgg,
  ] = await Promise.all([
    prisma.project.count({ where: { workspaceId, status: "ACTIVE" } }),
    prisma.serviceTicket.count({ where: { workspaceId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ["PAID", "SENT"] } },
      _sum: { totalCents: true },
    }),
    prisma.opportunity.aggregate({
      where: { workspaceId, stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
      _sum: { valueCents: true },
    }),
  ]);

  return {
    activeProjects,
    openTickets,
    revenueMtdCents: invoiceAgg._sum.totalCents ?? 0,
    pipelineCents: pipelineAgg._sum.valueCents ?? 0,
  };
}

export async function getActivityFeed(limit = 6) {
  const workspaceId = await getCurrentWorkspaceId();
  const [pos, tickets, projects, quotes] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { workspaceId },
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.serviceTicket.findMany({
      where: { workspaceId, status: "RESOLVED" },
      include: { assignee: true, account: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.project.findMany({
      where: { workspaceId, phase: { in: ["COMMISSIONING", "HANDOVER"] } },
      include: { account: true },
      orderBy: { updatedAt: "desc" },
      take: 2,
    }),
    prisma.opportunity.findMany({
      where: { workspaceId, stage: "CLOSED_WON" },
      include: { account: true },
      orderBy: { updatedAt: "desc" },
      take: 2,
    }),
  ]);

  const items = [
    ...pos.map((po) => ({
      kind: "po" as const,
      title: `PO ${po.number} ${po.status.toLowerCase()}`,
      meta: `${po.vendor.name} — $${(po.totalCents / 100).toLocaleString()}`,
      at: po.createdAt,
    })),
    ...tickets.map((t) => ({
      kind: "ticket" as const,
      title: `Service ticket ${t.number} resolved`,
      meta: `${t.account?.name ?? ""} · ${t.assignee?.name ?? "Unassigned"}`,
      at: t.resolvedAt ?? t.createdAt,
    })),
    ...projects.map((p) => ({
      kind: "project" as const,
      title: `${p.name} moved to ${p.phase}`,
      meta: p.account?.name ?? "",
      at: p.updatedAt,
    })),
    ...quotes.map((o) => ({
      kind: "opp" as const,
      title: `Opportunity won: ${o.name}`,
      meta: `${o.account?.name ?? ""} · $${(o.valueCents / 100).toLocaleString()}`,
      at: o.updatedAt,
    })),
  ]
    .sort((a, b) => +b.at - +a.at)
    .slice(0, limit);

  return items;
}

export async function getPipelineByStage() {
  const workspaceId = await getCurrentWorkspaceId();
  const groups = await prisma.opportunity.groupBy({
    by: ["stage"],
    where: { workspaceId },
    _sum: { valueCents: true },
    _count: { _all: true },
  });
  return groups.map((g) => ({
    stage: g.stage,
    count: g._count._all,
    valueCents: g._sum.valueCents ?? 0,
  }));
}

export async function getActiveProjects(limit = 4) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.project.findMany({
    where: { workspaceId, status: "ACTIVE" },
    include: { account: true },
    orderBy: { progress: "desc" },
    take: limit,
  });
}

export async function getOpenTickets(limit = 5) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.serviceTicket.findMany({
    where: { workspaceId, status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] } },
    include: { account: true, assignee: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getTechnicians() {
  const workspaceId = await getCurrentWorkspaceId();
  const users = await prisma.user.findMany({
    where: { workspaceId, role: { in: ["SERVICE_TECH", "ENGINEER"] } },
    take: 4,
  });
  return users.map((u, i) => ({
    name: u.name,
    location: ["On-site · Westin", "On-site · Hilton", "Transit · Brooklyn", "HQ Workshop"][i] ?? "HQ",
    status: ["on-site", "on-site", "transit", "shop"][i] ?? "shop",
    utilization: [92, 88, 64, 41][i] ?? 70,
  }));
}

export async function getUpcomingEvents() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.calendarEvent.findMany({
    where: { workspaceId, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 3,
  });
}

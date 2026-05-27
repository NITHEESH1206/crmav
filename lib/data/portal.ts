import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Portal fetchers — scoped to a single account (the client). No workspace
 * filter applied since the account itself is the access token.
 *
 * In production, the entry route resolves a magic-link / SSO session to an
 * accountId; for now the route accepts the accountId directly.
 */

export async function getPortalAccount(accountId: string) {
  return prisma.account.findUnique({
    where: { id: accountId },
    include: {
      workspace: { select: { name: true, logoUrl: true } },
      contacts: { take: 5 },
    },
  });
}

export async function getPortalProjects(accountId: string) {
  return prisma.project.findMany({
    where: { accountId },
    include: {
      milestones: { orderBy: { position: "asc" } },
      _count: { select: { rooms: true, drawings: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPortalDocuments(accountId: string) {
  const projects = await prisma.project.findMany({
    where: { accountId },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);
  return prisma.drawing.findMany({
    where: { projectId: { in: projectIds } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortalTickets(accountId: string) {
  return prisma.serviceTicket.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getPortalInvoices(accountId: string) {
  return prisma.invoice.findMany({
    where: { accountId },
    orderBy: { issuedAt: "desc" },
    take: 20,
  });
}

export async function getPortalAMCs(accountId: string) {
  return prisma.aMCContract.findMany({
    where: { accountId },
    orderBy: { endDate: "asc" },
  });
}

export async function getPortalSnapshot(accountId: string) {
  const [account, projects, openInvoices, openTickets, amcs] = await Promise.all([
    prisma.account.findUnique({
      where: { id: accountId },
      select: { name: true, healthScore: true },
    }),
    prisma.project.count({ where: { accountId, status: "ACTIVE" } }),
    prisma.invoice.aggregate({
      where: { accountId, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.serviceTicket.count({
      where: { accountId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.aMCContract.count({ where: { accountId } }),
  ]);

  return {
    account,
    activeProjects: projects,
    outstandingCents: openInvoices._sum.totalCents ?? 0,
    outstandingCount: openInvoices._count._all,
    openTickets,
    amcCount: amcs,
  };
}

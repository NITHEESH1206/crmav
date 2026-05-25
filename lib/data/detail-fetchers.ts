import "server-only";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function fetchOpportunity(id: string) {
  const o = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      account: true,
      owner: true,
      quote: true,
      project: true,
    },
  });
  if (!o) notFound();
  return o;
}

export async function fetchProject(id: string) {
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      account: true,
      opportunity: true,
      rooms: { include: { _count: { select: { devices: true, racks: true, signalFlows: true } } } },
      boqItems: { include: { catalogItem: true }, orderBy: { id: "asc" } },
      milestones: { orderBy: { position: "asc" } },
      technicians: { include: { user: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 6 },
      invoices: { orderBy: { issuedAt: "desc" }, take: 6 },
    },
  });
  if (!p) notFound();
  return p;
}

export async function fetchTicket(id: string) {
  const t = await prisma.serviceTicket.findUnique({
    where: { id },
    include: {
      account: true,
      project: true,
      assignee: true,
      amc: true,
    },
  });
  if (!t) notFound();
  return t;
}

export async function fetchAccount(id: string) {
  const a = await prisma.account.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { isPrimary: "desc" } },
      projects: { orderBy: { updatedAt: "desc" }, take: 8 },
      tickets: { orderBy: { createdAt: "desc" }, take: 8 },
      invoices: { orderBy: { issuedAt: "desc" }, take: 8 },
      subscriptions: true,
      amcs: true,
    },
  });
  if (!a) notFound();
  return a;
}

export async function getWorkspaceUsers() {
  const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!ws) return [];
  return prisma.user.findMany({
    where: { workspaceId: ws.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

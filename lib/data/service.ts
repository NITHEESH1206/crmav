import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listTickets() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.serviceTicket.findMany({
    where: { workspaceId },
    include: { account: true, assignee: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
}

export async function ticketCounts() {
  const workspaceId = await getCurrentWorkspaceId();
  const groups = await prisma.serviceTicket.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: { _all: true },
  });
  const get = (s: string) => groups.find((g) => g.status === s)?._count._all ?? 0;
  return {
    open: get("OPEN"),
    inProgress: get("IN_PROGRESS"),
    resolved: get("RESOLVED"),
    amcActive: await prisma.aMCContract.count({ where: { workspaceId, endDate: { gte: new Date() } } }),
  };
}

export async function listAMCs() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.aMCContract.findMany({
    where: { workspaceId },
    include: { account: true },
    orderBy: { endDate: "asc" },
  });
}

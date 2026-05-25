import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listInvoices() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.invoice.findMany({
    where: { workspaceId },
    include: { account: true },
    orderBy: { issuedAt: "desc" },
    take: 12,
  });
}

export async function listSubscriptions() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.subscription.findMany({
    where: { workspaceId },
    include: { account: true },
    orderBy: { monthlyCents: "desc" },
  });
}

export async function billingSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [outstanding, paid, recurring] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId, status: "PAID" },
      _sum: { totalCents: true },
    }),
    prisma.subscription.aggregate({
      where: { workspaceId, status: "ACTIVE" },
      _sum: { monthlyCents: true },
      _count: { _all: true },
    }),
  ]);
  return {
    outstandingCents: outstanding._sum.totalCents ?? 0,
    outstandingCount: outstanding._count._all,
    collectedCents: paid._sum.totalCents ?? 0,
    mrrCents: recurring._sum.monthlyCents ?? 0,
    amcCount: recurring._count._all,
  };
}

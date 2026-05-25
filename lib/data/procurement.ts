import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listPurchaseOrders() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.purchaseOrder.findMany({
    where: { workspaceId },
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function poSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [open, inTransit, pending, vendors] = await Promise.all([
    prisma.purchaseOrder.count({
      where: { workspaceId, status: { in: ["PENDING", "APPROVED", "IN_TRANSIT"] } },
    }),
    prisma.purchaseOrder.aggregate({
      where: { workspaceId, status: "IN_TRANSIT" },
      _sum: { totalCents: true },
    }),
    prisma.purchaseOrder.count({ where: { workspaceId, status: "PENDING" } }),
    prisma.vendor.findMany({ where: { workspaceId } }),
  ]);
  const avgLead =
    vendors.length === 0
      ? 0
      : Math.round(
          vendors.reduce((s, v) => s + (v.avgLeadDays ?? 0), 0) / vendors.length
        );
  return {
    open,
    inTransitCents: inTransit._sum.totalCents ?? 0,
    pending,
    avgLeadDays: avgLead,
  };
}

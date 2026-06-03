import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";
import { getCurrentUser } from "@/lib/auth";
import { PLAN_SEAT_LIMITS } from "@/lib/billing/plans";
import { AI_MONTHLY_LIMITS, currentPeriod } from "@/lib/ai/usage";
import type { Plan } from "@prisma/client";

/** The workspace's OWN subscription plan, seat usage and AI usage (Phase 36). */
export async function getPlanBillingInfo() {
  const workspaceId = await getCurrentWorkspaceId();
  const [ws, seatsUsed, usage, me] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { plan: true } }),
    prisma.user.count({ where: { workspaceId } }),
    prisma.aiUsage.findUnique({
      where: { workspaceId_period: { workspaceId, period: currentPeriod() } },
      select: { calls: true },
    }),
    getCurrentUser(),
  ]);
  const plan: Plan = ws?.plan ?? "BASIC";
  return {
    plan,
    seatsUsed,
    seatLimit: PLAN_SEAT_LIMITS[plan],
    aiUsed: usage?.calls ?? 0,
    aiLimit: AI_MONTHLY_LIMITS[plan],
    period: currentPeriod(),
    isOwner: me?.role === "OWNER" || me?.role === "ADMIN",
  };
}

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

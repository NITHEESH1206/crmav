import "server-only";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";

/**
 * Per-workspace monthly AI usage guard (Phase 34).
 * Caps the number of AI generations a workspace can run per calendar month
 * by plan, so one tenant (or a runaway loop) can't drain the API budget.
 * Override any limit with env, e.g. AI_LIMIT_BASIC=300.
 */

const envNum = (key: string, fallback: number) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export const AI_MONTHLY_LIMITS: Record<Plan, number> = {
  BASIC: envNum("AI_LIMIT_BASIC", 150),
  PRO: envNum("AI_LIMIT_PRO", 2000),
  ENTERPRISE: envNum("AI_LIMIT_ENTERPRISE", 50_000),
};

/** Current calendar period as "YYYY-MM". */
export function currentPeriod(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type QuotaStatus = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: Plan;
  period: string;
};

export async function checkAiQuota(workspaceId: string): Promise<QuotaStatus> {
  const period = currentPeriod();
  const [ws, usage] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { plan: true } }),
    prisma.aiUsage.findUnique({
      where: { workspaceId_period: { workspaceId, period } },
      select: { calls: true },
    }),
  ]);
  const plan: Plan = ws?.plan ?? "BASIC";
  const limit = AI_MONTHLY_LIMITS[plan];
  const used = usage?.calls ?? 0;
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    plan,
    period,
  };
}

/** Increment usage for the current period (call after a successful AI call). */
export async function recordAiUsage(
  workspaceId: string,
  tokens: { inputTokens?: number; outputTokens?: number } = {}
): Promise<void> {
  const period = currentPeriod();
  const inc = {
    calls: 1,
    inputTokens: tokens.inputTokens ?? 0,
    outputTokens: tokens.outputTokens ?? 0,
  };
  await prisma.aiUsage.upsert({
    where: { workspaceId_period: { workspaceId, period } },
    create: { workspaceId, period, ...inc },
    update: {
      calls: { increment: inc.calls },
      inputTokens: { increment: inc.inputTokens },
      outputTokens: { increment: inc.outputTokens },
    },
  });
}

export function quotaMessage(q: QuotaStatus): string {
  return `Monthly AI limit reached for your workspace (${q.used}/${q.limit} on the ${q.plan} plan). It resets on the 1st. Upgrade your plan for more AI generations.`;
}

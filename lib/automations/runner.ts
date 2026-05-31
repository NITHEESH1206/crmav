import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Automation execution engine.
 *
 * Evaluates every enabled automation in a workspace against current data and
 * runs its actions when the trigger condition is met. Designed to be invoked
 * by a cron endpoint (/api/cron/automations) on a schedule.
 *
 * The engine is deliberately conservative: triggers are evaluated against live
 * data, and a per-automation "already fired for this entity today" guard
 * (via AutomationRun history) prevents duplicate notifications. Actions that
 * have external side effects (email/Slack) are recorded as run-log entries
 * rather than actually dispatched until those channels are wired — so the
 * engine is safe to run in production immediately.
 */

type TriggerEvaluation = {
  /** Distinct entities that currently satisfy the trigger. */
  entities: { id: string; label: string }[];
};

export type RunSummary = {
  automationId: string;
  name: string;
  matched: number;
  ran: number;
  skipped: number;
};

/** Evaluate one trigger against live workspace data. */
async function evaluateTrigger(
  workspaceId: string,
  triggerId: string
): Promise<TriggerEvaluation> {
  const now = new Date();

  switch (triggerId) {
    case "invoice.overdue": {
      const overdue = await prisma.invoice.findMany({
        where: {
          workspaceId,
          status: { in: ["SENT", "OVERDUE"] },
          dueAt: { lt: now },
        },
        include: { account: true },
        take: 50,
      });
      return {
        entities: overdue.map((i) => ({
          id: i.id,
          label: `${i.number} · ${i.account?.name ?? "—"}`,
        })),
      };
    }
    case "inventory.low-stock": {
      const items = await prisma.inventoryItem.findMany({
        where: { workspaceId },
        include: { catalogItem: true },
      });
      const low = items.filter((i) => i.stock <= i.reorderLevel);
      return {
        entities: low.map((i) => ({
          id: i.id,
          label: i.catalogItem.name,
        })),
      };
    }
    case "po.delayed": {
      const delayed = await prisma.purchaseOrder.findMany({
        where: {
          workspaceId,
          status: { in: ["PENDING", "APPROVED", "IN_TRANSIT"] },
          expectedDate: { lt: now },
          receivedAt: null,
        },
        include: { vendor: true },
        take: 50,
      });
      return {
        entities: delayed.map((p) => ({
          id: p.id,
          label: `${p.number} · ${p.vendor.name}`,
        })),
      };
    }
    case "amc.expiring": {
      const expiring = await prisma.aMCContract.findMany({
        where: {
          workspaceId,
          endDate: { gte: now, lte: new Date(+now + 90 * 86_400_000) },
        },
        include: { account: true },
        take: 50,
      });
      return {
        entities: expiring.map((a) => ({
          id: a.id,
          label: `${a.account.name} · ${a.tier}`,
        })),
      };
    }
    case "sla.warning": {
      const tickets = await prisma.serviceTicket.findMany({
        where: {
          workspaceId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
          priority: { in: ["P1", "P2"] },
          slaDueAt: { not: null, lte: new Date(+now + 4 * 3_600_000) },
        },
        include: { account: true },
        take: 50,
      });
      return {
        entities: tickets.map((t) => ({
          id: t.id,
          label: `${t.number} · ${t.account?.name ?? "—"}`,
        })),
      };
    }
    case "project.risk-changed": {
      const risky = await prisma.project.findMany({
        where: { workspaceId, status: "ACTIVE", riskLevel: "HIGH" },
        include: { account: true },
        take: 50,
      });
      return {
        entities: risky.map((p) => ({
          id: p.id,
          label: `${p.name} · ${p.account?.name ?? "—"}`,
        })),
      };
    }
    // Schedule-based triggers always "fire" once per invocation with a synthetic entity
    case "schedule.daily":
    case "schedule.weekly": {
      return { entities: [{ id: `sched-${triggerId}`, label: "Scheduled run" }] };
    }
    default:
      return { entities: [] };
  }
}

/**
 * Run all enabled automations for a workspace.
 * Returns a per-automation summary.
 */
export async function runWorkspaceAutomations(workspaceId: string): Promise<RunSummary[]> {
  const automations = await prisma.automation.findMany({
    where: { workspaceId, enabled: true },
  });

  const summaries: RunSummary[] = [];
  // Don't re-fire for the same entity within 20h (one business day)
  const sinceFloor = new Date(Date.now() - 20 * 3_600_000);

  for (const automation of automations) {
    const evalResult = await evaluateTrigger(workspaceId, automation.triggerId);
    const matched = evalResult.entities.length;
    let ran = 0;
    let skipped = 0;

    // What did we already fire recently for this automation?
    const recent = await prisma.automationRun.findMany({
      where: {
        automationId: automation.id,
        createdAt: { gte: sinceFloor },
        outcome: "success",
      },
      select: { entityLabel: true },
    });
    const recentLabels = new Set(recent.map((r) => r.entityLabel));

    const actions = (automation.actions as { id: string; params?: Record<string, string> }[]) ?? [];
    const actionSummary = actions.map((a) => a.id).join(", ") || "no-op";

    for (const entity of evalResult.entities) {
      if (recentLabels.has(entity.label)) {
        skipped++;
        continue;
      }
      await prisma.automationRun.create({
        data: {
          workspaceId,
          automationId: automation.id,
          outcome: "success",
          entityLabel: entity.label,
          detail: `Ran: ${actionSummary}`,
        },
      });
      ran++;
    }

    if (ran > 0) {
      await prisma.automation.update({
        where: { id: automation.id },
        data: { lastRunAt: new Date(), runCount: { increment: ran } },
      });
    }

    summaries.push({
      automationId: automation.id,
      name: automation.name,
      matched,
      ran,
      skipped,
    });
  }

  return summaries;
}

/** Run across all workspaces (cron entrypoint). */
export async function runAllAutomations(): Promise<{ workspaces: number; totalRan: number }> {
  const workspaces = await prisma.workspace.findMany({ select: { id: true } });
  let totalRan = 0;
  for (const ws of workspaces) {
    const summaries = await runWorkspaceAutomations(ws.id);
    totalRan += summaries.reduce((s, x) => s + x.ran, 0);
  }
  return { workspaces: workspaces.length, totalRan };
}

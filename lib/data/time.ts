import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listTimeEntriesByUser() {
  const workspaceId = await getCurrentWorkspaceId();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId, date: { gte: since } },
    include: { user: true, project: true },
  });

  const byUser = new Map<string, {
    tech: string;
    project: string;
    minutes: number;
    billableMinutes: number;
  }>();

  for (const e of entries) {
    const k = e.userId;
    const cur = byUser.get(k) ?? { tech: e.user.name, project: e.project?.name ?? "—", minutes: 0, billableMinutes: 0 };
    cur.minutes += e.minutes;
    if (e.billable) cur.billableMinutes += e.minutes;
    if (e.project) cur.project = e.project.name;
    byUser.set(k, cur);
  }

  return Array.from(byUser.values()).map((u) => ({
    ...u,
    hours: +(u.minutes / 60).toFixed(1),
    billable: +(u.billableMinutes / 60).toFixed(1),
    util: u.minutes === 0 ? 0 : Math.round((u.billableMinutes / u.minutes) * 100),
  }));
}

export async function timeSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId, date: { gte: since } },
  });
  const total = entries.reduce((s, e) => s + e.minutes, 0);
  const billable = entries.filter((e) => e.billable).reduce((s, e) => s + e.minutes, 0);
  return {
    hours: +(total / 60).toFixed(1),
    billable: +(billable / 60).toFixed(1),
    billablePct: total === 0 ? 0 : +((billable / total) * 100).toFixed(1),
  };
}

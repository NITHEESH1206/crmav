"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";

/**
 * Per-workspace notification channel preferences.
 * Persisted as a JSON blob on the workspace: { eventKey: { email, inApp } }.
 */

export const NOTIFICATION_EVENTS = [
  { key: "sla-breach",      label: "SLA breach risk on service tickets" },
  { key: "project-phase",   label: "Project moved between phases" },
  { key: "low-stock",       label: "Inventory low-stock alerts" },
  { key: "po-approval",     label: "PO approvals required" },
  { key: "invoice-paid",    label: "Invoice paid" },
  { key: "invoice-overdue", label: "Invoice goes overdue" },
  { key: "amc-renewal",     label: "AMC renewal approaching" },
  { key: "daily-digest",    label: "Daily revenue digest" },
] as const;

export type NotificationPref = { email: boolean; inApp: boolean };
export type NotificationPrefs = Record<string, NotificationPref>;

const DEFAULT_PREF: NotificationPref = { email: true, inApp: true };

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const workspaceId = await getCurrentWorkspaceId();
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { notificationPrefs: true },
  });
  const stored = (ws?.notificationPrefs as NotificationPrefs | null) ?? {};
  // Fill defaults for any unset events
  const result: NotificationPrefs = {};
  for (const ev of NOTIFICATION_EVENTS) {
    result[ev.key] = stored[ev.key] ?? { ...DEFAULT_PREF };
  }
  return result;
}

const updateSchema = z.object({
  eventKey: z.string(),
  channel: z.enum(["email", "inApp"]),
  enabled: z.boolean(),
});

export async function updateNotificationPref(input: z.infer<typeof updateSchema>) {
  const data = updateSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const current = await getNotificationPrefs();
  const next: NotificationPrefs = {
    ...current,
    [data.eventKey]: {
      ...current[data.eventKey],
      [data.channel]: data.enabled,
    },
  };

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { notificationPrefs: next as object },
  });
  revalidatePath("/settings");
  return { ok: true };
}

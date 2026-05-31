"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { runWorkspaceAutomations } from "@/lib/automations/runner";
import { TEMPLATES } from "@/lib/automations/catalog";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

/* ─── Install a template ─── */
const installSchema = z.object({ templateId: z.string() });

export async function installTemplate(input: z.infer<typeof installSchema>) {
  const { templateId } = installSchema.parse(input);
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { ok: false as const, error: "Template not found" };

  const workspaceId = await getCurrentWorkspaceId();

  // Avoid duplicate installs of the same template
  const existing = await prisma.automation.findFirst({
    where: { workspaceId, templateId },
  });
  if (existing) {
    return { ok: false as const, error: "Already installed" };
  }

  await prisma.automation.create({
    data: {
      workspaceId,
      name: template.name,
      templateId: template.id,
      triggerId: template.trigger,
      enabled: true,
      conditions: template.conditions as unknown as Prisma.InputJsonValue,
      actions: template.actions as unknown as Prisma.InputJsonValue,
    },
  });
  revalidatePath("/automations");
  return { ok: true as const };
}

/* ─── Toggle enabled ─── */
export async function toggleAutomation(id: string, enabled: boolean) {
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.automation.updateMany({
    where: { id, workspaceId },
    data: { enabled },
  });
  revalidatePath("/automations");
  return { ok: true };
}

/* ─── Delete ─── */
export async function deleteAutomation(id: string) {
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.automation.deleteMany({ where: { id, workspaceId } });
  revalidatePath("/automations");
  return { ok: true };
}

/* ─── Manual run (the "Run now" button) ─── */
export async function runAutomationsNow() {
  const workspaceId = await getCurrentWorkspaceId();
  const summaries = await runWorkspaceAutomations(workspaceId);
  revalidatePath("/automations");
  const totalRan = summaries.reduce((s, x) => s + x.ran, 0);
  const totalMatched = summaries.reduce((s, x) => s + x.matched, 0);
  return { ok: true as const, totalRan, totalMatched, automations: summaries.length };
}

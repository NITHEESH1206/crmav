"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";

export type ChecklistItem = { id: string; label: string; done: boolean; note?: string };
export type ChecklistGroup = { id: string; title: string; items: ChecklistItem[] };
export type ChecklistData = { groups: ChecklistGroup[] };

const DEFAULT_TEMPLATE: ChecklistData = {
  groups: [
    {
      id: "eng",
      title: "Engineering",
      items: [
        { id: "eng-1", label: "BOQ approved by client", done: false },
        { id: "eng-2", label: "Signal flow diagram signed off", done: false },
        { id: "eng-3", label: "Rack elevations finalized", done: false },
        { id: "eng-4", label: "Network requirements confirmed with client IT", done: false },
        { id: "eng-5", label: "Power/HVAC requirements shared with GC", done: false },
      ],
    },
    {
      id: "proc",
      title: "Procurement",
      items: [
        { id: "proc-1", label: "All POs issued", done: false },
        { id: "proc-2", label: "Critical-path equipment received & inspected", done: false },
        { id: "proc-3", label: "Serial numbers logged in inventory", done: false },
      ],
    },
    {
      id: "inst",
      title: "Installation",
      items: [
        { id: "inst-1", label: "Rack populated & cable-managed", done: false },
        { id: "inst-2", label: "Displays mounted & terminations verified", done: false },
        { id: "inst-3", label: "Microphones installed & gain-staged", done: false },
        { id: "inst-4", label: "Speakers installed & polarity-checked", done: false },
        { id: "inst-5", label: "Control panels wired & touch-tested", done: false },
      ],
    },
    {
      id: "comm",
      title: "Commissioning",
      items: [
        { id: "comm-1", label: "DSP file loaded & saved to project repo", done: false },
        { id: "comm-2", label: "Auto-mixer calibrated (gating, AGC, AEC)", done: false },
        { id: "comm-3", label: "Camera presets configured", done: false },
        { id: "comm-4", label: "Control system tested end-to-end", done: false },
        { id: "comm-5", label: "Network device IPs reserved & documented", done: false },
        { id: "comm-6", label: "Backup configs exported", done: false },
      ],
    },
    {
      id: "handover",
      title: "Handover",
      items: [
        { id: "ho-1", label: "Walkthrough with client AV lead", done: false },
        { id: "ho-2", label: "End-user training delivered", done: false },
        { id: "ho-3", label: "As-built documentation provided", done: false },
        { id: "ho-4", label: "AMC contract executed", done: false },
        { id: "ho-5", label: "Final invoice issued", done: false },
      ],
    },
  ],
};

export async function getOrCreateChecklist(projectId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  let existing = await prisma.commissioningChecklist.findFirst({
    where: { workspaceId, projectId },
    orderBy: { createdAt: "asc" },
  });

  if (!existing) {
    existing = await prisma.commissioningChecklist.create({
      data: {
        workspaceId,
        projectId,
        name: `${project.name} — Commissioning`,
        itemsJson: DEFAULT_TEMPLATE as unknown as object,
      },
    });
  }

  const data = (existing.itemsJson as unknown as ChecklistData) ?? DEFAULT_TEMPLATE;
  return {
    id: existing.id,
    name: existing.name,
    data,
    completedAt: existing.completedAt,
  };
}

export async function toggleChecklistItem(
  checklistId: string,
  groupId: string,
  itemId: string,
  done: boolean
) {
  const current = await prisma.commissioningChecklist.findUnique({ where: { id: checklistId } });
  if (!current) throw new Error("Checklist not found");
  const data = (current.itemsJson as unknown as ChecklistData) ?? DEFAULT_TEMPLATE;
  const next: ChecklistData = {
    groups: data.groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            items: g.items.map((it) => (it.id === itemId ? { ...it, done } : it)),
          }
    ),
  };

  const allDone = next.groups.every((g) => g.items.every((it) => it.done));

  await prisma.commissioningChecklist.update({
    where: { id: checklistId },
    data: {
      itemsJson: next as unknown as object,
      completedAt: allDone ? new Date() : null,
    },
  });

  if (current.projectId) {
    revalidatePath(`/projects/${current.projectId}`);
  }
  return { ok: true, allDone };
}

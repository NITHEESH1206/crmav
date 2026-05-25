"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Opportunity ──────────────────────────────────────────────────────────
const oppPatch = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  stage: z
    .enum(["DISCOVERY", "SITE_SURVEY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"])
    .optional(),
  valueCents: z.coerce.number().int().min(0).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  expectedClose: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
});

export async function updateOpportunity(input: z.infer<typeof oppPatch>) {
  const data = oppPatch.parse(input);
  const { id, expectedClose, ownerId, ...rest } = data;
  await prisma.opportunity.update({
    where: { id },
    data: {
      ...rest,
      expectedClose:
        expectedClose === undefined ? undefined : expectedClose ? new Date(expectedClose) : null,
      ownerId: ownerId === undefined ? undefined : ownerId || null,
    },
  });
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Project ──────────────────────────────────────────────────────────────
const projPatch = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  phase: z
    .enum(["ENGINEERING", "PROCUREMENT", "INSTALLATION", "COMMISSIONING", "HANDOVER", "CLOSED"])
    .optional(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  contractValueCents: z.coerce.number().int().min(0).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function updateProject(input: z.infer<typeof projPatch>) {
  const data = projPatch.parse(input);
  const { id, dueDate, ...rest } = data;
  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
    },
  });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Service Ticket ───────────────────────────────────────────────────────
const ticketPatch = z.object({
  id: z.string(),
  title: z.string().min(2).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "SCHEDULED", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  assigneeId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export async function updateTicket(input: z.infer<typeof ticketPatch>) {
  const data = ticketPatch.parse(input);
  const { id, assigneeId, description, status, ...rest } = data;
  await prisma.serviceTicket.update({
    where: { id },
    data: {
      ...rest,
      status,
      assigneeId: assigneeId === undefined ? undefined : assigneeId || null,
      description: description === undefined ? undefined : description,
      resolvedAt:
        status === "RESOLVED" || status === "CLOSED" ? new Date() : status ? null : undefined,
    },
  });
  revalidatePath(`/service/${id}`);
  revalidatePath("/service");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Account ──────────────────────────────────────────────────────────────
const acctPatch = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  tier: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]).optional(),
  industry: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  healthScore: z.coerce.number().int().min(0).max(100).optional(),
});

export async function updateAccount(input: z.infer<typeof acctPatch>) {
  const data = acctPatch.parse(input);
  const { id, ...rest } = data;
  await prisma.account.update({ where: { id }, data: rest });
  revalidatePath(`/accounts/${id}`);
  revalidatePath("/accounts");
  return { ok: true };
}

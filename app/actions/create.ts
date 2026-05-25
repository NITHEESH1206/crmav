"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Todo ────────────────────────────────────────────────────────────────
const todoSchema = z.object({
  title: z.string().min(2, "Title is required"),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export async function createTodo(input: z.infer<typeof todoSchema>) {
  const data = todoSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.todo.create({
    data: {
      workspaceId,
      title: data.title,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId || null,
      assigneeId: data.assigneeId || null,
    },
  });
  revalidatePath("/todos");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Opportunity ─────────────────────────────────────────────────────────
const opportunitySchema = z.object({
  name: z.string().min(2, "Name is required"),
  accountId: z.string().min(1, "Pick an account"),
  valueCents: z.coerce.number().int().min(0).default(0),
  stage: z.enum(["DISCOVERY", "SITE_SURVEY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]).default("DISCOVERY"),
  ownerId: z.string().optional().nullable(),
});

export async function createOpportunity(input: z.infer<typeof opportunitySchema>) {
  const data = opportunitySchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.opportunity.create({
    data: {
      workspaceId,
      name: data.name,
      accountId: data.accountId,
      valueCents: data.valueCents,
      stage: data.stage,
      ownerId: data.ownerId || null,
      probability: 50,
    },
  });
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Service Ticket ──────────────────────────────────────────────────────
const ticketSchema = z.object({
  title: z.string().min(2, "Title is required"),
  accountId: z.string().min(1, "Pick an account"),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  assigneeId: z.string().optional().nullable(),
  description: z.string().optional(),
});

export async function createTicket(input: z.infer<typeof ticketSchema>) {
  const data = ticketSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const ticketCount = await prisma.serviceTicket.count({ where: { workspaceId } });
  await prisma.serviceTicket.create({
    data: {
      workspaceId,
      number: `T-${850 + ticketCount}`,
      title: data.title,
      description: data.description,
      accountId: data.accountId,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      status: "OPEN",
    },
  });
  revalidatePath("/service");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Project ─────────────────────────────────────────────────────────────
const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  accountId: z.string().min(1, "Pick an account"),
  contractValueCents: z.coerce.number().int().min(0).default(0),
  dueDate: z.string().optional().nullable(),
});

export async function createProject(input: z.infer<typeof projectSchema>) {
  const data = projectSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.project.create({
    data: {
      workspaceId,
      name: data.name,
      accountId: data.accountId,
      contractValueCents: data.contractValueCents,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      phase: "ENGINEERING",
      status: "ACTIVE",
      progress: 0,
    },
  });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { ok: true };
}

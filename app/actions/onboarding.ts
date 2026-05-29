"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";

/**
 * Onboarding actions — server-side persistence for each step of the wizard.
 *
 * State is derived from real workspace data (catalog count, account count,
 * member count) rather than a separate "onboarding_state" table, so the
 * wizard is always in sync with reality and free of staleness.
 */

/* ─── Status snapshot ─── */

export async function getOnboardingStatus() {
  const workspaceId = await getCurrentWorkspaceId();
  const [workspace, accountCount, projectCount, catalogCount, memberCount] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        name: true,
        logoUrl: true,
        currency: true,
        timezone: true,
      },
    }),
    prisma.account.count({ where: { workspaceId } }),
    prisma.project.count({ where: { workspaceId } }),
    prisma.catalogItem.count({ where: { workspaceId } }),
    prisma.user.count({ where: { workspaceId } }),
  ]);

  const workspaceConfigured = Boolean(
    workspace && workspace.name && workspace.currency && workspace.timezone
  );

  const steps = {
    workspace:  workspaceConfigured,
    catalog:    catalogCount > 0,
    account:    accountCount > 0,
    project:    projectCount > 0,
    team:       memberCount > 1,
  };

  const done = Object.values(steps).filter(Boolean).length;
  const total = Object.keys(steps).length;
  const completePct = Math.round((done / total) * 100);

  return {
    steps,
    counts: { accountCount, projectCount, catalogCount, memberCount },
    workspace,
    completePct,
    isComplete: done === total,
  };
}

/* ─── Step 1 — Workspace identity ─── */

const identitySchema = z.object({
  name: z.string().min(2).max(120),
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  currency: z.string().length(3),
  timezone: z.string().min(2).max(60),
});

export async function saveWorkspaceIdentity(input: z.infer<typeof identitySchema>) {
  const data = identitySchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: data.name,
      currency: data.currency,
      timezone: data.timezone,
      logoUrl: data.logoUrl || null,
    },
  });
  revalidatePath("/welcome");
  revalidatePath("/settings");
  return { ok: true };
}

/* ─── Step 2 — Create first account ─── */

const accountSchema = z.object({
  name: z.string().min(2).max(120),
  industry: z.string().max(60).optional(),
  website: z.string().url().optional().or(z.literal("")).nullable(),
  contactName: z.string().min(2).max(120).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
});

export async function createFirstAccount(input: z.infer<typeof accountSchema>) {
  const data = accountSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const account = await prisma.account.create({
    data: {
      workspaceId,
      name: data.name,
      industry: data.industry || null,
      website: data.website || null,
      tier: "GROWTH",
      healthScore: 80,
    },
  });

  if (data.contactName) {
    const [firstName, ...rest] = data.contactName.trim().split(/\s+/);
    await prisma.contact.create({
      data: {
        workspaceId,
        accountId: account.id,
        firstName,
        lastName: rest.join(" ") || "—",
        email: data.contactEmail || null,
        isPrimary: true,
      },
    });
  }

  revalidatePath("/welcome");
  revalidatePath("/accounts");
  return { ok: true, accountId: account.id };
}

/* ─── Step 4 — Invite team members ─── */

const inviteSchema = z.object({
  members: z
    .array(
      z.object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        role: z.enum(["OWNER", "ADMIN", "SALES", "ENGINEER", "SERVICE_TECH", "MEMBER"]),
      })
    )
    .min(1)
    .max(20),
});

export async function inviteTeamMembers(input: z.infer<typeof inviteSchema>) {
  const data = inviteSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const created: string[] = [];
  const skipped: string[] = [];

  for (const m of data.members) {
    const existing = await prisma.user.findUnique({ where: { email: m.email } });
    if (existing) {
      skipped.push(m.email);
      continue;
    }
    await prisma.user.create({
      data: {
        workspaceId,
        email: m.email,
        name: m.name,
        role: m.role,
      },
    });
    created.push(m.email);
  }

  revalidatePath("/welcome");
  revalidatePath("/settings");
  return { ok: true, created: created.length, skipped: skipped.length };
}

/* ─── Final — mark onboarding complete (idempotent) ─── */

export async function dismissOnboarding() {
  // No-op for now; the dashboard widget hides itself once isComplete is true,
  // which is derived from real data. Kept as a stub so the UI can wire it.
  revalidatePath("/dashboard");
  return { ok: true };
}

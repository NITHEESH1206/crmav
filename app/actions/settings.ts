"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";

// ─── Workspace ───────────────────────────────────────────────────────────
const workspaceSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function updateWorkspace(input: z.infer<typeof workspaceSchema>) {
  const data = workspaceSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
    },
  });
  await logAudit(workspaceId, "workspace.updated", "workspace", workspaceId, data);
  revalidatePath("/settings");
  return { ok: true };
}

// ─── User roles ──────────────────────────────────────────────────────────
const roleSchema = z.object({
  userId: z.string(),
  role: z.enum(["OWNER", "ADMIN", "SALES", "ENGINEER", "SERVICE_TECH", "MEMBER"]),
});

export async function updateUserRole(input: z.infer<typeof roleSchema>) {
  const data = roleSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user || user.workspaceId !== workspaceId) throw new Error("User not in workspace");
  await prisma.user.update({
    where: { id: data.userId },
    data: { role: data.role },
  });
  await logAudit(workspaceId, "user.role_changed", "user", data.userId, { role: data.role });
  revalidatePath("/settings");
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["OWNER", "ADMIN", "SALES", "ENGINEER", "SERVICE_TECH", "MEMBER"]).default("MEMBER"),
  jobTitle: z.string().optional().nullable(),
});

export async function inviteMember(input: z.infer<typeof inviteSchema>) {
  const data = inviteSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("A user with that email already exists.");
  const created = await prisma.user.create({
    data: {
      workspaceId,
      email: data.email,
      name: data.name,
      role: data.role,
      jobTitle: data.jobTitle ?? null,
    },
  });
  await logAudit(workspaceId, "user.invited", "user", created.id, { email: data.email, role: data.role });
  revalidatePath("/settings");
  return { ok: true, id: created.id };
}

export async function removeMember(userId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.workspaceId !== workspaceId) throw new Error("User not in workspace");
  if (user.role === "OWNER") {
    throw new Error("Cannot remove the workspace owner.");
  }
  await prisma.user.delete({ where: { id: userId } });
  await logAudit(workspaceId, "user.removed", "user", userId, { email: user.email });
  revalidatePath("/settings");
  return { ok: true };
}

// ─── API keys ────────────────────────────────────────────────────────────
function generateRawKey() {
  // 32 bytes → 64 hex chars
  const raw = randomBytes(32).toString("hex");
  return `zynex_live_${raw}`;
}

function hashKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createApiKey(name: string) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!name || name.trim().length < 2) throw new Error("Name is required");
  const raw = generateRawKey();
  const hashed = hashKey(raw);
  // First 16 chars displayed as "prefix" — looks like zynex_live_abc1...
  const prefix = `${raw.slice(0, 18)}…${raw.slice(-6)}`;
  const key = await prisma.apiKey.create({
    data: {
      workspaceId,
      name: name.trim(),
      prefix,
      hashedKey: hashed,
    },
  });
  await logAudit(workspaceId, "api_key.created", "api_key", key.id, { name: key.name });
  revalidatePath("/settings");
  // Return raw key ONCE so the UI can show it. Never again.
  return { ok: true, id: key.id, rawKey: raw, prefix };
}

export async function revokeApiKey(id: string) {
  const workspaceId = await getCurrentWorkspaceId();
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key || key.workspaceId !== workspaceId) throw new Error("Key not found");
  await prisma.apiKey.delete({ where: { id } });
  await logAudit(workspaceId, "api_key.revoked", "api_key", id, { name: key.name });
  revalidatePath("/settings");
  return { ok: true };
}

// ─── Audit helper ────────────────────────────────────────────────────────
async function logAudit(
  workspaceId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: unknown
) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId,
        action,
        entityType,
        entityId,
        metadata: (metadata as object) ?? undefined,
      },
    });
  } catch {
    // Non-fatal — audit log failures shouldn't break the action
  }
}

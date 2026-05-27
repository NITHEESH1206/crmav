import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function getWorkspace() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.workspace.findUnique({ where: { id: workspaceId } });
}

export async function listWorkspaceMembers() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.user.findMany({
    where: { workspaceId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function listApiKeys() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.apiKey.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAuditLog(limit = 50) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.auditLog.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

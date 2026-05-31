import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listAutomations() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.automation.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAutomationRuns(limit = 30) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.automationRun.findMany({
    where: { workspaceId },
    include: { automation: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getInstalledTemplateIds(): Promise<Set<string>> {
  const workspaceId = await getCurrentWorkspaceId();
  const rows = await prisma.automation.findMany({
    where: { workspaceId, templateId: { not: null } },
    select: { templateId: true },
  });
  return new Set(rows.map((r) => r.templateId).filter(Boolean) as string[]);
}

import "server-only";
import { prisma } from "@/lib/prisma";
import type { ProjectPhase } from "@prisma/client";
import { getCurrentWorkspaceId } from "./workspace";

export async function listProjects() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.project.findMany({
    where: { workspaceId },
    include: { account: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPhaseSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const groups = await prisma.project.groupBy({
    by: ["phase"],
    where: { workspaceId },
    _count: { _all: true },
  });
  const phases: ProjectPhase[] = ["ENGINEERING", "PROCUREMENT", "INSTALLATION", "COMMISSIONING", "HANDOVER"];
  return phases.map((p) => ({
    phase: p,
    count: groups.find((g) => g.phase === p)?._count._all ?? 0,
  }));
}

import "server-only";
import { prisma } from "@/lib/prisma";
import type { OpportunityStage } from "@prisma/client";
import { getCurrentWorkspaceId } from "./workspace";

export async function getOpportunitiesByStage() {
  const workspaceId = await getCurrentWorkspaceId();
  const all = await prisma.opportunity.findMany({
    where: { workspaceId },
    include: { account: true, owner: true },
    orderBy: { updatedAt: "desc" },
  });

  const stages: OpportunityStage[] = ["DISCOVERY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"];
  return stages.map((stage) => {
    const deals = all.filter((d) => d.stage === stage);
    return {
      stage,
      deals,
      totalCents: deals.reduce((sum, d) => sum + d.valueCents, 0),
    };
  });
}

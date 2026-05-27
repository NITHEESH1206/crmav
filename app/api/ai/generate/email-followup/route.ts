import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { EMAIL_FOLLOWUP_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  opportunityId: z.string().optional(),
  entityId: z.string().optional(),
  refinement: z.string().optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  const id = parsed.success ? parsed.data.opportunityId ?? parsed.data.entityId : undefined;
  if (!id) {
    return NextResponse.json({ error: "opportunityId required" }, { status: 400 });
  }

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: { account: true, owner: true, project: true },
  });
  if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userMessage = [
    "# Opportunity",
    `Name: ${opp.name}`,
    `Client: ${opp.account?.name ?? "—"}`,
    `Stage: ${opp.stage}`,
    `Deal value: $${(opp.valueCents / 100).toLocaleString()}`,
    `Probability: ${opp.probability}%`,
    `Expected close: ${opp.expectedClose?.toLocaleDateString() ?? "—"}`,
    `Owner: ${opp.owner?.name ?? "Unassigned"}`,
    `Project linked: ${opp.project?.name ?? "—"}`,
    "",
    "Draft the follow-up email. Match the stage — early-stage = discovery focus, proposal = address questions, negotiation = move-to-close.",
    parsed.success && parsed.data.refinement
      ? `\n# Refinement\n${parsed.data.refinement}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return streamCompletion({
    systemPrompt: EMAIL_FOLLOWUP_PROMPT,
    userMessage,
    effort: "medium",
    maxTokens: 1_200,
  });
}

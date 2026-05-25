import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { PROPOSAL_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 90;

const bodySchema = z.object({ opportunityId: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "opportunityId required" }, { status: 400 });
  }
  const { opportunityId } = parsed.data;

  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { account: true, owner: true },
  });
  if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build the per-request payload — everything dynamic goes here, not in the
  // system prompt, so the system prompt stays cached.
  const userMessage = [
    "# Opportunity",
    `Name: ${opp.name}`,
    `Client: ${opp.account?.name ?? "—"}`,
    `Stage: ${opp.stage}`,
    `Deal value (USD): $${(opp.valueCents / 100).toLocaleString()}`,
    `Probability: ${opp.probability}%`,
    `AI score: ${opp.aiScore ?? "—"}`,
    `Expected close: ${opp.expectedClose?.toLocaleDateString() ?? "—"}`,
    `Owner: ${opp.owner?.name ?? "Unassigned"}`,
    "",
    "Generate the proposal. Use the room mix you can infer from typical AV engagements at this deal size for this client tier.",
  ].join("\n");

  return streamCompletion({
    systemPrompt: PROPOSAL_PROMPT,
    userMessage,
    effort: "high",
    maxTokens: 4_000,
  });
}

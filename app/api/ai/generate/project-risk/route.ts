import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { PROJECT_RISK_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  projectId: z.string().optional(),
  entityId: z.string().optional(),
  refinement: z.string().optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  const id = parsed.success ? parsed.data.projectId ?? parsed.data.entityId : undefined;
  if (!id) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      account: true,
      milestones: true,
      tickets: true,
      boqItems: { include: { catalogItem: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const overdueMilestones = project.milestones.filter(
    (m) => !m.done && m.dueDate && +m.dueDate < Date.now()
  );
  const boqCost = project.boqItems.reduce(
    (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
    0
  );
  const margin =
    project.contractValueCents > 0
      ? Math.round(((project.contractValueCents - boqCost) / project.contractValueCents) * 100)
      : 0;

  const userMessage = [
    "# Project",
    `Name: ${project.name}`,
    `Client: ${project.account?.name ?? "—"}`,
    `Phase: ${project.phase} · Status: ${project.status} · Risk: ${project.riskLevel}`,
    `Progress: ${project.progress}% · Due: ${project.dueDate?.toLocaleDateString() ?? "—"}`,
    `Contract: $${(project.contractValueCents / 100).toLocaleString()} · Est. margin: ${margin}%`,
    "",
    `Milestones overdue: ${overdueMilestones.length} / ${project.milestones.length}`,
    overdueMilestones.map((m) => `  - ${m.name} (due ${m.dueDate?.toLocaleDateString()})`).join("\n"),
    "",
    `Open tickets on project: ${project.tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length}`,
    project.tickets
      .filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED")
      .slice(0, 8)
      .map((t) => `  - ${t.number} ${t.priority} · ${t.title}`)
      .join("\n"),
    "",
    `BOQ lines: ${project.boqItems.length}`,
    "",
    parsed.success && parsed.data.refinement
      ? `\n# Refinement\n${parsed.data.refinement}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return streamCompletion({
    systemPrompt: PROJECT_RISK_PROMPT,
    userMessage,
    effort: "high",
    maxTokens: 2_500,
  });
}

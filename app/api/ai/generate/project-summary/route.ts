import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { PROJECT_SUMMARY_PROMPT } from "@/lib/ai/prompts";

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
      tickets: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } },
      rooms: { include: { _count: { select: { devices: true } } } },
      technicians: { include: { user: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doneMilestones = project.milestones.filter((m) => m.done).length;
  const userMessage = [
    "# Project",
    `Name: ${project.name}`,
    `Client: ${project.account?.name ?? "—"}`,
    `Phase: ${project.phase}`,
    `Status: ${project.status}`,
    `Risk: ${project.riskLevel}`,
    `Progress: ${project.progress}%`,
    `Contract value: $${(project.contractValueCents / 100).toLocaleString()}`,
    `Due date: ${project.dueDate?.toLocaleDateString() ?? "—"}`,
    "",
    `Milestones: ${doneMilestones}/${project.milestones.length} complete`,
    project.milestones.length > 0
      ? project.milestones
          .map((m) => `  - [${m.done ? "x" : " "}] ${m.name}${m.dueDate ? ` (${m.dueDate.toLocaleDateString()})` : ""}`)
          .join("\n")
      : "",
    "",
    `Rooms: ${project.rooms.length}`,
    project.rooms.map((r) => `  - ${r.name} (${r.roomType}, ${r._count.devices} devices)`).join("\n"),
    "",
    `Open tickets: ${project.tickets.length}`,
    project.tickets.map((t) => `  - ${t.number} ${t.priority} · ${t.title}`).join("\n"),
    "",
    `Team: ${project.technicians.map((t) => t.user.name).join(", ") || "—"}`,
    "",
    parsed.success && parsed.data.refinement
      ? `\n# Refinement instructions\n${parsed.data.refinement}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return streamCompletion({
    systemPrompt: PROJECT_SUMMARY_PROMPT,
    userMessage,
    effort: "medium",
    maxTokens: 2_000,
  });
}

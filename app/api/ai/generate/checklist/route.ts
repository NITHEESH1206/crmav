import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { CHECKLIST_PROMPT } from "@/lib/ai/prompts";

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
      rooms: {
        include: {
          devices: { include: { catalogItem: true } },
        },
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userMessage = [
    "# Project context",
    `Name: ${project.name}`,
    `Client: ${project.account?.name ?? "—"}`,
    `Phase: ${project.phase}`,
    "",
    `## Rooms (${project.rooms.length})`,
    ...project.rooms.flatMap((r) => [
      `### ${r.name} · ${r.roomType}${r.capacity ? ` · ${r.capacity} seats` : ""}`,
      ...r.devices.map((d) => `- ${d.catalogItem?.name ?? "Device"} (${d.catalogItem?.brand ?? "—"})`),
      "",
    ]),
    parsed.success && parsed.data.refinement
      ? `\n# Refinement\n${parsed.data.refinement}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return streamCompletion({
    systemPrompt: CHECKLIST_PROMPT,
    userMessage,
    effort: "medium",
    maxTokens: 3_500,
  });
}

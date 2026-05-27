import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { BOQ_GENERATION_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 90;

const bodySchema = z.object({
  projectId: z.string().optional(),
  roomId: z.string().optional(),
  entityId: z.string().optional(),
  refinement: z.string().optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);

  // Resolve: prefer explicit roomId / projectId, otherwise try entityId as project.
  let roomMessage = "";
  let projectName = "Project";

  if (parsed.success && parsed.data.roomId) {
    const room = await prisma.room.findUnique({
      where: { id: parsed.data.roomId },
      include: { account: true, project: true },
    });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    roomMessage = [
      "# Single room request",
      `Room: ${room.name}`,
      `Type: ${room.roomType}`,
      `Capacity: ${room.capacity ?? "—"} seats`,
      `Client: ${room.account?.name ?? "—"}`,
      `Project: ${room.project?.name ?? "—"}`,
      room.notes ? `Notes: ${room.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    projectName = room.project?.name ?? room.name;
  } else {
    const id =
      parsed.success ? parsed.data.projectId ?? parsed.data.entityId : undefined;
    if (!id) {
      return NextResponse.json({ error: "projectId or roomId required" }, { status: 400 });
    }
    const project = await prisma.project.findUnique({
      where: { id },
      include: { account: true, rooms: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    projectName = project.name;

    roomMessage = [
      `# Project`,
      `Name: ${project.name}`,
      `Client: ${project.account?.name ?? "—"}`,
      `Contract value: $${(project.contractValueCents / 100).toLocaleString()}`,
      "",
      project.rooms.length > 0
        ? `## Rooms (${project.rooms.length})\n` +
          project.rooms
            .map(
              (r) =>
                `- ${r.name} · ${r.roomType} · capacity ${r.capacity ?? "—"}${
                  r.notes ? ` · ${r.notes}` : ""
                }`
            )
            .join("\n")
        : "## No rooms defined yet — propose a typical 2-room mix appropriate for the deal size.",
    ].join("\n");
  }

  const userMessage =
    roomMessage +
    (parsed.success && parsed.data.refinement
      ? `\n\n# Refinement\n${parsed.data.refinement}`
      : "");

  return streamCompletion({
    systemPrompt: BOQ_GENERATION_PROMPT,
    userMessage,
    effort: "high",
    maxTokens: 6_000,
  });
}

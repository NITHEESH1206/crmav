import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { TICKET_SUMMARY_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ ticketId: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ticketId required" }, { status: 400 });
  }
  const { ticketId } = parsed.data;

  const t = await prisma.serviceTicket.findUnique({
    where: { id: ticketId },
    include: { account: true, project: true, assignee: true, amc: true },
  });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userMessage = [
    "# Service ticket",
    `Number: ${t.number}`,
    `Title: ${t.title}`,
    `Priority: ${t.priority}`,
    `Status: ${t.status}`,
    `Account: ${t.account?.name ?? "—"}`,
    `Project: ${t.project?.name ?? "—"}`,
    `AMC: ${t.amc?.name ?? "—"} (${t.amc?.tier ?? "no contract"})`,
    `Assignee: ${t.assignee?.name ?? "Unassigned"}`,
    `Created: ${t.createdAt.toISOString()}`,
    "",
    "Description:",
    t.description ?? "(none provided)",
  ].join("\n");

  return streamCompletion({
    systemPrompt: TICKET_SUMMARY_PROMPT,
    userMessage,
    effort: "medium",
    maxTokens: 2_000,
  });
}

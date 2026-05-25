import { NextResponse } from "next/server";
import { z } from "zod";
import { streamChat } from "@/lib/ai/stream";
import { CHAT_ASSISTANT_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  return streamChat({
    systemPrompt: CHAT_ASSISTANT_PROMPT,
    messages: parsed.data.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    effort: "medium",
    maxTokens: 4_000,
  });
}

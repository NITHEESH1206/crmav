import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, AI_DEFAULTS, AIError, isAIConfigured } from "./client";

type StreamOpts = {
  systemPrompt: string;
  userMessage: string;
  /** Tunes thinking depth + token usage. `medium` is the cost/quality sweet spot. */
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  /** Override max output tokens. Default 16k for these endpoints — outputs are short to medium. */
  maxTokens?: number;
};

/**
 * Stream a single-shot completion as plain text chunks.
 * System prompt is wrapped with cache_control so repeat requests hit the cache.
 */
export async function streamCompletion(opts: StreamOpts): Promise<Response> {
  if (!isAIConfigured()) {
    return aiUnconfiguredResponse();
  }
  const client = getAnthropic();
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: AI_DEFAULTS.model,
          max_tokens: opts.maxTokens ?? 16_000,
          thinking: { type: "adaptive" },
          output_config: { effort: opts.effort ?? "medium" },
          system: [
            {
              type: "text",
              text: opts.systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: opts.userMessage }],
        });

        stream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const msg = errorToText(err);
        controller.enqueue(encoder.encode(`\n\n[AI error] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Multi-turn chat streaming. The system prompt is cached; turns grow naturally.
 */
export async function streamChat(opts: {
  systemPrompt: string;
  messages: Anthropic.MessageParam[];
  effort?: StreamOpts["effort"];
  maxTokens?: number;
}): Promise<Response> {
  if (!isAIConfigured()) return aiUnconfiguredResponse();
  const client = getAnthropic();
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: AI_DEFAULTS.model,
          max_tokens: opts.maxTokens ?? 8_000,
          thinking: { type: "adaptive" },
          output_config: { effort: opts.effort ?? "medium" },
          system: [
            {
              type: "text",
              text: opts.systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: opts.messages,
        });

        stream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const msg = errorToText(err);
        controller.enqueue(encoder.encode(`\n\n[AI error] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function errorToText(err: unknown): string {
  if (err instanceof AIError) return err.message;
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limit hit. Wait a moment and try again.";
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return "ANTHROPIC_API_KEY is invalid. Update .env.local.";
  }
  if (err instanceof Anthropic.APIError) {
    return `API error ${err.status}: ${err.message}`;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

function aiUnconfiguredResponse() {
  const msg =
    "AI is not configured. Add ANTHROPIC_API_KEY to .env.local and restart the dev server to enable proposals, summaries, and chat.";
  return new Response(msg, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

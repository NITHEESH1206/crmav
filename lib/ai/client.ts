import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AIError(
      "missing_key",
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  if (_client) return _client;
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export function isAIConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export class AIError extends Error {
  constructor(public code: "missing_key" | "rate_limit" | "api" | "unknown", message: string) {
    super(message);
    this.name = "AIError";
  }
}

/** Default model and tuning for ZynexAV. Opus 4.7, adaptive thinking. */
export const AI_DEFAULTS = {
  model: "claude-opus-4-7" as const,
  max_tokens: 64_000,
} as const;

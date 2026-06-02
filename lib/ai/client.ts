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

/**
 * Model tuning for ZynexAV.
 *  - `model` (Opus): the heavy Project Builder — depth matters, run sparingly.
 *  - `copilotModel` (Sonnet): the chatty Co-pilot + all generation endpoints —
 *    near-Opus quality at a fraction of the cost. Both overridable via env.
 */
export const AI_DEFAULTS = {
  model: process.env.ANTHROPIC_MODEL || "claude-opus-4-7",
  copilotModel: process.env.ANTHROPIC_COPILOT_MODEL || "claude-sonnet-4-5",
  max_tokens: 64_000,
} as const;

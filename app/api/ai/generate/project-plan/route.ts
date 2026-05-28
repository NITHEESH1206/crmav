import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, AI_DEFAULTS, AIError, isAIConfigured } from "@/lib/ai/client";
import { PROJECT_BUILDER_PROMPT } from "@/lib/ai/prompts";
import { loadCatalogContext } from "@/lib/ai/catalog-context";
import {
  projectPlanSchema,
  PROJECT_PLAN_TOOL,
  validatePlan,
  type ValidatedPlan,
} from "@/lib/ai/plan-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const briefSchema = z.object({
  accountName: z.string().min(2).max(120),
  roomName: z.string().min(2).max(120),
  roomType: z.enum([
    "BOARDROOM",
    "HUDDLE",
    "TRAINING",
    "STUDIO",
    "AUDITORIUM",
    "LOBBY",
    "COMMAND_CENTER",
    "OTHER",
  ]),
  capacity: z.number().int().min(1).max(2000),
  lengthM: z.number().min(2).max(50).optional().nullable(),
  widthM: z.number().min(2).max(40).optional().nullable(),
  heightM: z.number().min(2.4).max(15).optional().nullable(),
  tier: z.enum(["STANDARD", "PREMIUM", "FLAGSHIP"]),
  brandPreferences: z.string().max(400).optional(),
  requirements: z.string().max(1200).optional(),
});

export type BuilderBrief = z.infer<typeof briefSchema>;

export type PlanResponse =
  | { ok: true; plan: ValidatedPlan }
  | { ok: false; error: string; details?: string[] };

export async function POST(req: Request): Promise<Response> {
  if (!isAIConfigured()) {
    return NextResponse.json<PlanResponse>(
      {
        ok: false,
        error:
          "AI is not configured. Add ANTHROPIC_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json<PlanResponse>(
      {
        ok: false,
        error: "Brief failed validation",
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 }
    );
  }
  const brief = parsed.data;

  // Load catalog context up front so the AI can only pick real SKUs.
  const { markdown: catalogMarkdown, index, count } = await loadCatalogContext();
  if (count === 0) {
    return NextResponse.json<PlanResponse>(
      {
        ok: false,
        error:
          "Your catalog is empty. Run `npx tsx prisma/seed-catalog.ts` to seed ~140 real AV products before using the AI Builder.",
      },
      { status: 412 }
    );
  }

  // Build the per-request user message — the system prompt stays cached.
  const dimsLine =
    brief.lengthM && brief.widthM && brief.heightM
      ? `Dimensions: ${brief.lengthM} × ${brief.widthM} × ${brief.heightM} m`
      : "Dimensions: not supplied — infer sensible defaults for this room type and capacity.";

  const userMessage = [
    "# Brief",
    `Client: ${brief.accountName}`,
    `Room: ${brief.roomName}`,
    `Room type: ${brief.roomType}`,
    `Capacity: ${brief.capacity} seats`,
    dimsLine,
    `Tier: ${brief.tier}`,
    brief.brandPreferences ? `Brand preferences: ${brief.brandPreferences}` : "Brand preferences: integrator's default mix",
    brief.requirements ? `Special requirements: ${brief.requirements}` : "Special requirements: none",
    "",
    "# AVAILABLE CATALOG",
    "Only use SKUs from this list. Copy them exactly as shown.",
    "",
    catalogMarkdown,
  ].join("\n");

  let toolResult: unknown;
  try {
    const client = getAnthropic();
    const response = await client.messages.create({
      model: AI_DEFAULTS.model,
      max_tokens: 16_000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: [
        {
          type: "text",
          text: PROJECT_BUILDER_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [PROJECT_PLAN_TOOL],
      tool_choice: { type: "tool", name: PROJECT_PLAN_TOOL.name },
      messages: [{ role: "user", content: userMessage }],
    });

    // Find the tool_use block — guaranteed by tool_choice
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error("AI returned no tool call. Try again.");
    }
    toolResult = block.input;
  } catch (err) {
    return aiErrorResponse(err);
  }

  // Schema-validate the AI's structured output
  const planParse = projectPlanSchema.safeParse(toolResult);
  if (!planParse.success) {
    return NextResponse.json<PlanResponse>(
      {
        ok: false,
        error: "AI output failed schema validation. Try generating again.",
        details: planParse.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 502 }
    );
  }

  // Validate every catalogSku against the workspace catalog
  let validated: ValidatedPlan;
  try {
    validated = validatePlan(planParse.data, index);
  } catch (err) {
    return NextResponse.json<PlanResponse>(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Plan validation failed",
      },
      { status: 422 }
    );
  }

  return NextResponse.json<PlanResponse>({ ok: true, plan: validated });
}

function aiErrorResponse(err: unknown): Response {
  const msg =
    err instanceof AIError
      ? err.message
      : err instanceof Anthropic.RateLimitError
        ? "Rate limit hit. Wait a moment and try again."
        : err instanceof Anthropic.AuthenticationError
          ? "ANTHROPIC_API_KEY is invalid. Update .env.local."
          : err instanceof Anthropic.APIError
            ? `API error ${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : "Unknown AI error";
  return NextResponse.json<PlanResponse>({ ok: false, error: msg }, { status: 500 });
}

import { z } from "zod";

/**
 * The structured output the AI Project Builder produces.
 *
 * Claude is invoked in tool_use mode against this schema — it can't return
 * free-form text for these fields, which guarantees we can validate and
 * commit it deterministically.
 *
 * The catalogSku must match a real SKU from the workspace catalog; a
 * validation pass on the server enforces this before any DB writes.
 */

export const ROOM_TYPES = [
  "BOARDROOM",
  "HUDDLE",
  "TRAINING",
  "STUDIO",
  "AUDITORIUM",
  "LOBBY",
  "COMMAND_CENTER",
  "OTHER",
] as const;

export const TIERS = ["STANDARD", "PREMIUM", "FLAGSHIP"] as const;

export type Tier = (typeof TIERS)[number];

/** Per-device pick from the AI. */
export const planDeviceSchema = z.object({
  catalogSku: z
    .string()
    .min(2)
    .max(60)
    .describe("Must be one of the SKUs from the AVAILABLE CATALOG section."),
  quantity: z.number().int().min(1).max(50),
  rationale: z.string().min(5).max(160).optional(),
});

export type PlanDevice = z.infer<typeof planDeviceSchema>;

/** Per-room specification from the AI. */
export const planRoomSchema = z.object({
  name: z.string().min(2).max(80),
  roomType: z.enum(ROOM_TYPES),
  capacity: z.number().int().min(1).max(2000),
  lengthM: z.number().min(2).max(50),
  widthM: z.number().min(2).max(40),
  heightM: z.number().min(2.4).max(15),
  devices: z.array(planDeviceSchema).min(1).max(60),
});

export type PlanRoom = z.infer<typeof planRoomSchema>;

/** The full plan returned by the AI for a single project / single room build. */
export const projectPlanSchema = z.object({
  /** 1-2 sentence executive summary surfaced in the wizard's review step. */
  narrative: z.string().min(20).max(800),
  /** Suggested project name. */
  projectName: z.string().min(2).max(120),
  /** Total estimated contract value in USD cents (advisory — final number is sum of BOQ). */
  estimatedValueCents: z.number().int().min(0),
  /** Risk level the AI thinks this project carries. */
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  /** Always exactly one room per generation — multi-room scope is iterative. */
  room: planRoomSchema,
  /** Free-form "things to verify" callouts shown above the Launch button. */
  callouts: z.array(z.string().min(5).max(220)).max(8).default([]),
});

export type ProjectPlan = z.infer<typeof projectPlanSchema>;

/**
 * The JSON-Schema-style tool input passed to Anthropic so the model can only
 * respond by calling `submit_project_plan` with this shape. Mirrors the Zod
 * schema above — kept hand-written for clarity since Anthropic's SDK expects
 * a pure JSON-Schema shape.
 */
export const PROJECT_PLAN_TOOL = {
  name: "submit_project_plan" as const,
  description:
    "Submit the complete AV project plan. Every catalogSku MUST be from the AVAILABLE CATALOG section of the user message.",
  input_schema: {
    type: "object" as const,
    properties: {
      narrative: {
        type: "string",
        description: "1-2 sentence executive summary for the integrator's sales engineer.",
      },
      projectName: {
        type: "string",
        description: "Concise project name. Format: '<Client> — <Room or Scope>'.",
      },
      estimatedValueCents: {
        type: "integer",
        description: "Estimated total contract value in USD cents (equipment + install).",
      },
      riskLevel: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH"],
        description:
          "LOW = stock kit, no integrations beyond defaults. MEDIUM = brand mixing or BYOD complexity. HIGH = uncommon scale, custom integration, tight timeline.",
      },
      callouts: {
        type: "array",
        items: { type: "string" },
        description:
          "Things the engineer should verify (e.g. ceiling height for mic array reach, network VLANs for AVoIP).",
      },
      room: {
        type: "object",
        properties: {
          name: { type: "string" },
          roomType: {
            type: "string",
            enum: ROOM_TYPES as unknown as string[],
          },
          capacity: { type: "integer" },
          lengthM: { type: "number", description: "Room length in meters." },
          widthM: { type: "number" },
          heightM: { type: "number", description: "Ceiling height in meters." },
          devices: {
            type: "array",
            description:
              "Equipment list. Every catalogSku MUST be from the AVAILABLE CATALOG. Pick complementary brands per the user's preferences. Include rack hardware (rack, PDU, UPS) when the device list warrants it.",
            items: {
              type: "object",
              properties: {
                catalogSku: { type: "string" },
                quantity: { type: "integer", minimum: 1, maximum: 50 },
                rationale: {
                  type: "string",
                  description: "1 short sentence on why this device for this room.",
                },
              },
              required: ["catalogSku", "quantity"],
            },
          },
        },
        required: ["name", "roomType", "capacity", "lengthM", "widthM", "heightM", "devices"],
      },
    },
    required: ["narrative", "projectName", "estimatedValueCents", "riskLevel", "room"],
  },
};

/* ─── Validation against the workspace catalog ─── */

export type CatalogIndex = Map<
  string,
  { id: string; sku: string; name: string; brand: string; category: string; listPriceCents: number }
>;

export type ValidatedPlan = ProjectPlan & {
  validatedDevices: Array<{
    catalogId: string;
    sku: string;
    name: string;
    brand: string;
    category: string;
    listPriceCents: number;
    quantity: number;
    rationale?: string;
  }>;
  warnings: string[];
  totalCents: number;
};

/**
 * Confirms every catalogSku exists in the workspace catalog. If a SKU isn't an
 * exact match, attempts a fuzzy match (prefix/substring) before erroring.
 *
 * Throws on any unresolvable SKU so the launch step never writes bad data.
 */
export function validatePlan(plan: ProjectPlan, catalog: CatalogIndex): ValidatedPlan {
  const warnings: string[] = [];
  const validatedDevices: ValidatedPlan["validatedDevices"] = [];

  for (const dev of plan.room.devices) {
    const exact = catalog.get(dev.catalogSku);
    if (exact) {
      validatedDevices.push({
        catalogId: exact.id,
        sku: exact.sku,
        name: exact.name,
        brand: exact.brand,
        category: exact.category,
        listPriceCents: exact.listPriceCents,
        quantity: dev.quantity,
        rationale: dev.rationale,
      });
      continue;
    }
    // Fuzzy fallback — substring or shared prefix
    const needle = dev.catalogSku.toUpperCase();
    let fuzzy: ReturnType<typeof catalog.get> | undefined;
    for (const entry of catalog.values()) {
      const haystack = entry.sku.toUpperCase();
      if (haystack.includes(needle) || needle.includes(haystack)) {
        fuzzy = entry;
        break;
      }
    }
    if (fuzzy) {
      warnings.push(`Mapped unknown SKU "${dev.catalogSku}" → "${fuzzy.sku}"`);
      validatedDevices.push({
        catalogId: fuzzy.id,
        sku: fuzzy.sku,
        name: fuzzy.name,
        brand: fuzzy.brand,
        category: fuzzy.category,
        listPriceCents: fuzzy.listPriceCents,
        quantity: dev.quantity,
        rationale: dev.rationale,
      });
      continue;
    }
    throw new Error(
      `AI suggested unknown SKU "${dev.catalogSku}" — not in your catalog. Re-run generation or extend the catalog.`
    );
  }

  const totalCents = validatedDevices.reduce(
    (sum, d) => sum + d.quantity * d.listPriceCents,
    0
  );

  return { ...plan, validatedDevices, warnings, totalCents };
}

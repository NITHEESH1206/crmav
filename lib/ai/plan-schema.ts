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

/** The full plan returned by the AI — supports multiple rooms in one project. */
export const projectPlanSchema = z.object({
  /** 1-2 sentence executive summary surfaced in the wizard's review step. */
  narrative: z.string().min(20).max(1200),
  /** Suggested project name. */
  projectName: z.string().min(2).max(120),
  /** Total estimated contract value in USD cents (advisory — final number is sum of BOQ). */
  estimatedValueCents: z.number().int().min(0),
  /** Risk level the AI thinks this project carries. */
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  /** Per-room equipment plan. One project, many rooms. */
  rooms: z.array(planRoomSchema).min(1).max(20),
  /** Free-form "things to verify" callouts shown above the Launch button. */
  callouts: z.array(z.string().min(5).max(220)).max(12).default([]),
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
          "Things the engineer should verify (e.g. ceiling height for mic array reach, network VLANs for AVoIP, rack location for cable runs between rooms).",
      },
      rooms: {
        type: "array",
        description:
          "One entry per room in the project. For multi-room briefs, share infrastructure where it makes sense (e.g. one central rack feeding multiple displays) but each room still needs its own device list.",
        minItems: 1,
        maxItems: 20,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Room name (e.g. 'Boardroom 04 — 14F')." },
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
                "Equipment list for THIS room. Every catalogSku MUST be from the AVAILABLE CATALOG. Pick complementary brands per the user's preferences. Include rack hardware (rack, PDU, UPS) on the room that gets the central rack — typically the largest space.",
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
    },
    required: ["narrative", "projectName", "estimatedValueCents", "riskLevel", "rooms"],
  },
};

/* ─── Validation against the workspace catalog ─── */

export type CatalogIndex = Map<
  string,
  { id: string; sku: string; name: string; brand: string; category: string; listPriceCents: number }
>;

export type ValidatedDevice = {
  catalogId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  listPriceCents: number;
  quantity: number;
  rationale?: string;
};

export type ValidatedRoom = PlanRoom & {
  validatedDevices: ValidatedDevice[];
  totalCents: number;
};

export type ValidatedPlan = ProjectPlan & {
  validatedRooms: ValidatedRoom[];
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
  const validatedRooms: ValidatedRoom[] = [];

  for (const room of plan.rooms) {
    const validatedDevices: ValidatedDevice[] = [];
    for (const dev of room.devices) {
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
        warnings.push(`[${room.name}] Mapped unknown SKU "${dev.catalogSku}" → "${fuzzy.sku}"`);
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
        `[${room.name}] AI suggested unknown SKU "${dev.catalogSku}" — not in your catalog. Re-run generation or extend the catalog.`
      );
    }

    const roomTotal = validatedDevices.reduce(
      (sum, d) => sum + d.quantity * d.listPriceCents,
      0
    );

    validatedRooms.push({
      ...room,
      validatedDevices,
      totalCents: roomTotal,
    });
  }

  const totalCents = validatedRooms.reduce((sum, r) => sum + r.totalCents, 0);

  return { ...plan, validatedRooms, warnings, totalCents };
}

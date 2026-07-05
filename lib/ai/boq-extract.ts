import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, AI_DEFAULTS } from "./client";

/**
 * Reads a Bill of Quantities (image / PDF page / spreadsheet text) with Claude
 * vision and returns structured AV line items. Uses a forced tool call so the
 * output is always well-formed JSON (no free-text parsing).
 */

export type ExtractedBoqItem = {
  brand: string;
  model: string;
  description: string;
  quantity: number;
  category?: string;
};

const BOQ_SYSTEM = `You are an expert AV (audio-visual) estimator reading a client's Bill of Quantities (BOQ) / equipment schedule.

Extract EVERY physical AV product line item. For each row return:
- brand: manufacturer (Crestron, Extron, QSC, Biamp, Shure, Samsung, LG, Sony, Logitech, Poly, Cisco, etc.). Infer from the model if the brand column is blank.
- model: the model number / SKU / part number exactly as written.
- description: the product description.
- quantity: integer count (default 1 if unclear).
- category: best-fit AV category from this list ONLY:
  Display, Display - Interactive, Display - Video Wall LED, Projector, Video Switcher,
  AVoIP Encoder, AVoIP Decoder, DSP, Amplifier, Speaker - Ceiling, Speaker - Surface,
  Speaker - Subwoofer, Microphone - Ceiling, Microphone - Wireless, Microphone - Boundary,
  Camera - PTZ, Camera - Conference, Conferencing - Video Bar, Conferencing - Codec,
  Control - Processor, Control - Touch Panel, Network Switch, Rack, Power, Cable, Accessory.

Rules: SKIP header rows, subtotals, totals, taxes, labour/installation/programming lines, and
generic "cabling"/"consumables" summary rows. Include real hardware only. If a cell is merged or
unclear, use your best judgement. Return an empty list only if there are truly no products.`;

const EXTRACT_BOQ_TOOL: Anthropic.Tool = {
  name: "extract_boq",
  description: "Return every AV product line item found in the bill of quantities.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            description: { type: "string" },
            quantity: { type: "number" },
            category: { type: "string" },
          },
          required: ["model", "quantity"],
        },
      },
    },
    required: ["items"],
  },
};

export async function extractBoqItems(
  content: Anthropic.ContentBlockParam[]
): Promise<{ items: ExtractedBoqItem[]; inputTokens: number; outputTokens: number }> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: AI_DEFAULTS.copilotModel,
    max_tokens: 8_000,
    system: [{ type: "text", text: BOQ_SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [EXTRACT_BOQ_TOOL],
    tool_choice: { type: "tool", name: "extract_boq" },
    messages: [
      {
        role: "user",
        content: [
          ...content,
          { type: "text", text: "Extract every AV product line item from this BOQ." },
        ],
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  const items =
    block && block.type === "tool_use"
      ? ((block.input as { items?: ExtractedBoqItem[] }).items ?? [])
      : [];

  return {
    items: items
      .filter((i) => i && i.model)
      .map((i) => ({
        brand: (i.brand ?? "").trim(),
        model: (i.model ?? "").trim(),
        description: (i.description ?? "").trim(),
        quantity: Math.max(1, Math.round(Number(i.quantity) || 1)),
        category: (i.category ?? "").trim() || undefined,
      })),
    inputTokens: res.usage?.input_tokens ?? 0,
    outputTokens: res.usage?.output_tokens ?? 0,
  };
}

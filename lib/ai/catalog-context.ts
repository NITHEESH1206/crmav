import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import type { CatalogIndex } from "./plan-schema";

/**
 * Loads the workspace catalog into both a lookup index (for server-side
 * validation) and a markdown block (for the AI prompt context).
 *
 * The markdown block lists every product with its SKU, name, brand,
 * category, and price — giving Claude a strict shortlist to pick from.
 *
 * Categories are sorted by integration relevance: visuals first, then audio,
 * then control, then infrastructure. Within a category, products are sorted
 * by price ascending (so the cheaper option is the visual default).
 */

const CATEGORY_ORDER = [
  "Display",
  "Display - Interactive",
  "Display - Video Wall LED",
  "Display - Outdoor",
  "Projector",
  "Conferencing - Video Bar",
  "Conferencing - Codec",
  "Camera - PTZ",
  "Camera - Conference",
  "Video Switcher",
  "AVoIP Encoder",
  "AVoIP Decoder",
  "AVoIP Other",
  "DSP",
  "Amplifier",
  "Microphone - Ceiling",
  "Microphone - Wireless",
  "Microphone - Boundary",
  "Speaker - Ceiling",
  "Speaker - Surface",
  "Speaker - Subwoofer",
  "Control - Processor",
  "Control - Touch Panel",
  "Control - Keypad",
  "Rack",
  "Power",
  "Network Switch",
  "Cable",
  "Accessory",
];

export async function loadCatalogContext(): Promise<{
  markdown: string;
  index: CatalogIndex;
  count: number;
}> {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.catalogItem.findMany({
    where: { workspaceId },
    select: {
      id: true,
      sku: true,
      name: true,
      brand: true,
      category: true,
      listPriceCents: true,
    },
  });

  const index: CatalogIndex = new Map();
  for (const item of items) index.set(item.sku, item);

  // Group by category for the prompt
  const byCategory = new Map<string, typeof items>();
  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.listPriceCents - b.listPriceCents);
  }

  // Render in canonical category order
  const lines: string[] = [];
  for (const cat of CATEGORY_ORDER) {
    const list = byCategory.get(cat);
    if (!list || list.length === 0) continue;
    lines.push(`### ${cat}`);
    for (const item of list) {
      const price = (item.listPriceCents / 100).toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });
      lines.push(`- ${item.sku} · ${item.brand} ${item.name} · $${price}`);
    }
    lines.push("");
  }

  // Append any uncategorised (defensive — shouldn't happen with seed data)
  for (const [cat, list] of byCategory.entries()) {
    if (CATEGORY_ORDER.includes(cat)) continue;
    lines.push(`### ${cat}`);
    for (const item of list) {
      const price = (item.listPriceCents / 100).toLocaleString();
      lines.push(`- ${item.sku} · ${item.brand} ${item.name} · $${price}`);
    }
    lines.push("");
  }

  return {
    markdown: lines.join("\n"),
    index,
    count: items.length,
  };
}

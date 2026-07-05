import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExtractedBoqItem } from "@/lib/ai/boq-extract";

/**
 * Matches AI-extracted BOQ line items against the workspace catalog to pull the
 * product image, canonical category and SKU. This is how the schematic gets real
 * device photos — from your catalog (licensed dealer-feed images), not live
 * scraping. Unmatched items are kept with a best-guess category + flagged so the
 * user can add them to the catalog.
 */

export type MatchedBoqItem = {
  brand: string;
  model: string;
  description: string;
  quantity: number;
  category: string;
  catalogId: string | null;
  sku: string | null;
  imageUrl: string | null;
  matched: boolean;
};

const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export async function matchBoqItems(
  items: ExtractedBoqItem[],
  workspaceId: string
): Promise<MatchedBoqItem[]> {
  const catalog = await prisma.catalogItem.findMany({
    where: { workspaceId },
    select: { id: true, sku: true, name: true, brand: true, category: true, imageUrl: true },
  });
  const bySku = new Map(catalog.map((c) => [norm(c.sku), c]));

  return items.map((it) => {
    const nModel = norm(it.model);
    const nBrand = norm(it.brand);

    // 1. Exact SKU match
    let hit = nModel ? bySku.get(nModel) : undefined;

    // 2. SKU contains / contained-by the model string (handles suffixes/prefixes)
    if (!hit && nModel.length > 3) {
      hit = catalog.find((c) => {
        const s = norm(c.sku);
        return s.length > 3 && (s.includes(nModel) || nModel.includes(s));
      });
    }

    // 3. Brand + model appears in the catalog name
    if (!hit && nModel.length > 2 && nBrand) {
      hit = catalog.find(
        (c) => norm(c.brand) === nBrand && (norm(c.name).includes(nModel) || norm(c.sku).includes(nModel))
      );
    }

    // 4. Model token appears in a catalog name (last resort, needs length)
    if (!hit && nModel.length > 4) {
      hit = catalog.find((c) => norm(c.name).includes(nModel));
    }

    return {
      brand: it.brand || hit?.brand || "",
      model: it.model,
      description: it.description || hit?.name || it.model,
      quantity: it.quantity,
      category: hit?.category ?? it.category ?? "Accessory",
      catalogId: hit?.id ?? null,
      sku: hit?.sku ?? null,
      imageUrl: hit?.imageUrl ?? null,
      matched: Boolean(hit),
    };
  });
}

import "server-only";
import { prisma } from "@/lib/prisma";
import { CATALOG } from "@/lib/av/catalog-data";
import type { Prisma } from "@prisma/client";

/**
 * Seed the curated AV catalog into a freshly-provisioned workspace so a brand-new
 * signup lands with a working catalog (AI Builder / BOQ / rack builder usable on
 * day one). Idempotent — skipDuplicates means re-runs are safe.
 */
export async function seedWorkspaceCatalog(workspaceId: string): Promise<number> {
  const data: Prisma.CatalogItemCreateManyInput[] = CATALOG.map((item) => ({
    workspaceId,
    sku: item.sku,
    name: item.name,
    brand: item.brand,
    category: item.category,
    description: item.description,
    listPriceCents: item.listPriceCents,
    costCents: item.costCents,
    specsJson: item.specs ? (item.specs as Prisma.InputJsonValue) : undefined,
    datasheetUrl: item.datasheetUrl ?? null,
    imageUrl: item.imageUrl ?? null,
  }));

  const result = await prisma.catalogItem.createMany({ data, skipDuplicates: true });
  return result.count;
}

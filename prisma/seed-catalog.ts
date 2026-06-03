/**
 * Seed the curated AV catalog into the workspace.
 *
 * Usage (from repo root):
 *   npx tsx prisma/seed-catalog.ts
 *
 * Idempotent — upserts each SKU by unique key. Adds to the first workspace
 * found (single-tenant dev assumption). For multi-tenant seeding, set
 * `SEED_WORKSPACE_SLUG=foo` in the environment to target a specific one.
 */

import { PrismaClient } from "@prisma/client";
import { CATALOG } from "../lib/av/catalog-data";

const prisma = new PrismaClient();

async function main() {
  const wsSlug = process.env.SEED_WORKSPACE_SLUG;
  const workspace = wsSlug
    ? await prisma.workspace.findUnique({ where: { slug: wsSlug } })
    : await prisma.workspace.findFirst();

  if (!workspace) {
    throw new Error(
      "No workspace found. Run `npx prisma db seed` first to bootstrap the workspace."
    );
  }

  console.log(`Seeding ${CATALOG.length} catalog items into "${workspace.name}"...`);

  let added = 0;
  let updated = 0;
  for (const item of CATALOG) {
    const existing = await prisma.catalogItem.findUnique({
      where: { workspaceId_sku: { workspaceId: workspace.id, sku: item.sku } },
    });
    if (existing) {
      await prisma.catalogItem.update({
        where: { workspaceId_sku: { workspaceId: workspace.id, sku: item.sku } },
        data: {
          name: item.name,
          brand: item.brand,
          category: item.category,
          description: item.description,
          listPriceCents: item.listPriceCents,
          costCents: item.costCents,
          specsJson: item.specs ? JSON.parse(JSON.stringify(item.specs)) : null,
          datasheetUrl: item.datasheetUrl ?? null,
          imageUrl: item.imageUrl ?? null,
        },
      });
      updated++;
    } else {
      await prisma.catalogItem.create({
        data: {
          workspaceId: workspace.id,
          sku: item.sku,
          name: item.name,
          brand: item.brand,
          category: item.category,
          description: item.description,
          listPriceCents: item.listPriceCents,
          costCents: item.costCents,
          specsJson: item.specs ? JSON.parse(JSON.stringify(item.specs)) : null,
          datasheetUrl: item.datasheetUrl ?? null,
          imageUrl: item.imageUrl ?? null,
        },
      });
      added++;
    }
  }

  console.log(`\n✓ Done. +${added} new · ~${updated} updated`);
  console.log(`Total catalog now: ${await prisma.catalogItem.count({ where: { workspaceId: workspace.id } })} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Reset the demo workspace to a clean slate.
 *
 *   npx tsx prisma/reset-workspace.ts
 *
 * Cascade-deletes the OLDEST workspace (the seeded demo) and recreates a fresh,
 * empty one with the AV catalog seeded — so demo mode / the public fallback
 * shows a clean, functional product instead of the Marriott/Nexus sample data.
 *
 * SAFETY: aborts if the oldest workspace contains a real (Clerk) signed-up user,
 * so it can never nuke a live customer account.
 */

import { PrismaClient } from "@prisma/client";
import { CATALOG } from "../lib/av/catalog-data";

const prisma = new PrismaClient();

async function main() {
  const ws = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
    include: { users: true },
  });

  if (!ws) {
    console.log("No workspace found — nothing to reset.");
    return;
  }

  if (ws.users.some((u) => u.clerkId)) {
    console.error(
      `✗ Aborting: workspace "${ws.name}" has a real signed-up user (Clerk). ` +
        "Refusing to delete a live account."
    );
    process.exit(1);
  }

  console.log(`Resetting demo workspace "${ws.name}" (${ws.slug})…`);
  const { name, slug } = ws;

  // Cascade-delete everything under the workspace.
  await prisma.workspace.delete({ where: { id: ws.id } });

  // Recreate clean.
  const fresh = await prisma.workspace.create({
    data: {
      name,
      slug,
      currency: "INR",
      timezone: "Asia/Kolkata",
      plan: "ENTERPRISE", // owner's own demo workspace — no limits
      users: {
        create: {
          email: "owner@zynexav.app",
          name: "Owner",
          role: "OWNER",
        },
      },
    },
  });

  // Seed the catalog so the product is functional.
  const data = CATALOG.map((item) => ({
    workspaceId: fresh.id,
    sku: item.sku,
    name: item.name,
    brand: item.brand,
    category: item.category,
    description: item.description,
    listPriceCents: item.listPriceCents,
    costCents: item.costCents,
    specsJson: item.specs ? JSON.parse(JSON.stringify(item.specs)) : undefined,
    datasheetUrl: item.datasheetUrl ?? null,
    imageUrl: item.imageUrl ?? null,
  }));
  const seeded = await prisma.catalogItem.createMany({ data, skipDuplicates: true });

  console.log(`✓ Clean workspace recreated. Catalog seeded: ${seeded.count} products.`);
  console.log("  Accounts, deals, projects, invoices, etc. are now empty.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

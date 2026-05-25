import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export type RackItem = {
  id: string;
  uStart: number; // 1-indexed, bottom-up. uStart=1 means item bottom is at rack U1
  uHeight: number;
  catalogSku: string | null;
  label: string;
};

export type RackLayout = { items: RackItem[] };

export async function listRacks() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.aVRack.findMany({
    where: { workspaceId },
    include: { room: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRack(id: string) {
  const rack = await prisma.aVRack.findUnique({
    where: { id },
    include: { room: { include: { account: true } } },
  });
  if (!rack) return null;
  const layout = (rack.layoutJson as RackLayout | null) ?? { items: [] };
  return { ...rack, layout };
}

export async function getCatalogForRack() {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.catalogItem.findMany({
    where: { workspaceId, category: { in: ["Control", "Audio", "Distribution"] } },
    orderBy: { name: "asc" },
  });
  // Derive U height from category
  return items.map((c) => ({
    id: c.id,
    sku: c.sku,
    name: c.name,
    brand: c.brand,
    category: c.category,
    uHeight: c.category === "Distribution" ? 2 : 1,
  }));
}

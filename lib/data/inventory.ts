import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listInventory() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.inventoryItem.findMany({
    where: { workspaceId },
    include: { catalogItem: true, warehouse: true },
    orderBy: { catalogItem: { name: "asc" } },
  });
}

export async function inventorySummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.inventoryItem.findMany({
    where: { workspaceId },
    include: { catalogItem: true },
  });
  const skus = items.length;
  const devicesDeployed = items.reduce((s, i) => s + i.allocated, 0);
  const lowStock = items.filter((i) => i.stock <= i.reorderLevel).length;
  const openRMAs = await prisma.rMA.count({ where: { inventoryItem: { workspaceId }, status: "OPEN" } });
  return { skus, devicesDeployed, lowStock, openRMAs };
}

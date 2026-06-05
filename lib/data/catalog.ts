import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";
import { ensureWorkspaceCatalog } from "@/lib/av/seed-workspace";

export async function listCatalog() {
  const workspaceId = await getCurrentWorkspaceId();
  await ensureWorkspaceCatalog(workspaceId);
  return prisma.catalogItem.findMany({
    where: { workspaceId },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });
}

export async function catalogCategories() {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.catalogItem.findMany({
    where: { workspaceId },
    select: { category: true },
  });
  const counts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  return counts;
}

export async function catalogBrands() {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.catalogItem.findMany({
    where: { workspaceId },
    select: { brand: true },
  });
  const counts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.brand] = (acc[i.brand] ?? 0) + 1;
    return acc;
  }, {});
  return counts;
}

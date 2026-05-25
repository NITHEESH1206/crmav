import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listCatalog() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.catalogItem.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });
}

export async function catalogCategories() {
  const workspaceId = await getCurrentWorkspaceId();
  const items = await prisma.catalogItem.findMany({ where: { workspaceId } });
  const counts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  return counts;
}

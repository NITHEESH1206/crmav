import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listDevices() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.device.findMany({
    where: { workspaceId },
    include: {
      catalogItem: true,
      room: { include: { account: true, project: true } },
    },
    orderBy: [{ status: "asc" }, { lastSeenAt: "desc" }],
  });
}

export async function deviceSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const groups = await prisma.device.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: { _all: true },
  });
  const get = (s: string) => groups.find((g) => g.status === s)?._count._all ?? 0;
  return {
    total: groups.reduce((s, g) => s + g._count._all, 0),
    online: get("ONLINE"),
    offline: get("OFFLINE"),
    warning: get("WARNING"),
    retired: get("RETIRED"),
  };
}

import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listRooms() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.room.findMany({
    where: { workspaceId },
    include: {
      account: true,
      project: true,
      _count: { select: { devices: true, boqItems: true, racks: true, signalFlows: true } },
    },
    orderBy: { name: "asc" },
  });
}

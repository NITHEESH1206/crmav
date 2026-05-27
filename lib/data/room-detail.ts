import "server-only";
import { prisma } from "@/lib/prisma";

export async function getRoomDetail(id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, phase: true } },
      account: { select: { id: true, name: true } },
      devices: {
        include: {
          catalogItem: {
            select: { id: true, name: true, brand: true, sku: true, category: true },
          },
        },
      },
      racks: { select: { id: true, name: true, totalU: true } },
      signalFlows: { select: { id: true, name: true } },
      boqItems: {
        include: {
          catalogItem: {
            select: { id: true, name: true, brand: true, sku: true, category: true },
          },
        },
      },
    },
  });
}

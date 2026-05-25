"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { RackLayout } from "@/lib/data/racks";

export async function saveRackLayout(rackId: string, layout: RackLayout) {
  await prisma.aVRack.update({
    where: { id: rackId },
    data: { layoutJson: layout as object },
  });
  revalidatePath("/rack-builder");
  return { ok: true };
}

export async function createRack(name: string) {
  const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!ws) throw new Error("No workspace");
  const rack = await prisma.aVRack.create({
    data: {
      workspaceId: ws.id,
      name,
      totalU: 42,
      layoutJson: { items: [] },
    },
  });
  revalidatePath("/rack-builder");
  return { id: rack.id };
}

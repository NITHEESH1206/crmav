"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ─── Save user-overridden room dimensions ─── */
const dimensionsSchema = z.object({
  roomId: z.string(),
  lengthM: z.number().min(1).max(50),
  widthM: z.number().min(1).max(50),
  heightM: z.number().min(2).max(15),
});

export async function saveRoomDimensions(input: z.infer<typeof dimensionsSchema>) {
  const data = dimensionsSchema.parse(input);
  await prisma.room.update({
    where: { id: data.roomId },
    data: {
      lengthM: data.lengthM,
      widthM: data.widthM,
      heightM: data.heightM,
    },
  });
  revalidatePath(`/rooms/${data.roomId}`);
  revalidatePath("/rooms");
  return { ok: true };
}

export async function resetRoomDimensions(roomId: string) {
  await prisma.room.update({
    where: { id: roomId },
    data: { lengthM: null, widthM: null, heightM: null },
  });
  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/rooms");
  return { ok: true };
}

/* ─── Add catalog devices to a room as BOQ items ─── */
const addItemsSchema = z.object({
  roomId: z.string(),
  items: z
    .array(
      z.object({
        catalogId: z.string(),
        quantity: z.number().int().min(1).max(500),
      })
    )
    .min(1),
});

export async function addCatalogItemsToRoom(input: z.infer<typeof addItemsSchema>) {
  const data = addItemsSchema.parse(input);
  const room = await prisma.room.findUnique({
    where: { id: data.roomId },
    select: { projectId: true },
  });
  if (!room?.projectId) {
    return { ok: false, error: "Room has no project — assign one first." };
  }

  const catalogIds = data.items.map((i) => i.catalogId);
  const cats = await prisma.catalogItem.findMany({
    where: { id: { in: catalogIds } },
  });
  const byId = new Map(cats.map((c) => [c.id, c]));

  const rows = data.items
    .map((i) => {
      const c = byId.get(i.catalogId);
      if (!c) return null;
      return {
        projectId: room.projectId!,
        roomId: data.roomId,
        catalogId: c.id,
        description: c.name,
        quantity: i.quantity,
        unitPriceCents: c.listPriceCents,
      };
    })
    .filter(Boolean) as Array<{
      projectId: string;
      roomId: string;
      catalogId: string;
      description: string;
      quantity: number;
      unitPriceCents: number;
    }>;

  if (rows.length === 0) {
    return { ok: false, error: "None of the selected items exist in the catalog." };
  }

  await prisma.bOQItem.createMany({ data: rows });
  revalidatePath(`/rooms/${data.roomId}`);
  revalidatePath("/rooms");
  revalidatePath("/projects");
  return { ok: true, added: rows.length };
}

/**
 * Generate BOQ items for the room's parent project, drawn from the room's
 * assigned devices and any rack layout for the room. Skips items that already
 * exist on the project's BOQ to avoid duplicates.
 */
export async function generateBOQForRoom(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      devices: { include: { catalogItem: true } },
      racks: true,
      project: { include: { boqItems: true } },
    },
  });
  if (!room?.project) {
    return { ok: false, error: "Room is not attached to a project." };
  }

  type Line = { description: string; quantity: number; unitPriceCents: number; catalogId?: string };
  const lines: Line[] = [];

  // From devices
  for (const d of room.devices) {
    if (!d.catalogItem) continue;
    lines.push({
      description: d.catalogItem.name,
      quantity: 1,
      unitPriceCents: d.catalogItem.listPriceCents,
      catalogId: d.catalogItem.id,
    });
  }

  // From rack layouts (find their catalog item by SKU)
  type RackItem = { catalogSku: string | null; label: string };
  type RackLayoutJson = { items: RackItem[] };
  for (const r of room.racks) {
    const layout = r.layoutJson as unknown as RackLayoutJson | null;
    if (!layout?.items) continue;
    for (const it of layout.items) {
      if (!it.catalogSku) continue;
      const cat = await prisma.catalogItem.findUnique({ where: { sku: it.catalogSku } });
      if (!cat) continue;
      lines.push({
        description: cat.name,
        quantity: 1,
        unitPriceCents: cat.listPriceCents,
        catalogId: cat.id,
      });
    }
  }

  // Group duplicates
  const grouped = new Map<string, Line>();
  for (const l of lines) {
    const key = l.catalogId ?? l.description;
    const ex = grouped.get(key);
    if (ex) {
      ex.quantity += l.quantity;
    } else {
      grouped.set(key, { ...l });
    }
  }

  // Skip catalog IDs already on the project BOQ
  const existingCatalogIds = new Set(room.project.boqItems.map((b) => b.catalogId).filter(Boolean));
  const toCreate = Array.from(grouped.values()).filter((l) => !l.catalogId || !existingCatalogIds.has(l.catalogId));

  if (toCreate.length === 0) {
    return { ok: true, added: 0, message: "BOQ is already up to date." };
  }

  await prisma.bOQItem.createMany({
    data: toCreate.map((l) => ({
      projectId: room.project!.id,
      roomId: room.id,
      catalogId: l.catalogId,
      description: l.description,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    })),
  });

  revalidatePath("/rooms");
  revalidatePath("/projects");
  return { ok: true, added: toCreate.length };
}

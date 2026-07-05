"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { buildSignalFlow } from "@/lib/av/signal-flow-builder";
import { revalidatePath } from "next/cache";

const itemSchema = z.object({
  catalogId: z.string().nullable(),
  sku: z.string().nullable(),
  brand: z.string(),
  model: z.string(),
  description: z.string(),
  category: z.string(),
  quantity: z.number().int().min(1),
  imageUrl: z.string().nullable(),
});

const schema = z.object({
  name: z.string().min(1).max(120),
  roomId: z.string().nullable().optional(),
  items: z.array(itemSchema).min(1),
});

/** Turn the reviewed BOQ line items into a saved pictorial signal-flow schematic. */
export async function generateSchematicFromBoq(input: z.infer<typeof schema>) {
  const data = schema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const devices = data.items.map((it, i) => ({
    catalogId: it.catalogId ?? `boq-${i}`,
    sku: it.sku ?? it.model,
    name: it.description || it.model,
    brand: it.brand,
    category: it.category,
    quantity: it.quantity,
    imageUrl: it.imageUrl ?? undefined,
  }));

  const diagram = buildSignalFlow(devices);
  if (diagram.nodes.length === 0) {
    return { ok: false as const, error: "No connectable AV devices found in the BOQ (only cabling/accessories?)." };
  }

  const flow = await prisma.signalFlow.create({
    data: {
      workspaceId,
      roomId: data.roomId || null,
      name: data.name,
      diagramJson: diagram as unknown as object,
    },
  });

  revalidatePath("/signal-flow");
  return { ok: true as const, id: flow.id };
}

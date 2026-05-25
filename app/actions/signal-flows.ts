"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { FlowDiagram } from "@/lib/data/signal-flows";

export async function saveSignalFlow(id: string, diagram: FlowDiagram) {
  await prisma.signalFlow.update({
    where: { id },
    data: { diagramJson: diagram as object },
  });
  revalidatePath("/signal-flow");
  return { ok: true };
}

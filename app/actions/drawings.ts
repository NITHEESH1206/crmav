"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  fileUrl: z.string().url("Must be a valid URL"),
});

export async function addProjectDocument(input: z.infer<typeof addSchema>) {
  const data = addSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const drawing = await prisma.drawing.create({
    data: {
      workspaceId,
      projectId: data.projectId,
      name: data.name,
      fileUrl: data.fileUrl,
      version: 1,
    },
  });
  revalidatePath(`/projects/${data.projectId}`);
  return { ok: true, id: drawing.id };
}

export async function deleteProjectDocument(id: string, projectId: string) {
  await prisma.drawing.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function listProjectDocuments(projectId: string) {
  return prisma.drawing.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

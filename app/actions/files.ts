"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";

const addSchema = z.object({
  name: z.string().min(1).max(160),
  fileUrl: z.string().url("Must be a valid URL"),
  projectId: z.string().optional(),
  folder: z.string().optional(),
});

export async function addFile(input: z.infer<typeof addSchema>) {
  const data = addSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  // Compose name with /Folder/ prefix when provided, so the folder-inference
  // logic picks it up later. Otherwise just store the name as-is.
  const composed = data.folder ? `/${data.folder}/${data.name}` : data.name;

  // Versioning: if a file with the same name exists, bump version.
  const prior = await prisma.drawing.findFirst({
    where: { workspaceId, name: composed },
    orderBy: { version: "desc" },
  });

  const file = await prisma.drawing.create({
    data: {
      workspaceId,
      name: composed,
      fileUrl: data.fileUrl,
      version: (prior?.version ?? 0) + 1,
      projectId: data.projectId,
    },
  });
  revalidatePath("/files");
  if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
  return { ok: true, id: file.id, version: file.version };
}

export async function deleteFile(id: string) {
  await prisma.drawing.delete({ where: { id } });
  revalidatePath("/files");
  return { ok: true };
}

export async function promoteFile(_id: string, _toState: string) {
  // Lifecycle is currently derived from version (see lib/data/files.ts).
  // This stub exists so the UI can call a single action; a follow-up migration
  // will add a `state` column and we'll persist real state here.
  return { ok: true };
}

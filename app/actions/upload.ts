"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { isStorageConfigured, uploadFile } from "@/lib/storage/supabase";
import { revalidatePath } from "next/cache";

/** Whether the storage backend is wired — drives the UI's upload vs paste mode. */
export async function getStorageStatus() {
  return { configured: isStorageConfigured() };
}

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  folder: z.string().min(1).max(40),
  contentType: z.string().min(1).max(120),
  /** base64-encoded file payload (data URL prefix already stripped by the client). */
  dataBase64: z.string().min(1),
  projectId: z.string().optional().nullable(),
});

/**
 * Upload a file to Supabase Storage and create a Drawing record pointing at it.
 * Files are received as base64 (server actions can't take FormData streams in
 * all runtimes); we cap at 25MB to keep payloads sane.
 */
export async function uploadDocument(input: z.infer<typeof uploadSchema>) {
  if (!isStorageConfigured()) {
    return {
      ok: false as const,
      error:
        "Storage isn't configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, or paste a URL instead.",
    };
  }

  const data = uploadSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const buffer = Buffer.from(data.dataBase64, "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return { ok: false as const, error: "File exceeds 25MB limit." };
  }

  try {
    const { url } = await uploadFile({
      workspaceId,
      folder: data.folder,
      fileName: data.fileName,
      contentType: data.contentType,
      data: buffer,
    });

    // Version bump if a file with the same composed name exists
    const composedName = `/${data.folder}/${data.fileName}`;
    const prior = await prisma.drawing.findFirst({
      where: { workspaceId, name: composedName },
      orderBy: { version: "desc" },
    });

    const file = await prisma.drawing.create({
      data: {
        workspaceId,
        name: composedName,
        fileUrl: url,
        version: (prior?.version ?? 0) + 1,
        projectId: data.projectId || null,
      },
    });

    revalidatePath("/files");
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    return { ok: true as const, id: file.id, url, version: file.version };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}

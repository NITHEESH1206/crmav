import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";
import { FOLDERS, type AppFile, type FileLifecycle, type Folder } from "./files-types";

export { FOLDERS };
export type { AppFile, FileLifecycle, Folder };

/** Infer a folder from the file name; unknown → "Other". */
function inferFolder(name: string): Folder {
  const lower = name.toLowerCase();
  if (lower.startsWith("/")) {
    const seg = lower.slice(1).split("/")[0];
    const hit = FOLDERS.find((f) => f.toLowerCase() === seg);
    if (hit) return hit;
  }
  if (lower.includes("rack") || lower.includes("drawing") || lower.includes("floorplan") || lower.endsWith(".dwg")) {
    return "Drawings";
  }
  if (lower.includes("boq") || lower.includes("quote") || lower.includes("bom")) return "BOQ";
  if (lower.includes("commiss") || lower.includes("checklist") || lower.includes("test")) {
    return "Commissioning";
  }
  if (lower.includes("report")) return "Reports";
  if (lower.includes("vendor") || lower.includes("po") || lower.includes("invoice")) return "Vendor";
  if (lower.match(/\.(jpe?g|png|gif|webp|heic)$/)) return "Photos";
  if (lower.includes("client") || lower.includes("approval") || lower.includes("signoff")) {
    return "Client";
  }
  return "Other";
}

/** Heuristic lifecycle based on version. v1 = draft, v2+ = approved, etc. */
function inferLifecycle(version: number): FileLifecycle {
  if (version >= 4) return "issued";
  if (version >= 2) return "approved";
  return "draft";
}

function inferExt(name: string): string {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

/** All files in the workspace, optionally filtered by project + folder. */
export async function listFiles(opts?: { projectId?: string; folder?: Folder; q?: string }) {
  const workspaceId = await getCurrentWorkspaceId();
  const rows = await prisma.drawing.findMany({
    where: {
      workspaceId,
      ...(opts?.projectId ? { projectId: opts.projectId } : {}),
      ...(opts?.q ? { name: { contains: opts.q, mode: "insensitive" as const } } : {}),
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  const files: AppFile[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    folder: inferFolder(r.name),
    fileUrl: r.fileUrl,
    version: r.version,
    ext: inferExt(r.name),
    createdAt: r.createdAt,
    project: r.project ? { id: r.project.id, name: r.project.name } : null,
    lifecycle: inferLifecycle(r.version),
  }));

  return opts?.folder ? files.filter((f) => f.folder === opts.folder) : files;
}

/** Counts per folder for the left rail. */
export async function folderCounts(projectId?: string) {
  const files = await listFiles(projectId ? { projectId } : undefined);
  const counts: Record<Folder, number> = {
    Drawings: 0,
    BOQ: 0,
    Commissioning: 0,
    Reports: 0,
    Vendor: 0,
    Photos: 0,
    Client: 0,
    Other: 0,
  };
  for (const f of files) {
    counts[f.folder]++;
  }
  return counts;
}

/** Synthetic version history — multiple Drawing rows with the same base name. */
export async function getVersionHistory(name: string, projectId?: string | null) {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.drawing.findMany({
    where: {
      workspaceId,
      name,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { version: "desc" },
    include: { project: true },
  });
}

/** Active projects — used by the file project picker. */
export async function listProjectsForFiles() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.project.findMany({
    where: { workspaceId, status: { in: ["ACTIVE"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

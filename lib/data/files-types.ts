/**
 * Pure type/constant module — no "server-only", safe to import from client.
 * The Prisma-touching fetchers live in ./files.ts.
 */

export const FOLDERS = [
  "Drawings",
  "BOQ",
  "Commissioning",
  "Reports",
  "Vendor",
  "Photos",
  "Client",
  "Other",
] as const;

export type Folder = (typeof FOLDERS)[number];

export type FileLifecycle = "draft" | "review" | "approved" | "issued" | "superseded";

export type AppFile = {
  id: string;
  name: string;
  folder: Folder;
  fileUrl: string;
  version: number;
  ext: string;
  createdAt: Date;
  project: { id: string; name: string } | null;
  lifecycle: FileLifecycle;
};

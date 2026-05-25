import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * For the demo we operate against a single seeded workspace.
 * Production swap: derive workspaceId from Clerk session claims.
 */
export async function getCurrentWorkspaceId() {
  const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!ws) throw new Error("No workspace found. Run `npm run seed` first.");
  return ws.id;
}

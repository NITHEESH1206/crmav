import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasClerk, getCurrentUser } from "@/lib/auth";

/**
 * Demo fallback: operate against the single seeded workspace.
 * When Clerk is enabled, getCurrentWorkspaceId() resolves the signed-in
 * user's own workspace instead (see below).
 *
 * Wrapped in retry-with-backoff so Neon's auto-suspend cold-start
 * (free-tier DBs sleep after ~5 min idle and take 2-5s to wake)
 * doesn't surface as a hard error to the user.
 */
async function fetchWorkspaceId(): Promise<string> {
  const MAX_ATTEMPTS = 4;
  const DELAYS_MS = [0, 800, 1800, 3500]; // total wait ~6s before giving up

  let lastErr: unknown = null;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (DELAYS_MS[i] > 0) {
      await new Promise((r) => setTimeout(r, DELAYS_MS[i]));
    }
    try {
      const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
      if (!ws) throw new Error("No workspace found. Run `npm run seed` first.");
      return ws.id;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry on connection-class errors (Neon cold start, transient network).
      const transient =
        msg.includes("Can't reach database server") ||
        msg.includes("Connection timed out") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("Connection terminated") ||
        msg.includes("connect ENETUNREACH") ||
        msg.includes("Connection pool timeout");
      if (!transient) throw err;
      // eslint-disable-next-line no-console
      console.warn(
        `[workspace] cold-start retry ${i + 1}/${MAX_ATTEMPTS - 1}: ${msg.split("\n")[0]}`
      );
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Database unreachable after retries");
}

// Cache the workspace lookup. 60s TTL is fine — the workspace doesn't change.
const cachedFetch = unstable_cache(fetchWorkspaceId, ["current-workspace-id"], {
  revalidate: 60,
  tags: ["workspace"],
});

export async function getCurrentWorkspaceId(): Promise<string> {
  // Multi-tenant: resolve the signed-in user's workspace (NOT shared-cached,
  // since it's per-request). Falls back to the demo workspace for unauthenticated
  // contexts (e.g. the public client portal) so those keep working.
  if (hasClerk()) {
    const user = await getCurrentUser();
    if (user) return user.workspaceId;
  }
  return cachedFetch();
}

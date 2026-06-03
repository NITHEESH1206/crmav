import "server-only";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Auth resolver — works in two modes:
 *
 *  • Clerk mode (keys set): the signed-in Clerk user maps to a ZynexAV User.
 *    On first sign-in we auto-provision a fresh Workspace with that user as
 *    OWNER (multi-tenant signup).
 *  • Demo mode (no keys): falls back to the first seeded workspace + user, so
 *    local dev and previews keep working with zero config.
 */

export function hasClerk(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "workspace"
  );
}

/** Create a brand-new workspace owned by a freshly-signed-up Clerk user. */
async function provisionForClerkUser(clerkId: string): Promise<User> {
  const { currentUser } = await import("@clerk/nextjs/server");
  const cu = await currentUser();

  const email =
    cu?.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@users.zynexav.app`;
  const name =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(" ").trim() ||
    cu?.username ||
    email.split("@")[0];
  const avatarUrl = cu?.imageUrl ?? null;

  // If this email was invited to an existing workspace, claim that seat and
  // join — don't spin up a brand-new workspace.
  const invited = await prisma.user.findUnique({ where: { email } });
  if (invited && !invited.clerkId) {
    return prisma.user.update({
      where: { id: invited.id },
      data: { clerkId, avatarUrl, name: invited.name || name },
    });
  }

  // Find a free workspace slug.
  const base = slugify(name + "-workspace");
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const clash = await prisma.workspace.findUnique({ where: { slug } });
    if (!clash) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  try {
    const ws = await prisma.workspace.create({
      data: {
        name: `${name}'s workspace`,
        slug,
        currency: "INR",
        timezone: "Asia/Kolkata",
        users: {
          create: { clerkId, email, name, avatarUrl, role: "OWNER" },
        },
      },
      include: { users: true },
    });

    // Seed the starter AV catalog so the new account is usable immediately.
    // Best-effort: a seeding hiccup must never block signup.
    try {
      const { seedWorkspaceCatalog } = await import("@/lib/av/seed-workspace");
      await seedWorkspaceCatalog(ws.id);
    } catch (e) {
      console.warn("[auth] catalog seed-on-signup failed:", e instanceof Error ? e.message : e);
    }

    return ws.users[0];
  } catch {
    // Race or unique collision — another request already provisioned this user.
    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;
    throw new Error("Failed to provision workspace for new user.");
  }
}

/** The current ZynexAV user, or null if signed out. */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasClerk()) {
    const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
    if (!ws) return null;
    return prisma.user.findFirst({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "asc" },
    });
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;
  return provisionForClerkUser(userId);
}

/** Lightweight shape for UI (topbar, menus). */
export async function getCurrentUserDisplay(): Promise<{
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  role: string;
} | null> {
  const u = await getCurrentUser();
  if (!u) return null;
  const initials =
    u.name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  return {
    name: u.name,
    email: u.email,
    initials,
    avatarUrl: u.avatarUrl ?? null,
    role: u.role,
  };
}

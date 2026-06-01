import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Auth middleware.
 *
 *  • Keys set  → Clerk protects every route except the public allowlist below.
 *  • No keys   → pass-through, so local dev / previews run with zero config.
 *
 * The connector (/api/agent/*) authenticates with its own bearer key and the
 * public client portal (/portal/*) is intentionally open, so both are excluded.
 */

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/agent(.*)",
  "/api/webhooks(.*)",
  "/portal(.*)",
]);

const protect = clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

const passthrough = (_req: NextRequest) => NextResponse.next();

export default hasClerk ? protect : passthrough;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

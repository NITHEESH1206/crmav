import { NextResponse, type NextRequest } from "next/server";

// Middleware is a pass-through by default so dev runs without Clerk keys.
// To enable Clerk route protection, replace this file with:
//
//   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//   const isProtected = createRouteMatcher(["/dashboard(.*)", "/api/(?!public).*", …]);
//   export default clerkMiddleware((auth, req) => {
//     if (isProtected(req)) auth().protect();
//   });
//
// and ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY are set.

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

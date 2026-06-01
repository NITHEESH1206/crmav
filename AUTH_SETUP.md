# Authentication setup (Clerk)

ZynexAV ships in **demo mode** out of the box — no auth, single seeded
workspace — so local dev and previews work with zero config. Turn on real
sign-up / sign-in (and per-company workspaces) by adding Clerk keys.

## 1. Create a Clerk application

1. Go to https://dashboard.clerk.com → **Create application**.
2. Enable the sign-in methods you want (Email + Google is a good default).
3. Copy the two API keys from **API Keys**.

## 2. Set environment variables

Add these to `.env.local` (dev) and to your Vercel project (Production):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx

# Where Clerk's hosted components live (these match the app's routes)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

The app auto-detects the keys: when both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
and `CLERK_SECRET_KEY` are present, it enables Clerk; otherwise it stays in
demo mode. (See `hasClerk()` in `lib/auth.ts`.)

## 3. What happens on first sign-up

- A new user signs up via `/sign-up`.
- On their first authenticated request, `getCurrentUser()` in `lib/auth.ts`
  **auto-provisions a fresh Workspace** with that user as `OWNER`
  (currency INR, timezone Asia/Kolkata — adjust in `provisionForClerkUser`).
- Every workspace-scoped query resolves through `getCurrentWorkspaceId()`,
  which now returns *that user's* workspace — so tenants are isolated.

## 4. Routes

| Route | Protected? |
|---|---|
| `/`, `/sign-in`, `/sign-up` | Public |
| `/portal/*` (client portal) | Public |
| `/api/agent/*` (connector, bearer-key auth) | Public to Clerk |
| `/api/webhooks/*` | Public |
| Everything else (`/dashboard`, `/projects`, …) | **Requires sign-in** |

Edit the allowlist in `middleware.ts` (`isPublic`) to change this.

## 5. Notes / follow-ups

- **New workspaces start empty** (no catalog/demo data). If you want new
  signups to land with the AV catalog pre-loaded, add a seed-on-provision step
  in `provisionForClerkUser` (copy `CatalogItem`s from a template workspace).
- The cron job (`/api/cron/automations`) runs without a user session and falls
  back to the demo workspace; make it iterate all workspaces before going
  multi-tenant in production.
- Team invites (adding more users to a workspace) are a natural next step —
  Clerk Organizations or a custom invite flow.

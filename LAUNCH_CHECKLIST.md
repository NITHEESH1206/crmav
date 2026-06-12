# ZynexAV — Go-Live Checklist

Everything needed to take the deployment from demo to production, in order.
Each block is independent: the app runs with any subset configured and
degrades gracefully (demo auth, AI disabled, payments disabled, …).

## 1. Database — ✅ already live
- [x] Neon Postgres connected via `DATABASE_URL` (set in Vercel).
- [x] Schema pushed (`npx prisma db push`), catalog seeded.
- After any schema change: `npx prisma db push`, then redeploy.

## 2. AI (Anthropic) — ✅ already live
- [x] `ANTHROPIC_API_KEY` set in Vercel Production.
- [ ] Set a monthly spend cap: console.anthropic.com → Billing → Usage limits.
- Models: Builder on Opus, Co-pilot on Sonnet (override via `ANTHROPIC_MODEL`
  / `ANTHROPIC_COPILOT_MODEL`). Per-workspace caps via `AI_LIMIT_*`.
- Verify anytime: `node scripts/ai-smoke-test.mjs`

## 3. Auth (Clerk) — keys created, needs Vercel
- [ ] In Vercel → Settings → Environment Variables (Production):
      `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
      `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- [ ] Redeploy, then sign up with a fresh email → you should land in a new
      workspace with the catalog pre-seeded.
- Full guide: `AUTH_SETUP.md`. New signups: own workspace, OWNER role, BASIC
  plan, catalog auto-seeded. Invited emails claim their seat instead.

## 4. Payments & plans (Razorpay)
- [ ] dashboard.razorpay.com → API Keys → set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`.
- [ ] Add webhook: URL `https://<your-domain>/api/webhooks/razorpay`,
      events `payment_link.paid`, `payment.captured`, `payment.failed`;
      set the same secret as `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Test with card 4111 1111 1111 1111 → plan should flip automatically.
- Note: payment links are one-time charges (monthly or annual at 20% off),
  not auto-renewing subscriptions. Razorpay Subscriptions API is the upgrade
  path when you want auto-renewal.

## 5. File uploads (Supabase Storage)
- [ ] Create a Supabase project + storage bucket, set `SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.
- Without these, the Files module shows uploads as unavailable.

## 6. Cron (automations)
- [x] `vercel.json` schedules `/api/cron/automations` daily at 09:00 UTC
      (Hobby plan allows daily only).
- [ ] Set `CRON_SECRET` in Vercel so only Vercel Cron can trigger it.
- The runner iterates **all** workspaces — multi-tenant safe.

## 7. App URL
- [ ] Set `NEXT_PUBLIC_APP_URL=https://<your-domain>` in Vercel — used in
      payment links, invoice PDFs, e-sign URLs, and the connector download.

## 8. Pre-launch smoke test (15 min, after all keys are in)
- [ ] Sign up fresh → workspace created, catalog visible (~185 products).
- [ ] AI Builder: "12-seat boardroom, dual displays" → plan generates.
- [ ] Create account + opportunity (or Import pipeline CSV) → dashboard updates.
- [ ] Quote → e-sign in portal → promote to project.
- [ ] Settings → Team → invite a teammate → sign up with that email → claims seat.
- [ ] Settings → Plan & billing → upgrade with test card → plan flips to PRO.
- [ ] Operations → Remote control → create connector → run
      `node zynex-agent.mjs` on a LAN PC → device discovery appears.
- [ ] Notifications readable, no black-on-black toasts.

## Local dev quick reference
```bash
npm run dev                          # demo mode if no Clerk keys in .env
npx prisma db push                   # sync schema to Neon
npx tsx prisma/seed-catalog.ts       # (re)seed catalog into first workspace
npx tsx prisma/reset-workspace.ts    # wipe demo data → clean workspace (guarded)
node scripts/ai-smoke-test.mjs       # verify Anthropic key + model
```

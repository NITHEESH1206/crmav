# AetherAV CRM

> The enterprise CRM built for AV companies, system integrators, AV consultants, and AV service providers.

Premium SaaS-grade Next.js application. Cinematic landing page, fully-built dashboard, all 14 CRM module routes, Prisma schema covering the entire data model, Clerk auth (optional), and a design system tuned for AV teams.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, RSC) + TypeScript |
| UI | Tailwind v3 + ShadCN-style primitives + Lucide |
| Motion | Framer Motion + GSAP-ready hooks |
| Charts | Recharts |
| Auth | Clerk (optional — app runs without keys) |
| DB | Prisma + PostgreSQL |
| State | Zustand |
| Forms | react-hook-form + zod |

---

## Quick start

```bash
# 1. install
npm install

# 2. (optional) set up Clerk keys in .env.local
#    leave blank to run unauthenticated in dev

# 3. (optional) provision the database
npm run prisma:push
npm run seed

# 4. run dev
npm run dev
```

Visit:
- **Landing page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **All modules**: `/calendar`, `/opportunities`, `/projects`, `/service`, `/procurement`, `/inventory`, `/catalog`, `/accounts`, `/billing`, `/time-entries`, `/reports`, `/todos`, `/settings`

---

## Project structure

```
app/
  (landing)/          # public landing
  (app)/              # authenticated app shell
    dashboard/        # fully built dashboard
    calendar/         # weekly schedule grid
    opportunities/    # kanban + AI scoring
    projects/         # phase tracking + profitability
    service/          # tickets + AMC contracts
    procurement/      # POs + quote comparison
    inventory/        # SKUs + stock health
    catalog/          # AV products + brands
    accounts/         # customer accounts
    billing/          # invoices + subscriptions
    time-entries/     # technician timesheets
    reports/          # analytics charts
    todos/            # task list
    settings/         # workspace settings
  api/                # Next.js API routes
components/
  ui/                 # ShadCN primitives (Button, Card, Badge, …)
  landing/            # landing page sections
  app/                # sidebar, topbar, module shell
  dashboard/          # dashboard widgets
  motion/             # FadeIn, CountUp, Spotlight, Aurora, Particles
lib/
  utils.ts            # cn, formatters
  prisma.ts           # Prisma singleton
  nav.ts              # sidebar nav definitions
prisma/
  schema.prisma       # full data model (14 modules + AV-specific)
  seed.ts             # demo data
```

---

## Design system

Brand:
- **Orange** `#ff6b00` — primary accent
- **Deep black** `#050505` — background
- **White** `#ffffff` — foreground

Tokens, glass utilities, and gradient borders live in [`app/globals.css`](app/globals.css). Tailwind config in [`tailwind.config.ts`](tailwind.config.ts).

Reusable motion primitives:
- `<FadeIn>` — viewport-triggered slide-in
- `<CountUp>` — animated number tween
- `<Aurora>`, `<Particles>`, `<Spotlight>` — ambient backgrounds

---

## AV-specific modeling

The Prisma schema (`prisma/schema.prisma`) includes first-class AV models that generic CRMs don't ship with:

- `Room` (boardroom, huddle, studio, lobby, …)
- `BOQItem` (room-wise bill of quantities)
- `AVRack` (with `layoutJson` for rack diagrams)
- `SignalFlow` (with `diagramJson`)
- `Device` (serial #, IP, MAC, firmware, DSP config URL, lifecycle status)
- `Drawing`, `SiteSurvey`, `CommissioningChecklist`
- `AMCContract` (preventive maintenance contracts)

---

## Auth

By default Clerk is optional. The app inspects `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`:

- **Keys set** → ClerkProvider wraps the tree, middleware protects `/dashboard`, `/projects`, …
- **Keys absent** → middleware is a no-op; everything is publicly accessible (good for design review and demos)

Add keys to `.env.local`, restart the dev server, and protection turns on.

---

## What's built vs. stubbed

| Module | Status |
|---|---|
| Landing page (all 9 sections) | ✅ Fully built |
| App shell (sidebar + topbar) | ✅ Fully built |
| Dashboard | ✅ Fully built — KPIs, charts, pipeline, projects, tickets, technicians, agenda, activity |
| All 13 other module routes | ✅ Full sample UI with realistic data |
| Prisma schema (14 modules) | ✅ Complete |
| API routes | ◔ Health + dashboard stats + opportunities (sample) |
| Wiring API → UI | ◔ UI uses inline sample data; swap to `fetch('/api/…')` when DB is provisioned |
| Auth | ✅ Clerk wired (optional) |
| Real-time (Socket.io) | ◔ Not wired in this pass |

---

## Next steps to take to production

1. Set up Postgres (Supabase, Neon, RDS) and run `npm run prisma:push`.
2. Add Clerk keys; protect API routes.
3. Replace inline data in components with React Server Components that call `prisma.*`.
4. Wire Socket.io for the realtime activity timeline and SLA pulse.
5. Add a `/sign-in` and `/sign-up` route if using Clerk (`@clerk/nextjs` ships components).
6. Configure Stripe webhooks for `/billing`.

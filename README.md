# Imprint Epoxy Design

Custom epoxy tables, helmet displays & wall art, supported by **Imprint**.

## Run it

```bash
npm install
cp .env.example .env      # then set AUTH_SECRET to a long random string
npm run setup             # creates the database + demo data
npm run dev               # http://localhost:3000
```

**Owner login (demo):** `owner@imprintepoxy.test` / `imprint2026`. Change it with `OWNER_EMAIL` / `OWNER_PASSWORD` before seeding a real database.
**Demo customer:** `marcus@example.com` / `demo1234`

## What's in it

| Area | Where |
| --- | --- |
| Home (pour hero, pick-a-piece, shop, idea concepts, Imprint band) | `src/app/page.tsx`, `src/components/hero.tsx` |
| Shop of finished work + Buy now / Remix | `src/app/shop`, `src/lib/catalog.ts` |
| 4-step builder (size → image/drag/filters/FX → topcoat → review) | `src/components/builder.tsx` |
| Canvas renderer (mockups, effects, topcoats, export) | `src/lib/render.ts` |
| Products, sizes, **placeholder prices** | `src/lib/design.ts` |
| Projects + swipeable display mode (like / share / save) | `src/app/projects`, `src/components/display-mode.tsx` |
| Cart + **practice checkout** (no real charges) | `src/app/cart`, `src/app/checkout`, `src/app/api/orders` |
| Chat bubble (general or per-project) | `src/components/chat-bubble.tsx` |
| Special requests (upload pieces) | `src/components/custom-request.tsx` |
| Owner dashboard: customers/leads, view-as-customer, inbox, orders | `src/app/admin` |
| Imprint bio, event QR code | `src/app/imprint`, `src/app/qr` |

## Deploy to Vercel (demo)

1. vercel.com → **Add New → Project** → import `messylaunch/imprintepoxy`. Framework is detected as Next.js. Keep the defaults.
2. Under **Environment Variables**, add `AUTH_SECRET` (any long random string). Optional but recommended.
3. **Deploy.**

With no database connected, the site runs on a bundled, pre-seeded demo database (`prisma/demo.db`). Everything works, but **data resets** whenever Vercel spins up a fresh server. Rebuild it with `npm run demo-db`. Connect Postgres (below) before taking real orders.

## Going live

- **Database:** switch `provider` in `prisma/schema.prisma` to `postgresql`, point `DATABASE_URL` at Supabase/Neon, run `npx prisma db push && npm run db:seed`.
- **Payments:** replace the card check in `src/app/api/orders/route.ts` with Stripe Checkout.
- **Hero video:** drop a file at `public/media/hero.mp4` and set `heroVideo` in `src/lib/site.ts`.
- **GoHighLevel:** customers/leads map 1:1 to `User` rows (`source` = signup | chat | request | checkout).

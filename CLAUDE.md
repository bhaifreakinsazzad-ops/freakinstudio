# Freakin's Studio — Creative Office OS 2.0

## Project identity

Freakin's Studio is an owner-operated Creative Office OS serving Bangladesh and international markets, bilingual (English / বাংলা). Tagline: **DESIGN. CREATE. PRODUCE. GROW.** Official contacts: WhatsApp `+8801778307704`, Email `bhaifreakinstudio@gmail.com`, Web `freakinstudio.space`.

This Next.js 16 + Supabase application evolved from an initial Foundation phase into **Creative Office OS 2.0**. The legacy single-file HTML prototype (`reference/legacy/freakin_s_studio_creative_commerce_os.html`) and historical 60-service JSON extraction remain preserved **for archival and backward-compatibility reference only** (see `docs/LEGACY_AUDIT.md` and `public.legacy_service_map`).

## Brand direction

Strict dark editorial aesthetic aligned with **Official Brand Book v1.0**:
- Palette: `#090A0A` (Obsidian), `#D9BD81` (Champagne Gold), `#F6F4EF` (Studio Ivory), `#232528` (Graphite).
- Typography (`next/font/google` in `src/app/layout.tsx`): `Lato` (400/700/900, `--font-sans`), `Noto Sans Bengali` (400/600/700, `--font-bengali`), `JetBrains Mono` (400/600/700, `--font-mono`).

## Technology stack

Next.js 16.4.5 (App Router, TypeScript, Turbopack) · React 19 · Tailwind CSS 4 · shadcn/ui (Base UI preset) · Supabase (Postgres + Auth + Private Storage, `@supabase/ssr`) · Anime.js v4 · Motion · Zod · Vitest · Playwright.

## Canonical Catalog (Current Authority)

The canonical Creative Office OS 2.0 catalog (`src/lib/catalog/index.ts`, Migration `011`) consists of:
- **4 Creative Disciplines** (`DISC-01`..`DISC-04`)
- **13 Core Services** (`SRV-01`..`SRV-13`)
- **15 Scoped Variants** (`VAR-01`..`VAR-15`)
- **5 Commercial Bundles** (`BND-01`..`BND-05`)
- **14 Optional Add-ons** (`ADD-01`..`ADD-14`)
- **3 Proposed AI Micro-Kits** (`SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`)
- **Historical 60-service archive (`A01..G07`)**: Marked `active = false` on the public storefront (`legacy_service_map`) while kept queryable so historical orders/FKs never break.

## Commercial governance (do not violate)

- **Ratebook v8/v8.1 Gate**: Reference hourly values (`1,500 BDT/hr` / `$15/hr`) are provisional estimation baselines only (`RATEBOOK_APPROVED = false`). Every service and bundle defaults to `pricing_status = "quote_required"` until owner-approved per-service BDT & USD rates are populated in Supabase (`pricing_status = 'approved' AND ratebook_approved = true`).
- **Promotional Window**: 5% launch discount (`20 Nov – 15 Dec 2026`) is computed strictly using the server clock in `Asia/Dhaka` (`src/lib/pricing/engine.ts` + Migration `014`).
- **10-Minute Express Delivery**: Restricted to `SRV-02`, `SRV-05`, `SRV-13` with ready open-source files, single micro-edit scope, and explicit `studioSlotConfirmed === true`.

## Security & Operations Requirements

- **Auth & Roles**: Supabase Auth + RLS across all tables (`001`–`014`). Admin mutations enforce `studio_admin` / `super_admin` server-side.
- **No Exposed Secrets or Internal Planning Docs**: `SUPABASE_SERVICE_ROLE_KEY`, `PUTER_SERVER_TOKEN`, `STRIPE_SECRET_KEY`, `SSLCOMMERZ_STORE_PASSWORD`, and `AI_GUEST_COOKIE_SECRET` are strictly server-only. Internal planning/audit docs reside in `docs/archive/aistudio/` (never `public/`).
- **AI Gateway & Zero Puter Login**: Visitors never log into Puter. Server calls Puter only when `PUTER_SERVER_TOKEN` is configured; otherwise explicit `DEMO_TEMPLATE_FALLBACK` (`isRealAi: false`) runs within signed guest quotas and emergency kill switch controls.
- **PWA Safety Boundary**: `public/sw.js` caches public offline utility routes (`/offline`, icons, manifest) and strictly bypasses `/api/*`, `/dashboard*`, `/admin*`, `/auth*`, `/login*`, and `/signup*`.

## Verification Commands

- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint` (`eslint`)
- `npm run test:unit` (Vitest unit suites)
- `npm run test:node` (Node pure-logic pricing/catalog assertions)
- `npm run test:integration` (Lifecycle + live Supabase `.env.test` RLS isolation)
- `npm run build` (`next build`)
- `npm run test:e2e` (`playwright test` — requires installed Chromium binary)

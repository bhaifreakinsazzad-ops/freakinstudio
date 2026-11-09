# Freakin's Studio — Creative Commerce OS

## Project identity

Freakin's Studio is a creative production agency (graphic design, branding, video, social content, advertising creative, AI-assisted production, corporate communication) primarily serving Bangladesh and US markets, bilingual (English/Bengali). Tagline: **Design. Create. Produce. Grow.**

This repository is a ground-up rebuild of a legacy single-file HTML/React-CDN prototype (`reference/legacy/freakin_s_studio_creative_commerce_os.html`, preserved byte-for-byte — never edit it) into a real Next.js + Supabase application. The legacy file is the authoritative source for **business requirements** (the 60-service catalog, categories, brand identity, general UX concepts) but **not** for implementation (it's a browser-only demo with simulated payments, localStorage persistence, and zero real auth). See `docs/LEGACY_AUDIT.md` for the full inventory of what was found there.

## Brand direction

Dark "cyberpunk SaaS ops console" aesthetic — confident, premium, minimal, forced dark theme (no light mode). Design tokens live in `src/app/globals.css` (`@theme` block): `brand-black #09090b, brand-surface #121215, brand-card #18181b, brand-border #27272a, brand-muted #71717a, brand-light #f4f4f5, brand-accent #e4e4e7, brand-highlight #3b82f6, brand-success #10b981, brand-warning #f59e0b, brand-danger #ef4444`. Fonts: Inter (sans) + JetBrains Mono (mono, for badges/IDs). Signature utility classes: `.glass-panel`/`.glass-card`, `.cyber-glow`, `.badge-mono`. `.cyber-scanline` (legacy's decorative scanline overlay) is not yet ported.

## Technology stack

Next.js 16 (App Router, TypeScript, Turbopack, `cacheComponents` enabled — route segments that read cookies/searchParams per-request need `export const instant = false`, see `(auth)/layout.tsx` and `(client)/layout.tsx`) · Tailwind CSS 4 (CSS-first `@theme`, no `tailwind.config.ts`) · shadcn/ui on the **Base UI** preset (not Radix — polymorphism uses `render={<Link .../>}`, not `asChild`) · Supabase (Postgres + Auth, `@supabase/ssr` for SSR cookie sessions) · Zod · Vitest.

No Docker and no working Supabase CLI binary exist on the development machine (Windows, no WSL/Docker Desktop). Database work targets a **hosted** Supabase project — migrations are plain SQL files applied via the dashboard SQL editor (or `npx supabase db push` if the CLI happens to work in a given environment), not a local `supabase start` stack.

## The 60-service catalog (authoritative, do not lose)

Exactly 60 services across 7 categories: A=10 (Graphic Design), B=8 (Brand Identity), C=12 (Video/Motion), D=8 (Social Media), E=8 (Advertising Creative), F=7 (AI-Powered Creative), G=7 (Corporate Communication). The real data (titles, Bengali translations, legacy baseUSD/baseBDT prices, turnaround days, revision counts, add-on labels) was extracted **verbatim** from the legacy file via `scripts/extract-legacy-catalog.ts` into `supabase/seed/data/*.json`, and is seeded into the real `services`/`service_categories`/`add_ons`/`service_add_ons` tables via `scripts/seed-services.ts`. Never fabricate or "round up" catalog data — if extraction yields fewer/more than 60 services, that's an extractor bug, not something to pad around.

## Commercial governance (do not violate)

The legacy prototype's hardcoded USD/BDT prices, rush multiplier (×1.35), and add-on pricing are **development fixtures**, not approved business policy. They are seeded into the database as-is for Foundation purposes (proving the schema works with real numbers), but **no checkout/payment feature may go live against unapproved pricing** — a future pricing/quotation phase must add an admin approval workflow before any price is used in a real transaction. Never invent official prices, discounts, or licensing terms beyond what's recorded in `docs/LEGACY_AUDIT.md`.

## Security requirements

- Authentication is Supabase Auth only. **Never** reintroduce the legacy's client-side dev role-switcher (a `<select>` that set `activeUserId` with zero auth) in any shipped UI.
- `profiles.role` is set server-side only, via the `handle_new_user()` trigger on `auth.users` insert (always defaults to `'customer'`). No signup flow may accept a client-submitted role.
- Role escalation is blocked at the RLS layer (`profiles_update_self_no_role_escalation` policy) — a user can update their own profile but not their own `role` column.
- Every table that has RLS enabled must have at least one policy. This is a direct, deliberate fix for a confirmed gap in the legacy's own embedded SQL draft (`project_assets` had RLS enabled with no policy — see `docs/LEGACY_AUDIT.md` §4).
- The Supabase service-role key is server-only — never prefix it with `NEXT_PUBLIC_`, never import it from a Client Component. It's used only in `scripts/*` and `tests/integration/*`.

## Source preservation policy

`reference/legacy/freakin_s_studio_creative_commerce_os.html` must never be modified or deleted. It's the permanent, byte-for-byte record of the original prototype (SHA-256 recorded in `docs/LEGACY_AUDIT.md`).

## Database architecture

Foundation phase covers **identity** (`profiles`, `organizations`, `organization_members`) and **catalog** (`service_categories`, `services`, `add_ons`, `service_add_ons`) only — 7 tables, all RLS-enabled with real policies. The legacy's full target schema (quotes, orders, payments, projects, assets, annotations, approvals, audit logs — ~17+ tables) is deliberately **not** migrated yet; see `docs/DATABASE_SCHEMA.md` and `docs/REMAINING_WORK.md`. The role enum (`user_role`) has 10 values, reconciling the legacy's 9-role CHECK constraint against the original project brief's 11 named roles (Visitor is unauthenticated, not persisted): `customer, customer_org_admin, customer_team_member, sales_rep, designer, video_editor, project_manager, finance_manager, studio_admin, super_admin`.

## Testing requirements

- `npm run typecheck && npm run lint && npm run build` must all pass before any phase is considered done.
- `npm run test:unit` — pure-logic tests (Zod schemas, permission helpers), no network, must always pass.
- `npm run test:integration` — RLS/auth isolation tests against a **real** hosted Supabase project (`.env.test`). This is the executable proof that "unauthorized access is rejected" — never substitute a mocked database for this suite.
- Never report a feature as done without actually running it. Use `docs/IMPLEMENTATION_STATUS.md`'s vocabulary (Implemented and tested / Implemented but unverified / Blocked by external configuration / Not implemented) honestly.

## Current development phase

**Phase 0 (Audit & Preservation) and Phase 1 (Full-Stack Foundation): complete.** See `docs/IMPLEMENTATION_STATUS.md` for the exact feature-by-feature status and `docs/DEVELOPMENT_PROGRESS.md` for the commit-by-commit history.

## Roadmap (not started — do not assume any of this exists)

- **Phase 2** — Catalog UI (storefront, service detail pages) + 7-step Package Builder wired to the real database, draft persistence.
- **Phase 3** — Commercial engine: price books, admin price approval workflow, quotation request/issue/accept flow with immutable snapshots.
- **Phase 4** — Checkout & orders: SSLCOMMERZ (Bangladesh) and Stripe (international, if eligible) payment adapters, real server-side payment verification, order lifecycle, invoices.
- **Phase 5** — Client workspace: dashboard with real projects, service-specific onboarding briefs, file uploads to Supabase Storage.
- **Phase 6** — Production & creative review: Kanban, staff assignment, visual annotation/proofing, revision management, approvals, real file delivery (the legacy's "Download ZIP" button is fake — a toast with no file, see `docs/LEGACY_AUDIT.md` §11).
- **Phase 7** — Studio Admin OS (rebuilding the confirmed-missing `StudioAdminView`), workflow automation, notifications.
- **Phase 8** — Bilingual UI (bn fields already stored in the schema, not yet rendered/switchable), SEO/CMS, analytics, accessibility/performance hardening, deployment.

## Completion criteria

A phase is not "done" because a page renders — it's done when the acceptance criteria stated for that phase in the original project brief are met *and verified* (build passes, tests pass, and for anything security-relevant, an actual negative test proves unauthorized access is rejected). Distinguish "implemented" from "implemented and tested" from "blocked by external configuration" at all times.

# Freakin's Studio — Creative Commerce OS

> Design. Create. Produce. Grow.

A creative-agency commerce platform being rebuilt from a legacy single-file HTML prototype into a real Next.js + Supabase application. See `CLAUDE.md` for the full project brief and phased roadmap, and `docs/IMPLEMENTATION_STATUS.md` for what's actually built vs. planned.

**Current phase: Foundation (Phase 0-1) complete.** This covers the Next.js scaffold, brand design system, database schema with Row Level Security, and real Supabase Auth (signup/login/dashboard). The commerce features described in the original project brief (catalog browsing, package builder, pricing, checkout, client portal, admin OS, production workflow) are **not implemented yet** — see `docs/REMAINING_WORK.md`.

## Stack

Next.js 16 (App Router, TypeScript, Turbopack) · Tailwind CSS 4 · shadcn/ui (Base UI) · Supabase (Postgres + Auth) · Zod · Vitest.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project, then copy `.env.example` to `.env.local` and fill in your project's URL and keys:
   ```bash
   cp .env.example .env.local
   ```
3. Apply the migrations in `supabase/migrations/` to your project, in filename order (via the Supabase dashboard's SQL editor, or `npx supabase db push` if the CLI works on your machine).
4. Seed the real 60-service catalog (already extracted from the legacy prototype into `supabase/seed/data/`):
   ```bash
   npm run seed:catalog
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up at `/signup`, confirm the email, sign in at `/login`, and you'll land on `/dashboard`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Zod/permission unit tests (no network) |
| `npm run test:integration` | RLS/auth isolation tests against a real Supabase project (needs `.env.test`) |
| `npm run extract:catalog` | Re-extract the 60-service catalog from `reference/legacy/` |
| `npm run seed:catalog` | Upsert the extracted catalog into your Supabase project |

## Project structure

- `reference/legacy/` — the original single-file HTML prototype, preserved byte-for-byte.
- `docs/` — audit, architecture, schema, status, and roadmap documentation.
- `supabase/migrations/` — SQL migrations (identity + catalog tables, RLS policies).
- `supabase/seed/data/` — the real 60-service catalog, extracted verbatim from the legacy prototype.
- `scripts/` — the extraction and seeding tools.
- `src/app/` — route groups: `(marketing)`, `(auth)`, `(client)`.
- `src/lib/supabase/` — Supabase client/server/middleware helpers (current `@supabase/ssr` App Router pattern).

See `CLAUDE.md` for architecture/business context and `docs/DATABASE_SCHEMA.md` for the schema. `docs/ARCHITECTURE.md`, `docs/API_REFERENCE.md`, and the other docs named in the original project brief are not written yet — tracked in `docs/REMAINING_WORK.md`.

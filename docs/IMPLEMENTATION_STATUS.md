# Implementation Status

Status vocabulary: **Implemented and tested** / **Implemented but unverified** / **Partially implemented** / **Sandbox-only** / **Blocked by external configuration** / **Not implemented**. Updated 2026-11-09.

## Phase 0 — Audit & Preservation

| Item | Status |
|---|---|
| Legacy HTML preserved byte-for-byte in `reference/legacy/` | Implemented and tested (SHA-256 verified identical to source) |
| `docs/LEGACY_AUDIT.md` written | Implemented and tested |

## Phase 1 — Full-Stack Foundation

| Item | Status |
|---|---|
| Next.js 16 + TypeScript + Tailwind 4 scaffold | Implemented and tested (`npm run build` passes) |
| shadcn/ui (Base UI preset) component set | Implemented and tested |
| Brand design tokens (dark theme, colors, fonts, glass/glow utilities) | Implemented and tested (visually verified in browser — marketing/login/signup pages) |
| Folder structure (route groups, lib, types, supabase, scripts, tests) | Implemented and tested |
| Database migrations (identity + catalog, 8 files) | Implemented but unverified — SQL has not been run against a live Postgres instance yet. **Blocked by external configuration**: no hosted Supabase project credentials are available yet. |
| RLS policies (every table enabled + policy) | Implemented but unverified, same blocker as above |
| Role enum reconciliation (legacy 9 roles vs. brief's 11) | Implemented and tested (code review; enum values documented in `docs/DATABASE_SCHEMA.md`) |
| Legacy catalog extraction script | Implemented and tested — ran successfully against the real legacy file, extracted exactly 60 services across the correct 7×A-G category distribution, matched the independently-verified sample data exactly |
| Catalog seed script (`scripts/seed-services.ts`) | Implemented but unverified — **Blocked by external configuration**, has not been run against a live project |
| Supabase Auth (SSR client/server/middleware helpers) | Implemented and tested (manual smoke test: build succeeds, middleware correctly redirects unauthenticated `/dashboard` → `/login?next=...`) |
| Signup / login / dashboard pages | Implemented and tested — visually verified rendering correctly in the browser (marketing page, login form, signup form); **not** tested end-to-end against a real Supabase project (no account was actually created) — that requires live credentials |
| `handle_new_user()` trigger (role never client-supplied) | Implemented but unverified — SQL not yet run live |
| Role-escalation RLS block | Implemented but unverified — SQL not yet run live |
| Removal of legacy's client-side dev role switcher | Implemented and tested (confirmed: no such code exists anywhere in this codebase) |
| RLS/auth integration test suite (`tests/integration/rls-auth.test.ts`) | Implemented but unverified — written and type-checks cleanly, but `describe.skip`s itself when `.env.test` is absent (by design, so CI/local runs don't silently report false passes). **Blocked by external configuration.** |
| Unit tests (Zod validation, permission helpers) | Implemented and tested — 8/8 passing, no network required |
| `tsc --noEmit` | Implemented and tested — zero errors |
| `npm run lint` | Implemented and tested — zero errors/warnings |
| `npm run build` | Implemented and tested — succeeds, all routes correctly classified (static marketing page, dynamic auth/dashboard pages) |
| Docs (README, CLAUDE.md, this file, DATABASE_SCHEMA, DEVELOPMENT_PROGRESS, REMAINING_WORK) | Implemented and tested |

## What "Blocked by external configuration" means here, concretely

A hosted Supabase project needs to exist, with its URL / anon key / service-role key in `.env.local` (and `.env.test` for integration tests). Once that exists:
1. Apply the 8 migrations in `supabase/migrations/` (dashboard SQL editor, in filename order).
2. `npm run seed:catalog` — seeds the real 60-service catalog.
3. `npm run test:integration` — runs the RLS/auth isolation suite; all 6 tests should pass.
4. Manual: `npm run dev`, sign up through `/signup`, confirm the email, sign in, confirm `/dashboard` shows the real profile.

None of this is a code gap — it's a credentials gap. The code paths have been written to the same standard as if credentials existed (typed against the real schema, tested with unit tests where no network is needed, smoke-tested in the browser for rendering and routing behavior).

## Phases 2-8

Not started. See `docs/REMAINING_WORK.md` and the roadmap section of `CLAUDE.md`.

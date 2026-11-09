# Freakin's Studio — Creative Commerce OS

> AI-Powered Digital Production Studio &bull; Design. Create. Produce. Grow.

A full-stack creative commerce platform combining 60 canonical creative services, interactive 7-step package configuration, server-authoritative pricing, client visual proofing with canvas pin annotations, contractual revision quota governance, studio administration OS, and authentic deliverable packaging.

See `CLAUDE.md` for architecture details, and `docs/IMPLEMENTATION_STATUS.md` for the complete feature matrix and verification results.

## Stack

Next.js 16 (App Router, Turbopack, React 19) · Tailwind CSS 4 · Base UI · Supabase (PostgreSQL + Auth + RLS) · Vitest · JSZip.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env.local
   ```
   Provide your Supabase URL and keys in `.env.local`.
3. Apply database migrations:
   Run the 9 migration files in `supabase/migrations/` in sequence in the Supabase SQL editor.
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Next.js 16 production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest unit and workflow test suites |
| `npm run test:integration` | Supabase RLS and auth isolation test suite |
| `npm run extract:catalog` | Re-extract the 60-service catalog from `reference/legacy/` |
| `npm run seed:catalog` | Upsert the canonical catalog into Supabase |

## Environments

1. **Creative Storefront & Public Showcase**: `/`, `/services`, `/services/[id]`, `/portfolio`, `/case-studies`, `/about`, `/how-it-works`, `/contact`, `/faq`, `/privacy`, `/terms`, `/refund-policy`, `/revision-policy`, `/licensing-policy`.
2. **7-Step Package Builder**: `/builder`.
3. **Client Workspace**: `/dashboard`, `/dashboard/projects/[id]`.
4. **Studio Admin OS**: `/admin`.

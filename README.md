# Freakin's Studio — Creative Office OS 2.0

> **DESIGN. CREATE. PRODUCE. GROW.**

A full-stack Next.js 16 + Supabase creative studio operating system uniting **6 free browser-native creative tools**, **5 Puter-login-free Studio-sponsored AI assistants**, **3 AI Micro-Product Kits (`SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`)**, and **13 canonical human creative services** across **4 disciplines** with **15 variants**, **5 commercial bundles**, **14 compatible add-ons**, and **2 consolidated revision rounds**.

## Architecture & Key Safeguards

- **Commercial Integrity**: Canonical Ratebook (`v2.0-pending-ratebook-v8_1`) keeps self-serve checkout gated (`quote_required`) until studio admin approves explicit BDT/USD hourly rates in Supabase. Includes the **5% Launch Promotion Window (20 Nov – 15 Dec 2026, Asia/Dhaka)** and strict **10-Minute Express** preflight + Studio Desk slot confirmation.
- **Human + SI Creative Office**: Complete production lifecycle (`awaiting_brief` → `brief_submitted` → `in_production` → `client_review` → `revision_requested` → `revision_in_progress` → `client_approved` → `completed`), persisted `project_events` audit log, private Supabase Storage `project-assets` signed downloads + SHA-256 checksums, visual pin annotations, and a gated SI assistant review queue (`human_approved` / `rejected`).
- **Studio-Sponsored AI Gateway**: Zero visitor Puter login required. Routes through server-side `/api/ai/generate` with signed `HttpOnly` session cookies (`fs_guest_session`), IP hash metering, BDT daily studio cap, emergency kill switch, and explicit separation between live Puter inference and `DEMO_TEMPLATE_FALLBACK`.
- **Installable PWA**: Web App Manifest (`src/app/manifest.ts`), safe static-only Service Worker (`public/sw.js` bypassing `/api/*`, `/dashboard*`, `/admin*`, `/auth*`), and `/offline` fallback.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), session signing secret (`AI_GUEST_COOKIE_SECRET`), optional Puter server token (`PUTER_SERVER_TOKEN`), and payment gateway keys.
3. Apply database migrations (`supabase/migrations/001` through `014`) in order in your Supabase SQL editor.
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js 16 dev server on port 3000 |
| `npm run build` | Production Next.js build |
| `npm run typecheck` | Strict TypeScript verification (`tsc --noEmit`) |
| `npm run lint` | ESLint verification |
| `npm run test:unit` | Vitest pure-logic unit tests |
| `npm run test:node` | Native `tsx --test` pricing engine verification |
| `npm run test:integration` | Hosted Supabase RLS & auth isolation tests (requires `.env.test`) |
| `npm run test:e2e` | Playwright browser QA suite |
| `npm run seed:catalog` | Seed canonical catalog records into Supabase |

## Official Studio Touchpoints

- **WhatsApp**: `+8801778307704`
- **Email**: `bhaifreakinstudio@gmail.com`
- **Web**: `freakinstudio.space`

# Project Brief — Freakin's Studio Creative Office OS 2.0

*Concise engineering status snapshot — see `docs/` for full audit reports, test logs, and migration procedures.*

## Current Architecture (`Creative Office OS 2.0`)

1. **Canonical Catalog (4 / 13 / 15 / 5 / 14)**: Refactored from the archival 60-service Foundation prototype (`A01..G07`, preserved non-destructively in `legacy_service_map` and `reference/legacy/`) to **4 Disciplines, 13 Core Services (`SRV-01`..`SRV-13`), 15 Variants, 5 Bundles, and 14 Add-ons**. Unapproved Ratebook v8/v8.1 rows remain strictly gated to `Request Quote` (`pricing_status = "quote_required"`).
2. **Modular Frontend & Brand Book v1.0**: Strictly typed modules in `src/features/creative-office/`, `Lato` + `Noto Sans Bengali` + `JetBrains Mono` typography, `#090A0A` / `#D9BD81` / `#F6F4EF` / `#232528` tokens, bilingual EN / বাংলা support, 6 browser-native Free Creative Tools (`/tools`), and isolated Demo Sandboxes / Concept Works labels.
3. **Database & Trusted RPCs (`001`–`014`)**: Forward-only migrations adding `service_variants`, `commercial_bundles`, `legacy_service_map`, durable `inquiries`, event-sourced `project_events`, `ai_gateway_config`, `ai_usage_events`, `credit_ledger`, `microkit_orders`, and reconciled quote/order/payment/approval RPCs.
4. **Human + SI Production Office & Security**: Real quote acceptance → pending order → payment callback initiation, durable Postgres inquiry intake (`503` fail-closed fallback), `.eq("client_id")` + RLS isolation, private storage deliverable ZIP packaging, and server-side Puter AI / Micro-Kit guards.
5. **Installable Safe-Boundary PWA**: `src/app/manifest.ts`, `public/sw.js`, and `/offline` utility shell that explicitly bypasses all authenticated, API, and payment routes.

## Verified Locally vs External Staging Gates

- **Verified Locally**: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit` (56/56), `npm run test:node` (4/4), and `tests/integration/order-lifecycle.test.ts` (1/1).
- **Blocked by External Configuration**:
  1. Hosted Supabase staging migrations (`009`–`014`), catalog seed (`npm run seed:catalog`), and `tests/integration/rls-auth.test.ts` (`.env.test`).
  2. Owner Ratebook v8/v8.1 BDT & USD per-service approval in Supabase.
  3. Live Stripe, SSLCommerz, and server-only `PUTER_SERVER_TOKEN` staging verification.
  4. Headless Chromium binary installation (`npx playwright install`) for Playwright visual/responsive E2E execution.
  5. GitHub feature branch PR synchronization (no `.git` directory present in container).

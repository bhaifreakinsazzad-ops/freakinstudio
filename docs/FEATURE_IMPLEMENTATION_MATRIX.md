# Feature Implementation Matrix — Creative Office OS 2.0

**Classification Vocabulary:**
- **Verified Live**: End-to-end verified against live external infrastructure (Supabase / Stripe / SSLCommerz / Puter / Chromium).
- **Local Real (Code & Unit/Node/Build Verified)**: Fully implemented real server/client logic, compiled and verified locally; awaiting external credentials/DB for live staging run.
- **Simulated / Demo Labelled**: Explicitly isolated interactive preview or fallback labeled `DEMO SANDBOX` or `CONCEPT WORK` so it is never confused with real client or paid records.
- **Backend Pending / External Gate**: Code implemented or gated pending owner approval (`Ratebook v8/v8.1`) or external merchant/API onboarding.

---

| Area | Feature / Module | Primary Files | Classification | Honest Notes & Remaining External Gate |
|---|---|---|---|---|
| **Catalog** | 4 Disciplines, 13 Services, 15 Variants, 5 Bundles, 14 Add-ons | `src/lib/catalog/index.ts`, `supabase/migrations/20261121000011_canonical_catalog_ratebook.sql` | **Local Real / Pending Ratebook v8.1** | Counts & compatibility verified by unit/node tests; self-serve checkout gated to `quote_required` until Owner Ratebook v8/v8.1 BDT/USD rates are approved in DB |
| **Catalog** | Legacy Archive (`A01..G07`) Preservation | `src/lib/catalog/index.ts`, `legacy_service_map` | **Local Real** | Historical IDs remain readable (`pricing_status: "quote_required"`) without breaking past orders |
| **Pricing** | Server Hourly Engine + 5% Dhaka Launch Promo (`20 Nov – 15 Dec 2026`) | `src/lib/pricing/engine.ts`, `src/app/api/pricing/quote/route.ts` | **Local Real** | Ignores browser `evaluationDate`; applies `Asia/Dhaka` server clock; retires unapproved `+35%` default rush; verified by Vitest & Node runner |
| **Express 10-Min** | Micro-Edit Eligibility (`SRV-02/05/13` + `studioSlotConfirmed === true`) | `src/lib/pricing/engine.ts`, `SmartBriefBuilder.tsx`, `package-builder-client.tsx` | **Local Real** | Strictly rejects missing/unconfirmed studio desk slots (`=== true` required) |
| **Builder & Quotes** | Smart Package Builder + Quotation Request (`p_terms_accepted`) | `src/app/(marketing)/builder/*`, `create_quotation_request` RPC | **Local Real (DB Pending Staging)** | Requires Supabase staging migration `014` for persisted submission |
| **Checkout** | Quote Acceptance → Pending Order → Payment Session | `src/app/(client)/actions.ts`, `create_pending_order`, `settle_verified_payment` | **Local Real / Merchant Gate** | Stub redirect removed; requires staging Supabase + Stripe/SSLCommerz keys for live settlement |
| **Contact Intake** | Durable Inquiry Submission + Admin Inbox | `src/app/api/contact/route.ts`, `inquiries` table | **Local Real (DB Pending Staging)** | Verified fail-closed `HTTP 503` with WhatsApp/email fallback when Supabase unavailable |
| **Client Office** | Auth-Isolated Dashboard & Project Workspace | `src/app/(client)/dashboard/**` | **Local Real (DB Pending Staging)** | Explicit `.eq("client_id", profile.id)`, `404`/`503` separation, real storage signed/error states, no stock fallback image |
| **Download Gate** | Cryptographic Binary Deliverable ZIP + Buyout License | `src/app/api/projects/[id]/download/route.ts` | **Local Real (DB Pending Staging)** | Enforces auth (`401`), ownership (`403`), paid status (`402`), approval (`422`), storage integrity (`502`), unconfigured DB (`503`) |
| **Admin OS** | Production Kanban, Assignments, Proof Upload, Events, AI Kill Switch | `src/app/(admin)/admin/**` | **Local Real (DB Pending Staging)** | Enforces `studio_admin`/`super_admin`; writes `project_events` & `audit_logs` |
| **Human + SI Timeline** | Event-Sourced Workflow (`human_expert`, `si_assistant`, `client`, `system`) | `project_events` table, `project-workspace-client.tsx`, `admin-console-client.tsx` | **Local Real (DB Pending Staging)** | Clearly marks SI proposals (`Suggested`) vs (`Human Approved`) |
| **AI Gateway** | Zero-Login Puter Adapter, Signed Guest Quota, Budget & Kill Switch | `src/lib/ai/provider.ts`, `src/lib/ai/session.ts`, `/api/ai/generate`, `/api/tools/me` | **Local Real / Puter Key Pending** | Works cleanly without Supabase/Puter using `DemoTemplateProvider` (`isRealAi: false`); switches to real upstream calls only when `PUTER_SERVER_TOKEN` succeeds |
| **AI Micro-Kits** | `SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199` | `src/lib/microkits/service.ts`, `/kits`, `credit_ledger`, `microkit_orders` | **Backend Pending / Merchant Gate** | Ledger & generation code unit-tested; paid checkout remains gated until live merchant webhooks & margin telemetry are verified |
| **Free Tools** | 6 Browser-Native Privacy Tools (`/tools`, `/playground`) | `src/features/creative-office/components/FreeCreativePlayground.tsx` | **Local Real** | Runs 100% locally in browser Canvas/File APIs with no login required |
| **Frontend Refactor** | Modular Strictly Typed Creative Office OS 2.0 | `src/features/creative-office/**` | **Local Real** | Eliminated `// @ts-nocheck` and `/* eslint-disable */`; `tsc --noEmit` and `eslint` pass with 0 errors |
| **Demo Sandboxes** | Interactive Office Preview & Concept Works Showcase | `SandboxWorkspaces.tsx`, `CANONICAL_CONCEPT_WORKS` | **Simulated / Demo Labelled** | Explicitly badged `DEMO SANDBOX (NOT LIVE DATABASE)` and `CONCEPT WORK — NOT CLIENT WORK` |
| **PWA & Offline** | Web Manifest, Icons, Network-First Safe Public Service Worker & `/offline` | `src/app/manifest.ts`, `public/sw.js`, `src/app/offline/page.tsx`, `next.config.ts` | **Local Real (Browser Install Unverified)** | `/sw.js`, `/manifest.webmanifest`, `/offline` verified HTTP 200; strictly bypasses `/api/*`, `/dashboard*`, `/admin*`, `/auth*`; Chromium install recording blocked by absent browser binary |

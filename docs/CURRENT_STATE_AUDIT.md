# Current State Audit (Phase 0 Baseline)

**Audit Date:** 2026-11-21  
**Workspace:** `/app/applet` (Next.js `16.4.5`, React `19.3.1`, `@supabase/supabase-js` `2.119.0`, Tailwind CSS `4.3.5`, Vitest `5.1.0`, Playwright `1.65.0`)  
**Repository Note:** No `.git` metadata directory is present in `/app/applet`, so `git status` / `git rev-parse HEAD` returned `fatal: not a git repository`. No live `.env.local`, `.env.test`, Supabase, Stripe, SSLCommerz, or Puter credentials exist in the container environment.

---

## 1. Baseline Verification Results (Run Fresh on Current Workspace)

| Check | Command | Result | Exact Observed Outcome |
|---|---|---|---|
| Git state | `git status && git rev-parse HEAD` | **BLOCKED / N/A** | `.git` directory absent (`fatal: not a git repository`) |
| TypeScript | `npm run typecheck` | **FAIL** | `src/app/(client)/dashboard/page.tsx(110,6): error TS2304: Cannot find name 'DashboardClient'.` (`src/features/creative-office/creative-office-os.tsx` also suppressed via `// @ts-nocheck`) |
| ESLint | `npm run lint` | **FAIL** | 1 error (`DashboardClient` undefined in `dashboard/page.tsx:110:6`), 3 warnings (`Link`, `redirect` unused in `dashboard/page.tsx`; `isAdminRole` unused in `dashboard/projects/[id]/page.tsx`); `creative-office-os.tsx` suppresses `/* eslint-disable */` |
| Production Build | `npm run build` | **FAIL** | Turbopack compiled in 7.4s, failed in TypeScript step on `DashboardClient` in `src/app/(client)/dashboard/page.tsx` |
| Unit Tests (Vitest) | `npm run test:unit` | **PASS (with blindspots)** | 7 files, 49 tests passed; `src/lib/pricing/engine.node.test.ts` is excluded and `tests/unit/pricing-engine.test.ts` asserted invented `1500 BDT/hr` rates |
| Node Test Runner | `node --test src/lib/pricing/engine.node.test.ts` | **FAIL** | `ERR_MODULE_NOT_FOUND` importing `./engine` under raw Node ESM without `.ts` / `tsx` |
| Integration Tests | `npm run test:integration` | **PARTIAL / SKIPPED** | `tests/integration/order-lifecycle.test.ts` passed (1 test); `tests/integration/rls-auth.test.ts` **SKIPPED** (7 tests) due to missing `.env.test` / hosted Supabase |
| E2E Tests | `npm run test:e2e` | **NOT RUN / STALE** | Playwright assertions in `tests/e2e/commerce.spec.ts` target obsolete `/builder` heading (`Signature Package Builder`, `Define Campaign & Commercial Objective`) and Playwright browser binary dir `~/.cache/ms-playwright` is empty |

---

## 2. Prioritized Defect Register (P0 / P1 / P2)

### P0 — Blocking Build, Commercial Truth, Data Durability, and Security
1. **Broken Build / Missing Import (`src/app/(client)/dashboard/page.tsx`)**: Renders `<DashboardClient />` without importing it; missing `if (!profile) redirect("/login")` guard and missing explicit `.eq("client_id", profile.id)` filters on `projects`/`quotes`/`orders`.
2. **Commercial Ratebook Conflict (`src/lib/catalog/index.ts`, `src/lib/pricing/engine.ts`)**: `CANONICAL_SERVICES` assigns uniform invented `৳1,500/hr` and `$15/hr` with `pricing_status: "approved"` even though owner-approved `Ratebook v8/v8.1` per-service line rates are not present in the repo. Must mark unresolved services as `quote_required` and block direct self-serve checkout until owner-approved rates are populated in DB/ratebook.
3. **Promo Clock & Express Preflight Bugs (`src/lib/pricing/engine.ts`, `/api/pricing/quote`, `builder/actions.ts`)**:
   - `isLaunchPromoActive()` returns `false` when `evaluationDate` is omitted, and `builder/actions.ts` omits it (skipping the server promo window), while `/api/pricing/quote` accepts client-supplied `evaluationDate`. Server calculations must default to `new Date()` evaluated in `Asia/Dhaka`.
   - `evaluateExpress10MinEligibility()` checks `studioSlotConfirmed !== false` instead of `=== true`, passing when `studioSlotConfirmed` is `undefined`.
   - Unknown service IDs, mismatched add-ons, and bundle + service combinations need strict server validation.
4. **Database Schema & RPC Mismatch (`supabase/migrations/20261109000006`, `009`, `010`)**:
   - DB `service_categories`, `services`, and `add_ons` still reflect legacy `A..G` / `A01..G07` structure (`scripts/seed-services.ts` asserts 60 legacy services) and lack `service_variants`, `commercial_bundles`, `estimated_hours`, `express_eligible`, and `ratebook_version`.
   - `create_quotation_request` RPC lacks `p_terms_accepted` parameter sent by `builder/actions.ts` and doesn't persist `ratebook_version`/hourly breakdown; `create_pending_order` ignores variant multipliers, compatible add-ons, bundles, and the 5% promo; `database-extended.types.ts` mismatches SQL args.
   - TS queries in `admin/page.tsx`, `dashboard/page.tsx`, `projects/[id]/page.tsx`, and `projects/[id]/actions.ts` reference non-existent SQL columns (`total_bdt`, `total_usd`, `status`, `payment_gateway`, `mime_type`, `version_number`, `legal_terms_accepted`).
5. **Stub Quotation Acceptance (`src/app/(client)/actions.ts`)**: `acceptQuoteAndCheckoutAction` validates auth then returns `/dashboard?gateway=...` without validating quote ownership/status, creating a DB order, or initiating a payment session.
6. **Non-Durable Contact Form (`src/app/api/contact/route.ts`)**: Uses in-memory `Map` and anonymous client insert to `audit_logs` (blocked by RLS) while always returning HTTP 200 `"durably logged"`. Needs dedicated `inquiries` table + privileged server write + fail-closed 503 with official WhatsApp/email fallback on failure.
7. **Synthetic Asset Fallbacks & Missing Error Differentiation (`dashboard/projects/[id]/page.tsx`, `project-workspace-client.tsx`, `admin/page.tsx`)**:
   - `projects/[id]/page.tsx` lacks explicit ownership/staff check in page code, maps missing `storage_path` to `/images/portfolio/brand-identity.jpg`, and swallows DB errors into `notFound()`.
   - `project-workspace-client.tsx` falls back to `/images/portfolio/brand-identity.jpg` and `"asset-master"` ID.
   - `admin/page.tsx` masks DB errors as empty `[]`.
   - `navbar.tsx` checks invalid roles `admin` / `operations_manager` instead of `studio_admin` / `super_admin`.
8. **Public Exposure of Internal Planning Docs**: `public/assets/aistudio/` exposed internal audit docs, master prompt, risk register, and PDFs over HTTP `/assets/aistudio/...`.

### P1 — Human + SI Workflow, Real AI Gateway, and Micro-Kits
9. **Event-Sourced Production Workflow**: Missing `project_events` table & timeline UI distinguishing `human_expert`, `si_assistant` (`Suggested` vs `Human Approved`), and `system`; missing admin team assignment, deliverable proof registration, and signed preview URLs.
10. **AI Gateway (`src/app/api/ai/generate/route.ts`)**: Currently returns static hardcoded templates; ignores real Puter server adapter/model metadata, lacks guest session & DB rate/quota/budget metering, and accepts client `clientKillSwitchActive`.
11. **AI Micro-Kits (`SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`)**: No verified payment, credit reservation, idempotent generation, artifact export, or refund ledger exists yet—must either implement full server pipeline or gate paid checkout behind verified merchant rails.

### P2 — Frontend Refactor, Real PWA, QA & Handoff
12. **Monolith Refactor (`src/features/creative-office/creative-office-os.tsx`)**: 4,992 lines with `/* eslint-disable */` and `// @ts-nocheck`; mixes brand data, demo projects, and 6 utilities in a single file.
13. **PWA Service Worker**: Manifest and install button exist, but no Service Worker caches the public offline shell/utilities safely while excluding private `/dashboard*`, `/admin*`, `/auth*`, and `/api/*` routes.
14. **Documentation & Tests**: `README.md`, `CLAUDE.md`, `PROJECT_BRIEF.md`, `tests/e2e/commerce.spec.ts`, and `src/lib/pricing/engine.node.test.ts` require updates to match reality.

---

## 3. Post-Remediation Status Summary (2026-11-21)

- **P0 Items Resolved in Code**:
  - `src/app/(client)/dashboard/page.tsx` import & auth/ownership filters repaired; `/api/projects/[id]/download` hardened (`401`/`402`/`403`/`404`/`422`/`502`/`503`).
  - `src/lib/catalog/index.ts` and `src/lib/pricing/engine.ts` enforce `pricing_status = "quote_required"` and `RATEBOOK_APPROVED = false` until Owner Ratebook v8/v8.1 rates are approved; `Asia/Dhaka` server-clock 5% launch promo (`20 Nov – 15 Dec 2026`) and strict `studioSlotConfirmed === true` Express 10-Min gating enforced.
  - Forward-only SQL migrations `011`–`014` created cleanly without deleting legacy `A01..G07` records; `acceptQuoteAndCheckoutAction()` wired to verified quote ownership, `create_pending_order`, and provider checkout initiation.
  - Durable contact intake wired to `public.inquiries` with fail-closed `HTTP 503` WhatsApp/email fallback; internal planning docs moved from `public/assets/aistudio/` to `docs/archive/aistudio/` (`HTTP 404` on public route).
- **P1/P2 Items Resolved in Code**:
  - Event-sourced Human + SI production timeline (`project_events`), admin proof uploads, Puter Server AI adapter with signed guest session quota & budget kill switch (`tryPrivilegedClient` graceful fallback), and Micro-Kits credit/refund ledger (`SKU-SHOP-49/99/199`, merchant-gated).
  - 5,000-line `creative-office-os.tsx` monolith split into typed strict-TS modules (`src/features/creative-office/**`) with zero `// @ts-nocheck` or `/* eslint-disable */`.
  - Brand Book fonts (`Lato`, `Noto Sans Bengali`, `JetBrains Mono`) and safe public-only Service Worker (`public/sw.js`, `/offline`) implemented.
- **Remaining External Blockers**: `.git` history missing in container, hosted Supabase staging credentials (`.env.test`), Owner Ratebook v8/v8.1 DB approval, Stripe/SSLCommerz/Puter live tokens, and Playwright Chromium binary (`npx playwright install`).


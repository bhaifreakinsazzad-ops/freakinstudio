# Freakin's Studio — Production Release Checklist (Creative Office OS 2.0)

**Version:** `2.0.0-STAGING-CANDIDATE`  
**Operating Mode:** Staging-Ready Candidate — **Do NOT deploy, merge to `main`, alter production data, or activate live payments without explicit owner release authorization.**

---

## 1. Local Code Quality, Security & Automated Test Gates (Verified)

- [x] **TypeScript (`npm run typecheck`)**: Passes with 0 errors (`tsc --noEmit` without `@ts-nocheck` bypasses in app code).
- [x] **ESLint (`npm run lint`)**: Passes with 0 errors and 0 warnings (`eslint` across `src/` & `tests/`, no `eslint-disable` bypasses).
- [x] **Next.js Production Build (`npm run build`)**: Compiles all routes and API handlers cleanly.
- [x] **Unit Tests (`npm run test:unit`)**: 8 files / 56 tests passing (`catalog`, `pricing-engine`, `workflow`, `payments`, `multiuser-security`, `auth-validation`, `permissions`, `ai-and-microkits`).
- [x] **Pure Logic Node Suite (`npm run test:node`)**: 4/4 tests passing (`src/lib/pricing/engine.node.test.ts`).
- [x] **Local Lifecycle Integration (`tests/integration/order-lifecycle.test.ts`)**: 1/1 28-step test passing (`quote_required` gating + approved quote-to-delivery lifecycle).
- [x] **Public Static Surface Security**: Relocated internal planning/audit docs and PDFs from `/public/assets/aistudio/` to `/docs/archive/aistudio/` (`HTTP 404` confirmed).
- [x] **PWA Offline Shell & Boundary**: `public/sw.js` precaches public offline utility assets while strictly bypassing `/api/*`, `/dashboard*`, `/admin*`, `/auth*`, `/login*`, `/signup*`.
- [x] **Bilingual Brand & Typography**: `Lato`, `Noto Sans Bengali`, and `JetBrains Mono` loaded via `next/font/google`; Brand Book v1.0 tokens and official contacts preserved.

---

## 2. External Blocking Gates (Required Before Production Go-Live)

- [ ] **GitHub Source Control / PR Review**: Environment lacks `.git` directory; sync feature branch to GitHub (`https://github.com/bhaifreakinsazzad-ops/freakinstudio`) and open PR for human review.
- [ ] **Owner Ratebook v8/v8.1 Approval (`RATEBOOK_APPROVED`)**: Populate verified per-service BDT & USD hourly rates in Supabase (`services` + `commercial_bundles`) and set `pricing_status = 'approved'` & `ratebook_approved = true` only on approved items. Self-serve checkout remains locked to `Request Quote` until approved.
- [ ] **Staging Supabase Database Migrations**: Take staging backup (`pg_dump`) and apply `20261109000009` through `20261121000014` sequentially, followed by `npm run seed:catalog` (`SUPABASE_SERVICE_ROLE_KEY`).
- [ ] **Live Supabase RLS Integration (`tests/integration/rls-auth.test.ts`)**: Currently **SKIPPED** (7 tests) without `.env.test`; run against isolated staging DB to verify multi-user A/B/admin RLS isolation.
- [ ] **Playwright Chromium E2E (`npm run test:e2e`)**: Currently **BLOCKED** by missing headless Chromium binary (`/ms-playwright/chromium_headless_shell-*`); install browser (`npx playwright install chromium`) in CI/staging runner and verify `1440px` desktop & `360px` mobile renders + PWA installability.
- [ ] **Payment Gateway Onboarding (`STRIPE_SECRET_KEY`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`)**: Verify real webhook settlement callbacks in sandbox/staging before enabling paid project checkout or AI Micro-Kits (`SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`).
- [ ] **Puter Sponsored AI Token (`PUTER_SERVER_TOKEN`, `AI_GUEST_COOKIE_SECRET`)**: Configure server-only token and strong HMAC secret; confirm live provider telemetry & daily budget cap (`daily_budget_cap_bdt`) before switching off `DEMO_TEMPLATE_FALLBACK`.

---

## 3. Rollback & Go / No-Go Sign-Off

- **Rollback Plan**: Documented in `/docs/MIGRATION_PLAN.md` (non-destructive forward-only SQL preserves historical `A01..G07` orders and schema integrity).
- **Release Decision**: **NO-GO FOR PRODUCTION DEPLOYMENT** until External Blocking Gates in Section 2 pass in isolated staging and the owner signs off explicitly.

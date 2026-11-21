# FREAKIN’S STUDIO — CODEBASE AUDIT (READ ONLY)

**Audit basis:** GitHub-connected, read-only inspection of live repository source files, complete `main` tree listing (245 entries; `truncated=false`), current `package.json`, migrations, marketing/client/admin routes, server actions, payment adapters, test files, release docs and open Draft PR #6.
**Commit pinned:** `9241d1cc41ff57f8710520cdfab65abdc47e827c` (main, 2026-11-17).
**Limitation:** This is **source-level inspection, not a freshly cloned local build or a live DB/security penetration test**. Repository docs claim historical tests; this audit has **not re-run** them. Not every binary image and line of all files was visually analyzed. Re-audit changed files and run CI when implementation begins.

## 1. Repository topology / existing foundations
| Part | Current location | Current evidence | Recommendation |
|---|---|---|---|
| Framework | `package.json`, `next.config.ts` | Next.js `16.4.5`, React `19.3.1`, TypeScript, Tailwind 4, `cacheComponents: true`, `output: standalone` | **REUSE**, preserve App Router and package lock. Check Next 16 version-specific `AGENTS.md`/local docs before changes. |
| Authentication | `src/app/(auth)`, `src/lib/auth`, `src/lib/supabase` | Supabase Auth with SSR cookie refresh, role lookup | **REUSE + AUDIT**; guard each route/action/RPC; Proxy alone not sufficient. |
| Catalog | `src/lib/catalog/index.ts`, `supabase/seed/data/` | Hardcoded legacy fallback to 60/7/283, historic A01 IDs | **REPLACE CATALOG SOURCE** with owner-approved 13/15/5/14 version; preserve legacy in archive. |
| Public pages | `src/app/(marketing)/` | Home, services, builder, portfolio, cases, policies, contact | **REDESIGN** according to supplied prototype and approved brand, preserving valid navigational behavior. |
| Quote Builder | `src/app/(marketing)/builder`, `/api/pricing/quote` | Seven-step old package, client-side display calculation and RPC-backed quotation | **REWORK** as intent-to-brief + hours/scope + versioned server-approved quotation. |
| Payments | `src/lib/payments`, `src/app/api/payments` | SSLCOMMERZ/Stripe adapters, callback routes, DB-RPC settlement | **REUSE ONLY AFTER STAGING VERIFICATION**; don't allow live charge before migration and webhook validation. |
| Client Office | `src/app/(client)/dashboard` | Brief, proofing, revision, final download paths present | **REUSE selectively**; eliminate fabricated content, improve state/event model and private media access. |
| Studio Admin | `src/app/(admin)/admin` | Kanban and price updates, live DB attempts with hardcoded fallback data | **FIX FIRST**, change fake records to empty/error states; implement manual owner operations. |
| Database | `supabase/migrations/` | Ten versioned SQL files, tables for quotes/orders/projects/assets; migration 10 RPCs | **STAGE/AUDIT FIRST**. No live DB state verified in current turn. |
| QA | `tests/unit`, `tests/integration`, `tests/e2e` | Vitest + Playwright suites; previous results in docs | **REWRITE STALE ASSERTIONS** and run fresh; historic pass claims are not current evidence. |
| PWA/AI | No `manifest.ts`, service worker, Puter/Motion/Three deps in inspected tree/package | B+C+D Creative Office features not implemented | **NEW MODULES** after basic workflow/quoting and security. |

## 2. Confirmed critical findings (by source)

### R01 — Obsolete master catalog recurs throughout the application (P0)
`CLAUDE.md`, `README.md`, `src/app/(marketing)/page.tsx`, `src/app/(marketing)/services/page.tsx`, `src/lib/catalog/index.ts`, `scripts/seed-services.ts` and `tests/unit/catalog.test.ts` treat **60 services / 7 categories / 283 add-ons** as authoritative. The owner has since approved **13 services / 4 disciplines / 15 variants / 5 bundles / 14 add-ons**. A UI-only change would leave database, API, and tests contradicting the approved public business.
**Required:** normalized new canonical version, explicit variant, bundle and addon models; migration of seeded catalogs without deleting historical FK-linked commercial records; eliminate old 60-service public fallback; new test oracle 13/15/5/14.

### R02 — Pricing engine contradicts approved hourly commerce (P0)
`src/lib/pricing/engine.ts` defaults to 35% rush surcharge and counts base price × quantity rather than hourly rate × approved hour cap. Its enterprise policy is imported in `src/app/(marketing)/builder/actions.ts`. `src/app/(marketing)/services/[id]/page.tsx` also displays `x1.35`. SQL `create_quotation_request` in migration 10 references `services.base_bdt/base_usd` rather than a versioned hourly scope snapshot and (in the inspected section) does **not** check service `price_approved_at` before computing quoted amounts.
**Required:** server-authoritative Decimal arithmetic and immutable quote line snapshots, ratebook version, hours, addon time, promotion window (20 Nov–15 Dec 2026 Asia/Dhaka), approval lifecycle; remove unsolicited rush multiplier; quote-only until verified.

### R03 — Fabricated client project and admin business events (P0 trust)
`src/app/(client)/dashboard/projects/[id]/page.tsx` synthesizes a project, tasks and a mock asset for any missing project. `src/app/(admin)/admin/page.tsx` ships `FALLBACK_PROJECTS`, `FALLBACK_QUOTES`, `FALLBACK_ORDERS` (some marked paid), and `FALLBACK_AUDIT_LOGS`. The PR #6 client portal diff removes *client* synthetic fallback, but does **not** remove the admin fixtures and is unmerged/unverified.
**Required:** nonexistent project → 404; empty datasets → legitimate empty states; DB unavailable → explicit error; demo data only in isolated demo environment with permanent `DEMO DATA` labels. No fake percentage, payment or agent status.

### R04 — Unverified case studies and outcome claims (P0 truth)
`src/app/(marketing)/page.tsx`, `/portfolio/page.tsx`, `/case-studies/page.tsx` feature statements such as `4.8x Series-A pitch confidence`, `1.4M organic launch views`, `+42% ROAS uplift`, and investor funding claims. They are not backed by evidence in the attached plans and must **not** be presented as completed real client work.
**Required:** replace with reviewed spec/concept portfolio, visibly label “Concept Study — Not Client Work”; remove fake testimonial quotes, metrics and performance guarantees.

### R05 — Contact confirmation can succeed without saving the inquiry (P0 lead loss)
`src/app/api/contact/route.ts` attempts to insert into `audit_logs` in a swallowed try/catch; it returns `ok:true` even if the DB insert fails. This is not a guaranteed inbox/notification pipeline. `src/app/(marketing)/contact/page.tsx` shows `ops@freakinstudio.com`, `billing@freakinstudio.com`, self-stated operating hours/location not supplied as approved contact facts.
**Required:** dedicated `inquiries` table or verified queue, persisted reference before success response, idempotency, rate limit, notifications and manual admin inbox; official owner-confirmed WhatsApp `+8801778307704`, email `bhaifreakinstudio@gmail.com`, website `freakinstudio.space` only.

### R06 — Payment/database deployment documentation conflicts (P0 financial)
`docs/DATABASE_DEPLOYMENT_VERIFICATION.md` claims migration 009 tables respond on remote REST, but `docs/STAGING_DEPLOYMENT.md` still instructs applying 009 and 010, and the former states RPC migration 010 returns 404/missing. Historical docs do not establish the **current** live Supabase state. Callback routes call `settle_verified_payment` RPC with privileged client. **No production payment readiness can be inferred.**
**Required:** read-only live introspection of migration history and RPC signatures, compare with git SQL, migration plan/backup, exact payment callback tests in sandbox, positive and negative tests including amount/currency mismatch, double callback and refund/credit reconciliation. Never trust browser redirect as settlement.

### R07 — Project files need hardened authorization/preview (P0 privacy)
`src/app/(client)/dashboard/projects/[id]/project-workspace-client.tsx` contains preview based on `storage_path` beginning with `/` (or shows a placeholder), while download route attempts verified private storage retrieval; no claim that private previews actually work can be made from inspection. `src/app/api/projects/[id]/download/route.ts` builds deliverable ZIPs after ownership/payment/status checks, but must be tested with two real tenants and private bucket RLS.
**Required:** private storage path ownership, signed short-lived URLs or authenticated stream, one-project-only upload/download, MIME/size scan, asset version approvals, signed-URL expiry, authorization in every path.

### R08 — Admin status updates need state machines and events (P1)
`src/app/(admin)/admin/actions.ts` accepts `newStatus` from client and updates `projects.status`. It authenticates as admin but current inspected action does not show a state-transition matrix or transactional event write. Existing project data model doesn't give a durable truthful Human/SI/automation event rail.
**Required:** server-side allowed transition graph; append-only `project_events` with actor_kind, actor_id, reason, timestamp, trace; atomic task/asset/status updates; permission distinctions for human experts, SI proposals and client approvals.

### R09 — Next and Supabase guardrails (P0 security)
`src/proxy.ts` + `src/lib/supabase/middleware.ts` refresh sessions and redirect unauthenticated users; this is a useful base, **not** complete authorization. `src/lib/supabase/privileged.ts` is server-only and fails closed when credentials missing. Supabase migration 009 has RLS policies but must be tested against new added tables.
**Required:** owner checks on Server Actions, Route Handlers, and transaction RPCs; no service role or Puter owner token in any client code; storage RLS, database grants; no `SECURITY DEFINER` without explicit review of EXECUTE rights, search_path, authorization and schema exposure.

### R10 — Docs/tests are not synced with owner decisions (P1 maintainability)
`tests/unit/catalog.test.ts` enforces 7/60/283/327; `tests/unit/pricing-engine.test.ts` expects 35% rush. `src/lib/i18n/context.tsx` still renders `Services (60)` and `Rush Delivery (+35%)`. `CLAUDE.md` asks engineers to preserve the now-unapproved 60 catalog. Older release documents claim different pass counts/dates; no fresh CI was run during this analysis.
**Required:** source-of-truth migration, tests and docs same commit; snapshot tests (13/15/5/14), pricing time boundaries, accurate statuses. Preserve legacy as historical reference, not active truth.

### R11 — PWA and Puter B+C+D not yet built (P1/P2)
Repo has **no manifest/service worker** in the enumerated tree; package dependencies do not currently include Puter.js, Motion, Anime.js, Three.js or R3F. Existing TS/React framework provides a workable integration base.
**Required:** add only necessary pinned dependencies after prototype inspection; browser-local tools without auth; protected Studio AI proxy with owner-billed provider choice and hard budgets; micro-SKU ledger with verified settlement; explicit PWA private cache exclusion.

### R12 — Existing Draft PR #6 is useful but not production-ready (P1)
[PR #6](https://github.com/bhaifreakinsazzad-ops/freakinstudio/pull/6) is open/draft, not merged. It changes 3 files: client dashboard list, client project detail, and a 49-line Phase 1 note. It explicitly reports **no build or live RLS validation**. Its intended removal of fabricated client project records is useful, but its code is not a substitute for the full Creative Office implementation.
**Required:** compare/inspect its patch against latest `main`, selectively cherry-pick/reimplement *after* tests; do not auto-merge or claim successful staging.

## 3. Source priority for engineering
1. New explicit Owner Approval, including future attached approved prototype as **visual and interaction reference**.
2. Official Brand Book/Logo, approved creative ratebook, catalog (13/15/5/14), express and launch policies.
3. `Freakins_Studio_Creative_Office_OS_v2` Master Plan + Agent Directive and Prototype Handoff.
4. Current GitHub source code **only for implementation realities and reusable functionality**.
5. Historical `CLAUDE.md`, legacy HTML and 60-service seed **only as migration/historical evidence**, never current business policy.

When two sources conflict, state the exact conflict and prioritize higher authority. Do not silently override an owner-approved decision.

## 4. Target architecture
`Visitor → public Next.js routes (local tools) / secure `/api/ai/*` → guest budget + abuse guards → Puter Worker owner-context or approved provider adapter → output`.
`Client → Supabase Auth → approved hours/quote → real order/payment (or manual verified quote) → project + tasks + events → proof / revision / delivery`.
`Studio Team → role authorization + manual inbox/assignment/task updates → audited production events → client realtime read model`.

**Required platform modules:** `catalog`, `pricing`, `creative-playground`, `ai-provider`, `usage-quota`, `ai-micro-commerce`, `requests`, `projects`, `production-events`, `creative-proofing`, `private-assets`, `payments`, `notifications`, `studio-admin`, `pwa`, `analytics`.

## 5. Validations (not performed here)
- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration`, `npm run build`, `npm run test:e2e` on a controlled checkout/staging instance.
- RLS/grants and ownership tests across anon/clientA/clientB/admin/staff; private storage preview and download, session expiry, invite and password reset.
- Migration 009/010 live state, RPC EXECUTE and server-price anti-tamper proofs.
- Browser tests of every visible CTA, B+C+D production modes and PWA offline privacy.

**Audit conclusion:** Reuse Next.js/Supabase/commerce/security scaffolding, but resolve false source truth and actual data integrity before integrating a new visual prototype. A working frontend design alone will not solve database/RPC/quote/progress inconsistencies.

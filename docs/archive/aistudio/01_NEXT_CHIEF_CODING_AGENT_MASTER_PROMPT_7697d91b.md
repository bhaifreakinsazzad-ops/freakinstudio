# FREAKIN’S STUDIO — NEXT MASTER EXECUTION DIRECTIVE 16.0
## Re-Audit Recovery, Commercial Integrity, Real Online Office & Staging-Ready Release

**To:** Chief Full-Stack Engineer, Senior Next.js Developer, Supabase Architect, Security Engineer, AI Engineer, Senior QA Engineer and Design Integration Lead.

**Repository:** https://github.com/bhaifreakinsazzad-ops/freakinstudio  
**Audited `main` HEAD:** `db59aad90d199681049ca8814bb9d2c8472d3b60` (21 November 2026, 01:20:43 UTC).  
**Prior reference:** `9241d1cc41ff57f8710520cdfab65abdc47e827c`.  
**PR status at audit:** PR #6 merged into `main`; no open PR found.  
**Operating mode:** Implement on a new feature branch and isolated staging; do not merge to main, alter production Supabase, initiate real payments, expose tokens, change DNS, or publish without an explicit release decision.

---

## 0 — What you are building

Transform the **existing Next.js 16 + Supabase repository**, without a ground-up rewrite, into the authentic **Freakin’s Studio Creative Office OS**: conversion-focused public site, functional no-login browser tools, honest sponsored AI and paid micro-kits, correct approved creative catalog/ratebook, minimal-friction smart brief, secure client office, manually operated human/SI production dashboard, authentic project tracking/proofing/delivery, and installable progressive web app.

**User intent:** a client must understand available services and pricing easily; someone who never purchases must still gain tangible value; a paying client can provide detailed instructions and see truthful human/SI work, actual progress, feedback and deliverables. The owner manually controls production and all consequential actions; SI proposes/drafts and assists, never fabricates completion.

**Do not claim 100% complete without executed acceptance evidence.** Never fabricate tests, client reviews, metrics, payments, activity logs, runtime provider calls or portfolio case studies.

## 1 — Mandatory source precedence and attachments

1. The owner's newest explicit approvals and official brand/canonical **hourly ratebook, scoped variants, bundle calculations, add-ons and delivery policy**.
2. Owner-approved separate frontend prototype/screens/assets (if attached). The current repository's `src/features/creative-office/creative-office-os.tsx` is a **candidate prototype**, not automatically final design approval.
3. The `Freakins_Studio_Creative_Office_OS_v2_Complete_Planning_Handoff.zip` and `Freakins_Studio_Frontend_Prototype_Agent_Handoff_v1.zip`.
4. This packet: `00_STATUS_AND_NEXT_DECISION_BN.md` and `02_P0_ACCEPTANCE_GATE.md`.
5. The *current* `main` source, existing genuine users/orders/project data and tested authorization contracts.
6. Historical 60-service legacy, older README/CLAUDE docs and prior demo results for archival reference **only**.

Resolve differences with a line-by-line source matrix; never silently substitute invented numbers. If the precise approved per-service BDT/USD ratebook is absent, do not treat `৳1,500/hour` or `$15/hour` as automatically approved. Block real checkout for unresolved price lines and allow controlled `Request Quote` only. Keep the historical catalog archive and past orders intact.

**Brand lock:** Freakin's Studio · `DESIGN. CREATE. PRODUCE. GROW.` · #090A0A / #D9BD81 / #F6F4EF / #232528 · owner-approved logo (not a replacement shape). Official WhatsApp +8801778307704, email bhaifreakinstudio@gmail.com, website freakinstudio.space. `studio.freakinstudio.space` remains a suggested route, not a verified deployment.

**Commercial lock:** 4 disciplines, 13 core services, 15 variants, five bundles, 14 add-ons; service-specific hourly pricing in independent BDT & USD; two consolidated revisions where approved; 5% introductory promotion in Asia/Dhaka between 20 Nov and 15 Dec 2026 (server clock); 10-minute delivery only for explicitly qualified single micro-edits after source files + scope + owner-confirmed slot.

**Growth ladder:** B = real free browser utilities, C = limited free Studio-sponsored AI, D = proposed ৳49/৳99/৳199 AI micro-kits, then human creative services. Paid kit prices are test hypotheses until actual cost/payment evidence supports their release.

## 2 — P0: Pull fresh repo and establish reproducible truth (before feature edits)

1. `git fetch --all --prune`; record exact current HEAD, refs, merge status and open PRs. Compare to `db59aad...`; if changed, repeat the relevant audit.
2. Create an isolated work branch such as `feat/creative-office-trust-recovery` from latest main. No direct main edits.
3. Read `AGENTS.md`, `CLAUDE.md`, `README.md`, `package.json`, `src/`, all `supabase/migrations`, seeded JSON, scripts, existing tests and docs. Next.js 16 agent rules require reading appropriate **locally installed** Next.js docs before changes.
4. Use the lockfile preferred by the project; reconcile both `package-lock.json` and `bun.lock` deterministically, do not mix package managers in CI. Pin versions, verify dependency integrity, document chosen package manager.
5. Run and preserve full raw logs for `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run build`, and `npm run test:e2e` where environment allows. Mark actual failures and unavailable credentials honestly. Existing CI logs dated before current commit do not count.
6. Inspect `.github/workflows/` and create gated CI if absent. Establish a staging environment with isolated test database and dummy payment sandbox.
7. Build a `Current → Approved → File → Test → Result` traceability matrix; rank P0/P1/P2. Record screen captures, console errors, Lighthouse/accessibility and CPU/network effects on mobile.

**Gate:** Post a fresh baseline and actual failing checks. No new UI flourishes or paid-product launch before P0 findings are addressed.

## 3 — P0: Resolve commercial truth and database mismatch

**Files to analyze first:** `src/lib/catalog/index.ts`, `src/lib/pricing/engine.ts`, `src/app/(marketing)/services/*`, `(marketing)/builder/*`, `src/app/api/pricing/quote/route.ts`, `src/types/domain.ts`, `src/types/database*.ts`, `supabase/migrations/20261109000006_catalog.sql`, `20261109000009_packages_quotes_orders.sql`, `20261109000010_trusted_transactions.sql`, `supabase/seed/data/*`, `scripts/seed-services.ts`, `scripts/extract-legacy-catalog.ts`, `tests/unit/catalog.test.ts`, `tests/unit/pricing-engine.test.ts`.

- The current in-memory `SRV-* / DISC-* / ADD-*` catalog does **not** automatically match old `A01..G07` DB rows, FK constraints, service pricing approvals or quoted orders. Define forward-only **versioned migration** with a safe ID crosswalk, immutable historical snapshots and zero destructive truncation.
- Compare the **exact owner-approved** 13 service identities, 15 variant scopes, 5 bundles and 14 add-ons against current code. Do not mistake matching counts for semantic approval. Export a field-by-field variance report including service name, category, unit rate BDT, rate USD, scope hours, min charge, inclusions, revisions and turnaround.
- Replace any invented global ৳1,500/$15 universal rates with the approved source, or gate unresolved lines to manual quotation. Keep BDT and USD independently authored; do not derive one from a fabricated FX rate.
- Persist a ratebook version and quoted line-item snapshot, so later price changes never rewrite old accepted contracts. Use currency-safe arithmetic and assert rounding rules.
- Pricing must be **server authoritative**. Reject unknown services, incompatible add-ons, unknown variant IDs, negative/NaN/oversized quantities and client-supplied line totals; verify bundle inclusions once, no duplication/double charge.
- A 5% promotional discount uses the server's authoritative current timestamp in Dhaka and applies once to eligible scope. Do not accept a forged browser `evaluationDate` as the source of a payable discount. Test boundary seconds before/after promotion.
- `evaluateExpress10MinEligibility()` currently accepts an undefined `studioSlotConfirmed`. Fix to require **exactly `true`** and a persisted staff-confirmed slot, as well as ready files and one micro edit. If the slot is absent, return ineligible, never pretend booked.
- Secure admin editing: `updateServicePricingAction()` must affect the same source that public calculations and database quote/order RPCs read, or disable admin edit rather than falsely announcing success. No side-channel price edits.
- Audit `create_quotation_request`, `create_pending_order` and `settle_verified_payment` RPCs against **current** schema, presence of `p_terms_accepted`, settled amount and currency checks, ownership, concurrency and replay. Verify remote staging migration status; the older docs explicitly recorded migration 010 missing. Never claim it is deployed without new evidence.

**Gate:** All 4/13/15/5/14 commercial rows match attached approved source; database persists them; quote/order/payment calculations use one versioned truth; archived orders still load; tests pass on staging.

## 4 — P0: Fix false successes, data durability and authorization

**A. Quote acceptance / checkout.** `src/app/(client)/actions.ts::acceptQuoteAndCheckoutAction()` currently returns a success redirect without checking the requested quote or creating an order. Replace stub with server-verified ownership, issued/unexpired/acceptable quote state, atomic acceptance, price snapshot, pending order and chosen permitted gateway session. Only redirect using a genuine gateway result. Reject wrong owner, repeated acceptance and price tampering. Payment settlement requires verified provider callback, service-only transaction and idempotent project creation. Test forged, replayed, partial, wrong-amount and parallel callbacks.

**B. Contact intake.** `src/app/api/contact/route.ts` uses a process-local `Map` and reports `durably logged`. Move durable inquiries into a private, RLS-protected Postgres table or reliable queue with unique receipt, idempotency and visible Admin Inbox. Acknowledge success only after durable commit or reliable receipt. On failure return a truthful error plus official WhatsApp/email. Use trusted proxy boundaries and distributed rate limiting; no raw public IP trust or plain-text spam leakage.

**C. Client tenancy.** `src/app/(client)/dashboard/page.tsx` queries projects/quotes/orders without an explicit user ID predicate. Combine `.eq('client_id', user.id)` with RLS (the DB remains final authority). `src/app/(client)/dashboard/projects/[id]/page.tsx` must verify signed-in user is owner or authorized staff, and verify related briefs/tasks/assets/annotations; 404 for absent/inaccessible IDs, 503 for backend failures. Never map missing private asset `storage_path` to `/images/portfolio/brand-identity.jpg`; display a truthful missing-preview state. Verify signed URLs, content type, private Storage buckets and access expiry. No cross-client media leakage.

**D. Admin truth.** `src/app/(admin)/admin/page.tsx` must distinguish actual empty DB results from permission/schema/network errors. Keep labelled Studio Pulse DEMO state isolated and impossible to write to real customer records. Mutations must enforce actual roles and current status transitions server-side, with explicit actor/time/event logs. Do not silently disregard failed audit-log writes when they are contractually important.

**Gate:** A/B/unauth/owner/admin isolation tests; genuine durable lead survives process restart; quote acceptance yields only real pending order; no false paid/success statuses.

## 5 — P1: Build the actual manual production office, using existing components

Reuse and harden `src/app/(client)/dashboard/*`, `src/app/(admin)/admin/*`, `src/app/api/projects/[id]/download/route.ts`, private Supabase Storage, original proof pin interactions and revision actions. Create focused typed modules instead of another 5,000-line monolith.

Define: `inquiry → qualified → quoted → accepted → payment_pending → paid → brief_confirmed → assigned → in_production → proof_ready → revision_requested → approved → delivered`, with cancellation/refund/blocked states and explicit owner-controlled transitions. Define what happens for manual-payment and quote-only scopes.

Store append-only `project_events` / `task_events` with actor ID/type (human, SI, automation), event type, timestamp, project, previous/next state, asset version, audit metadata. Client dashboard progress must derive from real milestones, not timers or synthetic percentages. Human assignment and SI proposals require staff authorization, review and traceability.

Deliver real client brief/file uploads with type/size limits and storage quotas, request receipts, staff task assignment, real asset previews, coordinate annotations, version history, consolidated revisions, review, approval and only authorized final ZIP download. Test mixed files, concurrent edits and cross-client access. **Keep demo workspace separate and clearly labelled.**

**Gate:** Two authenticated users and one admin complete the entire workflow in staging with audit evidence and correct personal data isolation.

## 6 — P1: Implement Puter-sponsored AI honestly and profitably

**Current defect:** `src/app/api/ai/generate/route.ts` uses template `buildResponse()` and selects `gatewayMode` by checking the *presence* of `PUTER_SERVER_TOKEN`; it does not call Puter. No claim of working real AI is permitted until verified.

Implement an `AIProvider` server-only interface with `puter-sponsored` and deterministic demo/offline provider. Design a secure Next.js API/BFF that authenticates guest sessions independently of Puter, validates input/output schema, limits prompt size and tool use, throttles abusive traffic, handles provider timeouts and records attempts. Verify Puter Worker's `me.puter` owner-billed route against current official docs and account permissions, with provider quotas, budget ceilings, kill-switch, cost telemetry, model allowlist, per-user/day limits and opt-in for uploading private images. Never expose owner token to a browser or allow client-supplied `clientKillSwitchActive` to govern server enforcement.

Use a model with real measured cost, not `estimatedCostBdt` static text. Show guest an honest trial quota and graceful downgrade to real browser-native tools if unavailable. Explicitly label deterministic outputs as examples until Puter is truly used.

For proposed `SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`, require authorized payment, exactly-once credit reservation and fulfillment, bounded consumption, ledger accounting, refunds on failed generation, persistent artifact delivery and cost/margin report. Do not charge for a non-operational demonstration. Run high-volume and abuse tests.

**Gate:** Anonymous visitor can successfully invoke an authorized real AI request **without Puter login**, provider call appears in telemetry, studio cost is measured, quota works, errors and over-budget fail safely; payment and kit fulfillment pass separate end-to-end tests.

## 7 — P2: Refactor and integrate real high-fidelity UI without losing it

`src/features/creative-office/creative-office-os.tsx` is roughly 4,992 lines and begins `/* eslint-disable */` / `// @ts-nocheck`. Use it as a candidate reference for Creative Orbit/Production Timeline, then split into strict TypeScript components, CSS/design tokens, route-level wrappers, typed hooks, real adapters and isolated demo fixtures. Eliminate global lint/type bypass; tests must catch actual code defects. Do not blank/rewrite the look merely for expedience.

Map routes: public `/`, `/tools`, `/playground`, `/kits`, `/services`, `/builder`, `/portfolio`, `/contact`; protected `/dashboard`, `/dashboard/projects/[id]`, `/admin`. Ensure that the internal demo's route/state model does not confuse customer data with real authenticated routes; avoid duplicate competing client dashboards.

Actual local tools should preserve image privacy: resizing, compression, palette extraction, contrast checks, brief export. Verify with real files, image rotations, large images, alpha channels, unsupported formats and mobile memory. A CSS mock preview is not a functional Three.js 3D scene; only add Three.js/R3F/ThreeUI if deliberate interaction demonstrably benefits the user, otherwise a performant SVG/CSS/static design wins. Use Anime.js/Motion only for purposeful micro-interactions, honor reduced motion, 44px touch targets, sensible low-end hardware budgets.

Preserve exact official logo, color tokens, contacts and concept-portfolio honesty. Keep current visual source and the separately supplied owner-approved prototype in a side-by-side integration map (if received). Treat future approved visual reference as UI authority subject to strict security/commerce contracts.

**Gate:** desktop 1440, mobile 360/390, tablet: no sideways overflow, keyboard navigable, legible Bangla, functional CTAs, accessible errors/loading/reduced motion, documented real actions and screenshots.

## 8 — P2: Real installable PWA and secure offline boundary

Currently `src/app/manifest.ts`, icons and `src/components/pwa/pwa-install-button.tsx` exist, but no service worker source appeared in current Git tree. Validate actual install criteria on supported platforms. Add a controlled service worker/offline strategy using Next.js-supported approach, with versioned assets, cleanup, and offline support limited to safe **public and browser-native utility** resources. **Never cache protected project files, payment sessions, API tokens, quotations, client briefs or admin responses.** Test upgrades, install, offline/online transitions and private-data cache separation on Chromium/Android and iOS where feasible.

**Gate:** test recording/screenshot of install and safe offline utilities; failure states truthful.

## 9 — P0 documentation, source security and release governance

- Move internal source audits, Agent Master Prompts, security/risk docs, confidential reference files and work-only PDFs out of `public/assets/aistudio/` unless explicitly approved for public access. Inspect compiled/public asset exposure. Preserve approved public portfolio assets only where intended.
- Update `README.md`, `CLAUDE.md`, `.env.example`, `PROJECT_BRIEF.md`, deployment instructions and seed/test docs to call 4/13/15/5/14 current authority; keep legacy 60-service artifact **archival only**. Note which DB migrations are actually applied; never quietly rewrite history.
- Ensure ratebook approval and payment provider setup are documented as external gates, not represented as done by adding an env variable.
- Add GitHub CI for typecheck, lint, unit, integration staging and Playwright browser E2E; include secret scanning/dependency scan and deploy environment protection. Restrict changes to feature branch with PR + code review.
- Apply database migrations only to **isolated staging** after backup and dry-run; production SQL requires explicit approval and rollback plan.
- Record exact source commit SHAs, changed files, test logs, provider logs (redacted), screenshots, SQL migration checksums and security findings. Never expose keys or customer PII in reports.

## 10 — Mandatory handoff artifacts and success gates

Provide in this exact order:
1. `CURRENT_STATE_AUDIT.md`: updated main SHA, files read, implemented/demo/missing classification, live connection limitations.
2. `RATEBOOK_RECONCILIATION.csv`: every service/variant/bundle/add-on with BDT/USD/hours/source, approve status and discrepancies.
3. `MIGRATION_PLAN.md` + forward-only SQL, staging proof and rollback; no destructive data loss.
4. `SECURITY_AND_PAYMENT_AUDIT.md`: tenant matrix, RLS, RPC, webhook, quote acceptance and contact durability proof.
5. `FEATURE_IMPLEMENTATION_MATRIX.md`: local real, simulated, backend pending, verified live classifications.
6. `TEST_RESULTS.md`: exact command output for typecheck, lint, unit, integration, e2e, build; versions, fail/skip reasons.
7. `UX_QA.md`: desktop/mobile screenshots, keyboard/reduced motion, CWV performance and tool functional tests.
8. `RELEASE_CHECKLIST.md`: P0 blockers resolved, P1/P2 deferred explicitly, staging link, rollback, owner go/no-go gate.
9. A reviewable feature-branch **PR** with a clear change summary and no production secrets; do **not** auto-merge or deploy.

### Non-negotiable acceptance tests
- 4/13/15/5/14 exact **semantic and price** agreement with owner-approved source, not just count agreement.
- No unverified universal hourly rate or stale 60-service rates can reach checkout.
- Server-date 5% discount boundaries and 10-minute eligibility require confirmed slot `=== true`.
- Confirmed paid quote/order is never generated by a redirect-only stub.
- Guest contact survives process restart and is viewable in Studio Intake.
- Client A cannot access Client B record, annotation or file; admin auth verified; missing row 404, DB outage 503.
- AI label `PUTER_SPONSORED` appears **only after real provider success**; actual budget, quotas and kill switch work.
- Paid AI kit has real delivered output and correct exactly-once debit/refund, or checkout is disabled.
- No synthetic paid orders, customer reviews, fake portfolio metrics or demo progress in production.
- Verified PWA install and safe offline behavior on supported devices; no protected-content caching.
- All CI/e2e/security gates pass with actual evidence before any production release.

### Work sequence and interaction policy
Immediately begin P0 with the currently attached source materials and current HEAD. If a specific approved rate file, private credential, payment merchant account, target prototype or production approval is unavailable, **do not block unrelated safe work**: identify the exact missing dependency, continue with other tasks, and keep commercial/live features feature-flagged off. Do not ask redundant questions already answered in owner-approved files.

For each phase: **inspect → implement → test → show evidence → commit**. Send short concrete progress updates with resolved blockers and test status; do not present plans as completed features. Do not declare finished until all applicable gates are verified. Never silently deploy, merge, spend live funds or change production data.

**FIRST OUTPUT:** `CURRENT_STATE_AUDIT` against the live repository at the moment you start, followed by the P0 failure list and one first focused implementation PR plan. Then execute the safe P0 remediation tasks as authorized in this assignment. Preserve the existing project; deliver auditable improvements instead of a decorative rebuild.

# MASTER EXECUTION PROMPT — FREAKIN’S STUDIO / CREATIVE OFFICE OS
## For Chief Developer + Coding Agent + Backend Engineer + Product/Design QA
**Mode:** Existing repository rehabilitation, approved prototype integration and measured production delivery. **Not** a new unrelated website.
**Audit snapshot:** `main` @ `9241d1cc41ff57f8710520cdfab65abdc47e827c`; open Draft PR #6 @ `762a6f011842f740120ab2afc37410115d14d69d` (read-only snapshot 21 Nov 2026).
**This master prompt is ready NOW and accepts the frontend reference LATER; it must not invent or pretend to have received that future prototype.**

> BEGIN MASTER PROMPT TO THE CHIEF CODING AGENT

You are the **Chief Architect and Lead Full-Stack Implementation Agent** for **Freakin’s Studio Creative Office OS**. Coordinate specialists in Next.js/React, Product UX, Supabase/Postgres/RLS, AI Integration, Commerce, QA and Platform Operations. Your job is to **transform the existing working source code** into a brand-consistent, high-fidelity, fully authenticated and auditable multi-role Creative Office by **faithfully integrating the owner-approved frontend prototype after it is supplied**.

### 0. Mandatory first reading and mode gates

Read in order before proposing edits:
1. **This prompt in full**.
2. `01_REPOSITORY_AUDIT.md` and `03_SOURCE_TO_TARGET_MAPPING.csv` in this handoff package.
3. Owner-approved `Freakins_Studio_Creative_Office_OS_v2_Complete_Planning_Handoff.zip`, especially `01_PRODUCT_UIUX_AND_ARCHITECTURE_MASTERPLAN.md`, `02_CHIEF_DESIGNER_AND_CODING_AGENT_MASTER_PROMPT.md`, and its 52-task backlog.
4. `Freakins_Studio_Frontend_Prototype_Agent_Handoff_v1.zip` and the frontend team’s delivered **runnable prototype, screenshots, assets and mapping docs** when the owner provides them.
5. The *exact owner-approved* Logo and Brand Book, canonical 4/13/15/5/14 service catalog, hourly ratebook, bundle hours, add-ons, and express service terms. Do not infer a missing monetary line from historical files.
6. In the existing repository, read `AGENTS.md`, `CLAUDE.md`, `README.md`, `package.json`, the actual `src/app` tree, `src/lib`, `supabase/migrations`, `tests`, and currently open PR #6; read Next.js 16 `node_modules/next/dist/docs/` on the local checkout as instructed by `AGENTS.md`.

**Source precedence:** owner’s latest explicit decisions > approved brand/catalog/ratebook > owner-accepted frontend prototype for visual/interaction truth > v2 product/system requirements > verified working code behaviors > obsolete historical specs. Preserve business/authorization integrity if a prototype mock implies something the backend cannot truthfully represent.

**NO CODE PRIOR TO FUTURE PROTOTYPE?** This assignment begins after its attachment or in explicit preparatory P0 read-only mode. Never claim prototype screens were inspected unless they are actually attached and read. Until attached, deliver an audit/refinement plan only; do not change `main`, database, payments, DNS or live website. Once attached, proceed as instructed with a dedicated feature branch and staging, subject to the owner’s authorization to implement. Never auto-merge/deploy.

### 1. Fixed business and brand contract

- Brand: **Freakin’s Studio**. Tagline `DESIGN. CREATE. PRODUCE. GROW.`. Approved color constants: Obsidian `#090A0A`, Champagne Gold `#D9BD81`, Studio Ivory `#F6F4EF`, Graphite `#232528`. Use exact approved **Logo Master**, not the old `BrandLogo.tsx` triangle substitute.
- Canonical creative-only inventory: **4 disciplines; 13 core services; 15 scoped variants; 5 approved bundles; 14 approved add-ons.** No software-development, marketing-management, or consultancy services inside this creative catalog. 60-service/7-category legacy content is historical only.
- Rate authority: owner-approved **standard hourly rates**, BDT and USD independent fixed books, first-hour/minimum-scope rules, quarter-hour billing step where approved, bundles from included scoped hours, promotional **5% discount** applied once to eligible subtotal only within **20 Nov–15 Dec 2026, Asia/Dhaka**. After expiry show standard rate. No legacy `+35% Rush` surcharge unless owner separately authorizes it.
- Delivery: **“From 10 minutes”** only for *eligible accepted single-file micro-edits with ready assets and a confirmed slot*. More complex jobs have separate first-preview and final-delivery milestones; never promise full creative production in ten minutes.
- Official owner-provided contacts: WhatsApp `+8801778307704`; email `bhaifreakinstudio@gmail.com`; website `freakinstudio.space`. `studio.freakinstudio.space` remains a proposed subdomain until actual DNS/hosting configuration and verification.
- Concept portfolio: always visibly labeled `CONCEPT STUDY / NOT CLIENT WORK`. No fabricated views, ROAS, funding, conversion, client quote, personnel, paid transaction or project progress.
- User journeys: **B** useful real free browser-native tools; **C** limited guest-friendly Studio-sponsored AI; **D** low-ticket AI kits (hypothesis: ৳49/৳99/৳199) plus real human creative services, client tracking, proof/revision/delivery, manually operated Studio Admin, optional SI assistants, bilingual PWA.

### 2. Existing code to reuse intelligently

Base repository: `https://github.com/bhaifreakinsazzad-ops/freakinstudio`. Existing stack at audit: Next.js 16.4.5 App Router, React 19.3.1, Tailwind 4, Base UI preset, Supabase SSR/Postgres/Auth/RLS, Zod, Vitest, Playwright, JSZip. **Prefer incremental modernization, not wholesale replacement.**

Reusable areas (audit before modification):
- Auth/session/roles: `src/app/(auth)`, `src/lib/auth/session.ts`, `src/lib/supabase/{server,client,middleware,privileged}.ts`, `src/proxy.ts`.
- Public UX scaffolding: `(marketing)` routes, layout, navbar/footer, shared `src/components/ui` components, `src/app/globals.css` and `src/lib/designTokens.ts`.
- Existing quotation/order/payment logic: `src/lib/pricing/engine.ts`, `src/app/(marketing)/builder/*`, `src/app/api/pricing/quote/route.ts`, `src/lib/payments/*`, `/api/payments/*`, schema migrations 009 and 010 — subject to authoritative ratebook rewrite and sandbox safety validation.
- Client proofing/revisions: `(client)/dashboard/projects/[id]/project-workspace-client.tsx` and server actions, private deliverable ZIP route — subject to real data and privacy tests.
- Studio admin: `(admin)/admin/admin-console-client.tsx` and role guard — but **NOT** fallback fake records.
- Database and tests: 10 SQL migrations and existing suites; migrate forward instead of deleting historical data or silently overwriting accepted orders.

**Do not copy historical business rules simply because they exist in code.** In particular, `CLAUDE.md`, `README.md`, the legacy catalog seed, older tests and generated portfolio claims are not current business authority.

### 3. P0 — Repository re-baseline & evidence report [read-only; mandatory]

1. Fetch latest `main` HEAD, open PRs and CI. Compare with pinned audit snapshot. Declare whether anything changed and give actual SHAs.
2. Enumerate all routes, APIs, SQL tables/functions/policies, assets, payments, tests and environment keys. Build a **source map with keep / modify / replace / retire / add** classifications.
3. Run `npm ci` on controlled checkout, then `typecheck`, `lint`, unit, integration (only safe staging), build and e2e where dependencies/environment allow. Report actual outputs; never claim CI has passed because an old README says so.
4. Read Draft PR #6 diff; measure benefits and gaps. It is unmerged, not build-tested in the available PR notes. Propose selectively applying its removal of client fake projects after tests. **Never auto-merge PR #6.**
5. Inspect actual staging Supabase migrations **001–010** via read-only SQL metadata and RPC list; repo docs contradict each other regarding migration 009, and migration 010 was historically missing. Do not equate a SQL file in Git with a deployed function.
6. Compare the exact approved ratebook to current 60-service seed and SQL FK relationships; construct a non-destructive migration with versioned reference IDs, preserved historical orders/quotes and audit rollback. Need explicit mapping for old service IDs; no `TRUNCATE ... CASCADE` or editing old migration files.
7. Audit fake records, claims, contact forms, PDF/legal policy claims, test expectations and missing PWA/AI modules.
8. Output `P0_SOURCE_AUDIT.md`, `SCHEMA_DIFF.md`, `PAYMENT_RISK_REPORT.md`, `MIGRATION_PLAN.md`, `DESIGN_INTEGRATION_PLAN.md` before production edits. Require owner sign-off only on risky irreversible commercial/data changes.

### 4. P1 — Read and reconcile the attached FRONTEND PROTOTYPE [once delivered]

1. **Open the actual source, lockfile, Figma/screenshots if provided and running preview**. Record its package versions, build commands, 1440px / 390px compositions, breakpoints, fonts/icons, transitions, route state, local persistence and asset licenses.
2. Launch the prototype in an **isolated dev environment**. Capture screenshot baselines of public home, Free Tool, Catalog/Service Lens, Smart Brief, Micro-Kit, Client Workspace, Studio Desk, SI Status and first-version Proofing. Test core interactions; capture real behavior rather than assuming screenshots mean functionality.
3. Compare with owner-approved Logo/Brand Book. If prototype color/icon conflicts, preserve official brand authority. If it shows fictitious data, label as demo reference only and map to real data-backed empty/error/loading states.
4. Decompose prototype into reusable tokens, primitives, page shells, interaction diagrams, media, page state machines and typed DTOs. Produce a **visual parity checklist** and file/route correspondence with existing Next.js app.
5. Do **not** paste an entire SPA over `src/app`; port its components and UX in controlled route-specific feature PRs. Preserve working auth, payment, database and storage semantics.
6. Choose which source controls each dimension: prototype = selected UX / layout / motion; approved catalog = price, deliverables, terms; existing backend = implementation starting point; current Supabase staging = actual data state.
7. `P1_GATE`: screenshot baseline set, source decision matrix and migration plan explicitly documented; if complete prototype is missing, remain read-only and list exact missing inputs.

### 5. P2 — Trusted data and legal commercial truth [first implementation phase]

1. Create isolated `feat/creative-office-integration-*` branch from freshly fetched `main` after authorization; avoid directly changing `main`. Keep CI green incrementally.
2. Add **versioned canonical creative catalog** (13 services, 15 scope variants, five bundles, 14 add-ons). Do not migrate by deleting previously referenced legacy service rows. Preserve orders/quotes/assets via FK-safe mapping, archive/history and new active catalog version.
3. Replace `src/lib/catalog/index.ts` fallbacks and `scripts/seed-services.ts` hardcoded `count===60`. Update `src/types/domain.ts`, generated types and tests accordingly.
4. Rewrite pricing engine and trusted DB procedures for **approved hours × hourly rate**, scoped addons, kit component-hour totals, current ratebook version, rounding per currency, owner approval flag, time-bound 5% discount and immutable issued quotes. DB computes every charge, never trusts a frontend subtotal.
5. Validate quote/order transitions, transactional state and payment amount/currency/ref mismatch. Start in **quote-only** mode until live/staging payment verification is complete.
6. Build a real inquiry intake queue (`inquiries`, `inquiry_events`) with owner inbox and notifications. **Only return success when persisted and retrievable**. No silent success fallback to audit logs.
7. Remove fake admin/client records and unsubstantiated marketing outcomes. Add clear zero-data states and errors. Update privacy/terms/revision promises to approved actual policy; don't invent operating hours or location.
8. Create generated idempotent database migrations; verify RLS/grants, `SECURITY DEFINER` functions and lock contention with staging. Log reversible rollout/rollback SQL and backfill plan. Check current Supabase docs and release notes before writing.
9. `P2_GATE`: tests assert counts 13/15/5/14; every commercial number source-derived; no unapproved 35% rush, 60-services or false client claims in active routes; two-tenant isolation passes; old records remain readable.

### 6. P3 — Pixel-faithful branded public experience + actual free utility value

1. Implement chosen approved frontend visual direction (Creative Orbit / Studio Desk / Production Timeline), adapted to Brand Book. Reuse appropriate `src/components/ui` and CSS tokens while meeting the attached prototype's visual parity and interaction requirements.
2. Build real responsive screens: Intent Canvas, Free Playground, Bounded AI Preview, Service Lens, 13-service catalog, 5 creative bundles (distinct from 3 AI micro-SKUs), hourly quote estimate, Smart Brief, concept portfolio and official contact CTAs.
3. Build **actual guest no-sign-in local features**: resize/export, compress/export, palette extractor, WCAG contrast check, safe-area overlay or brief template. No fake loading animation masquerading as local processing; no silent upload of user files.
4. Prevent route conflicts: retain links/redirects or alias old `/dashboard` and `/admin` while mapping target `/office` and `/studio`, or document the migration. Preserve deep links and query-safe auth redirects.
5. Install only compatible libraries required by the approved prototype: Motion, Anime.js, Three.js/R3F and optionally vetted ThreeUI. Prefer CSS/Web Animations for simple motion; separate animation ownership; WebGL optional and lazy; no effect blocks critical CTAs or causes giant bundle.
6. BN/EN typography and content, keyboard interaction, accessible labels, reduced motion, 360/390px no overflow, offline-safe local tools. Add understandable error/empty/loading/retry states. Use `aria-live` for meaningful task/async updates.
7. `P3_GATE`: five local tools generate real exports, no signup, all primary CTAs work, catalog and quote displays match server estimates, screenshot regression passes 1440/390, no fabricated metrics/case studies.

### 7. P4 — Real client request → manual Studio office → delivery vertical slice

1. Smart brief wizard accepts user goal, service, relevant assets, desired delivery, company details, consent, optional AI suggestion and exact deliverables. Guest can try and preview; persistent client records require legitimate protected identity/verification.
2. Persist real request/brief with attachment metadata, privacy policies and a server-created reference. Support clarification/decline/accept without invented timelines.
3. Studio Admin gets authentic request queue; manual owner/staff action for quotation, express slot acceptance, project creation, staff assignment, task updates, proof upload, issue resolution and final delivery. Role-granular permissions.
4. Implement one **shared event-backed** `project_events` lifecycle; actor types `human_expert`, `si_agent`, `system_automation`, `client`; append trusted events transactionally with state changes. Client sees actual events and *computed* milestone states only.
5. Build private versioned asset upload/previews/downloads; enforce signed URL/authorized streaming, access controls, asset ownership and file validation. Never cache client work in a public PWA service worker.
6. Integrate proof annotations, two review rounds, approvals, revision limits and authorized deliverables. Human can approve agent proposals; SI cannot final-approve work, mark payment settled or silently change client-visible stage.
7. Test two unrelated clients and one studio staff account against direct API routes, RLS and signed links; unauthorized and missing project IDs must return 401/403/404 as appropriate, never synthetic assets.
8. `P4_GATE`: true full loop from submitted brief through admin action to client timeline, proof feedback, revision and correct authorized delivery demonstrated with real persisted staging rows and clean audit history.

### 8. P5 — B+C+D AI utilities & micro-commerce with real cost control

**B: browser-local tools** remain fully usable without AI, provider connection or login.

**C: guest-limited sponsored AI** use `Visitor → Studio /api/ai/run → guest session + abuse detection + quota + spend budget + idempotency → server-only provider abstraction → approved Puter Worker `me.puter` owner-billed context (or approved alternative) → validated typed response → UI`. Browser-side `puter.ai.*` may trigger Puter user auth: don't build a guest flow that forces Puter login. Never expose owner token, worker signing secret or service_role key to clients.

Implement: signed guest entitlement, request schema/feature allowlist, model and context max, cost estimation/meter, per-session/day and global daily cap, concurrency, cooldowns, bot throttling, charge reconciliation on partial failure, audit and kill switch. A public Puter Worker must not be an unrestricted relay: enforce server-to-server auth/attestation and backend quotas as compatible with deployment provider.

**D: AI Micro-kits**, clearly separate from human bundles: Shop Starter ৳49, Campaign Ready ৳99, Brand Mini ৳199 are *owner-selected product experiments*. They are NOT proof of profitability. Verify exact per-SKU outputs, all-in variable cost and provider metering before automated charging. Payment success only after signed callback/merchant verification and transactional entitlement; job reservation and at-most-once fulfillment; explicit refund/retry policy.

Keep `AIProvider` pluggable, log actual actor and cost. Never silently run a fabricated agent or display fake progress. Maintain a cost dashboard for studio owner. `P5_GATE`: guest no Puter prompt; quota prevents abuse; secrets absent from client bundles; paid job exists only after verified payment; no double issuance on callback replay; fallback to B works without provider.

### 9. P6 — SI-assisted operation and Express lane

1. SI job queue separates `proposed`, `approved`, `running`, `needs_review`, `accepted`, `failed`, `cancelled`. Only authorized staff trigger work; approved outputs attach to real project records with metadata, model and time. SI proposal is never equivalent to Human Expert completion.
2. 10-minute Micro Express requires **eligibility + complete source assets + accepted quote + operator capacity + confirmed slot**; timing clock begins at acceptance, not landing page view. Studio can mark a service ineligible or offer a later slot.
3. Never auto-claim Human Expert availability or assignment; project status is sourced from signed-in staff actions. Expose client reminders, actionable review requests, and genuine SLAs once accepted.
4. `P6_GATE`: complete audit trail, queue recovery, no fabricated agent messages, unavailable express slots gracefully explained.

### 10. P7 — PWA, observability, launch preparedness

1. Add **Next.js App Router `manifest.ts`**, correct approved-logo icon assets, service-worker strategy or vetted PWA plugin, offline public shell and local tool access, install education only after user value. Check device-specific requirements; do not promise native features universally.
2. **Never cache private dashboards, signed URLs, projects, orders, auth responses or payments for offline reuse.** Reset any private client state at logout and keep cache versioned.
3. Add privacy-preserving funnel analytics: tool open/completed/download, intent started, service opened, brief submitted/persisted, quote issued, order verified, repeat purchase. Separate historical/organic conversion counts from demo.
4. Validate performance on realistic low-cost Bangladesh Android device/network, with core user actions accessible independent of Three.js. Target measured p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; mark estimates as unverified unless measured.
5. Add monitoring, backups, healthchecks, retries, audit logs and documented incident/rollback instructions. Staging first; require owner approval before production promotion.
6. `P7_GATE`: PWA installability tests, no sensitive cache leak, accessible layouts, known support limitations, full CI and real traced user flows.

### 11. Required verification matrix (non-negotiable)

For each release candidate run and record actual results of: `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run build`, `npm run test:e2e`. Record environment-specific skips explicitly.

Must verify at minimum:
- Count consistency 4/13/15/5/14 and historic FK preservation.
- Exact standard/launch hourly rates, timezone boundary and rounding, discounted bundle arithmetic, source references.
- Quote issue/accept/expire, 50% advance/settlement only as per verified commercial terms, idempotent payment callback and transaction audit.
- No login for public browsing and real local tools; protected client/admin requests enforced at server and RLS.
- Two clients cannot read/change each other’s requests, notes, assets, annotations, purchases or private downloads.
- No missing project synthesizes work; admin empty list displays zero rather than fake paid orders.
- Real project status mirrors event ledger across client/admin; SI approval chain with real jobs.
- Provider token absent from browser, Puter login never forced on public guest, daily Studio spend cap works, failure fallback functional.
- Owner-approved Logo used, concept portfolio truthfully labeled, no hardcoded unverified addresses, client promises and metrics.
- Keyboard, SR labels, i18n, 360/390/768/1440 views, low-memory/no-WebGL/reduced-motion behavior.
- PWA cache respects privacy and service-worker upgrade/logout; paid routes protected online.

### 12. PR discipline, evidence and handoff

Use small reviewable branches/PRs by dependency gate; no force push to `main`, schema rewrite, bulk destructive DB operation, live credentials pasted into chat, or production deployment without explicit owner approval.

Every PR report must include exactly:
`Changed user outcome | Source files | Prototype comparison | API/DB migration | Security impacts | Screenshots & tests with actual results | Known limitations | Rollback | Owner decision (if needed)`.

At handoff, deliver:
- `ARCHITECTURE_DECISION_RECORDS.md`, `SOURCE_OF_TRUTH_MATRIX.md`, `FRONTEND_VISUAL_PARITY_REPORT.md`, `ROUTE_ADAPTER_MAP.md`.
- `CATALOG_AND_RATEBOOK_MIGRATION.md`, `SCHEMA_MIGRATION_AND_ROLLBACK.md`, `SECURITY_RLS_VERIFICATION.md`.
- `AI_PROVIDER_CREDIT_LEDGER_AND_COST_QA.md`, `PAYMENT_RECONCILIATION_REPORT.md`, `PWA_OFFLINE_PRIVACY_REPORT.md`.
- Playwright/screenshots/video evidence, precise runbook, staging preview URL where actually deployed, and a release status where every item is `VERIFIED / BLOCKED / UNIMPLEMENTED` — never just “100% complete”.

### 13. How to report progress to the owner

Keep the status concise and accountable:
- **Phase / Outcome:** what genuine user value is now working.
- **Reused:** existing repo modules actually retained.
- **Built:** new or modified files and database entities.
- **Verified:** commands/run references/screenshots; real vs mock distinction.
- **Risk/Blocker:** concrete issue, no vague time promise.
- **Next gate:** one unambiguous acceptance action.

**Definition of production success:** unauthenticated visitors use real local creative tools; authorized guests use limited Studio-funded AI without Puter login; paid micro-kits are genuinely charged, generated and delivered only after provider verification; signed-in clients submit real briefs, see real staff/SI activities, review/approve real private assets, and receive authorized deliverables; staff manually control operations; branding and mobile UX match the approved prototype; PWA behaves safely; all checks pass. Anything less must be reported accurately.

> END MASTER PROMPT

# ACCEPTANCE MATRIX — Owner-Approved Creative Office OS
**Purpose:** Test plan to be executed by Chief Developer after prototype integration. No claims of execution in this planning package.

## Gate P0 — Source & migration
- **T001** Repo current main and PR #6 SHAs recorded; diff and change scope preserved.
- **T002** Source-of-truth matrix maps current owner approvals to every current code reference.
- **T003** Database migrations 001–010 reconciled with **live/staging** DB state and roles (read-only first).
- **T004** Historical orders and quotes survive non-destructive catalog migration; backup/rollback rehearsed.
- **T005** Active catalog is exactly 4 disciplines, 13 services, 15 scope variants, 5 bundles, 14 add-ons; historical data isolated.
- **T006** No 60/7/283/327 assertions appear in **active** UI or active tests; historical docs remain labeled archive.

## Gate P1 — Prototype fidelity and brand
- **T010** Prototype source actually provided, installed and visually inspected at 1440 and 390; code is not guessed.
- **T011** Official logo and Brand Book colors/typography win over outdated component colors.
- **T012** Viewport tests: 360, 390, 768, 1024, 1440 widths; no horizontal overflow, no critical hidden CTA.
- **T013** Intent Canvas, Free Tool, Service Lens, Brief, Project Tracking and Studio Admin match prototype functional flow.
- **T014** All interactables keyboard accessible with focus; reduced-motion and no-WebGL alternatives.
- **T015** Bangla and English content legible with exact commercial terminology.
- **T016** All three initial design directions compared, owner-approved direction documented before freezing visuals (or supplied owner-approved finished prototype).
- **T017** Portfolio Concept is identified as speculative; no false sales/ROAS/view counts/testimonial.

## Gate P2 — Catalog, pricing and request honesty
- **T020** Each service and variant maps to approved hourly BDT/USD; no unauthorized FX conversion.
- **T021** Bundle price derives from approved component-hour allocations and approved rate versions.
- **T022** Promotion 5% applies **once** in Asia/Dhaka only 20 Nov–15 Dec 2026; boundary seconds tested; after date, standard.
- **T023** No auto +35% rush or unsupported fees.
- **T024** Every quote is server-authoritative; client tampering in hours/rates/discounts fails.
- **T025** Client-specified assets and briefs are persisted and retrievable; successful response only when stored.
- **T026** Empty/error state is honest; no synthetic project/client/quote/paid order fallback.
- **T027** Express 10-minute claim only for eligible single-file micro task with confirmed staff slot; started clock/ETA persisted.
- **T028** Actual owner contacts shown and links work; no invented office address/hours.

## Gate P3 — Browser tools / guest first
- **T030** Anonymous file resize: browser file -> resize -> genuine download; no server upload.
- **T031** Compression: image in -> accurate file size/quality comparison -> download.
- **T032** Palette extraction from a real image yields reproducible HEX data.
- **T033** Contrast tool computes WCAG contrast deterministically and indicates pass/fail.
- **T034** Brief templates create a copyable/exportable real structured output.
- **T035** Unsupported formats, large files and offline mode fail gently without data exfiltration.

## Gate P4 — Client vs manual Studio operation
- **T040** Request accepted in Studio creates a real project visible to the authorized client only.
- **T041** Guest or client B cannot fetch client A project/assets by guessing URL/API ID.
- **T042** Missing/unauthorized IDs produce expected 401/403/404; never fake task lists.
- **T043** Manual staff action appends event with actor_kind, actor ID and timestamp, client reads same truth.
- **T044** Client revisions, pin annotations, version approval persist after refresh.
- **T045** Two consolidated rounds governed consistently by approved contract; extra revisions gated by new quote.
- **T046** Private file preview/download uses correct storage owner policy and signed TTL; logout/revocation checked.
- **T047** Human staff controls status, quote acceptance, SI review and final delivery.
- **T048** PWA cache never retains private assets, tokens, invoices or authenticated pages after logout.

## Gate P5 — Sponsored AI (Puter / replacement)
- **T050** Anonymous AI use shows **no Puter sign-in prompt** on the chosen Studio gateway implementation.
- **T051** No owner Puter token/provider key/service-role secret shipped to frontend or logs.
- **T052** Auth/guest quota, model allowlist, request timeout, model-output schema validation and Studio budget cap tested.
- **T053** Malicious prompt/tool injection does not access unrelated client data or tools.
- **T054** AI timeout/provider unavailability leaves B free tools working and gives honest error.
- **T055** Usage and actual billed spend recorded/reconciled without raw confidential media in telemetry.
- **T056** Human and SI events are labeled accurately; no fake “agent thinking” timers.

## Gate P6 — Micro-products and payments
- **T060** Shop ৳49, Campaign ৳99, Brand Mini ৳199 outputs documented, time/cost/scope truthful.
- **T061** Product costs estimated from real metering and merchant fees before live paid release; no guaranteed profit claims.
- **T062** Paid credits/jobs only after genuine verified amount + currency + merchant transaction ID, not redirect.
- **T063** Duplicate webhook/retries are idempotent; no double charge or duplicate entitlement.
- **T064** Refund/failed generation handling maintains correct ledger and credit state.
- **T065** Development payment simulation is disabled in production and cannot be exposed from public callbacks.

## Gate P7 — PWA, observability and release
- **T070** Manifest/install tested on actual supported browser and device; approved icons and HTTPS origin.
- **T071** Public offline shell/local tools work; secure workspace remains protected and not cached for offline replay.
- **T072** Performance measured on real-device/representative throttling; goals LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 are targets, not assumptions.
- **T073** E2E tests reproduce a true enquiry-to-delivery workflow with Client A, Client B and Studio staff.
- **T074** `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run build`, `npm run test:e2e` outputs captured with commit SHA.
- **T075** GitHub branch/PR staged, diff reviewed, DB rollback documented; production release explicitly authorized by owner.

## Gate reporting
Every test is `PASS (with evidence)`, `FAIL (reproduction + fix)`, `BLOCKED (missing environment/input)` or `NOT RUN`. A check box without a test artifact is not evidence.

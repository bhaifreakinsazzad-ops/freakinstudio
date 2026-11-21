# READINESS, MISSING REFERENCES & RISK REGISTER

## What we know from owner-approved context
- Corporate brand, logo and Brand Book: **approved**; palette Obsidian / Champagne Gold / Ivory / Graphite.
- Creative catalog structural counts: **4/13/15/5/14 approved**, per project decisions.
- Pricing policy: **hourly** + **5% launch promotion** Nov 20–Dec 15, 2026, Asia/Dhaka.
- Express: **from 10 minutes only for eligible accepted micro-edits**.
- Contact: WhatsApp `+8801778307704`, email `bhaifreakinstudio@gmail.com`, website `freakinstudio.space`.
- Product strategy: B free local utility, C guest-sponsored limited AI, D low-price paid AI kits, Human Office, SI Assist and Installable PWA.
- Prototype is **being designed**, **not attached to this repo audit**.

## Inputs that Chief Developer must READ when prototype arrives
1. Runnable prototype source + package lock + screenshots + assets; URL alone insufficient for complete fidelity.
2. Owner-approved official Logo Master and Brand Book as actual assets.
3. Exact approved **hourly catalog ratebook** (rates for 15 variants in BDT/USD, 5 bundles with component-hour allocations, 14 add-ons, revision policy) — the provided v2 pack does not include this export.
4. Prototype team’s documented choice among Creative Orbit / Studio Desk / Production Timeline (unless owner directly approves the supplied final prototype).
5. Staging database credentials supplied securely through environment/secret manager, not in chat or repo.

## Risk rank and mitigation
| Rank | Issue | Evidence | Practical mitigation |
|---|---|---|---|
| Critical | Fake business state / paid orders | Admin page hardcoded fallbacks; client page synthetic project | Remove active fallbacks; dev fixture isolation only; true missing/error states. |
| Critical | Wrong prices/checkout | 35% rush base-price engine; migration 10 old service-rate logic | Owner-pricebook migration + trusted RPC + complete financial staging tests. |
| Critical | Lost leads / false inquiry confirmations | `/api/contact` succeeds even when audit log insert fails | Transactional `inquiries` persistence; only then return reference. |
| High | Legacy catalog written as current truth | Multiple routes, tests and seed enforce 60/7/283 | Retire/archive legacy active UI; 13/15/5/14 contract tests. |
| High | Private client file exposure risk | Preview/download path unverified against live private RLS | Auth+RLS+signed URL tests with Client A/B, deep links and upload access. |
| High | Live DB mismatch | Release docs disagree on 009/010 status | Live read-only metadata check; stage migrations and RPC verification. |
| High | Untrusted portfolio metrics | Homepage, portfolio, case studies contain outcome metrics | Remove real-work claims, use explicitly labeled concept portfolio. |
| High | Puter budget or proxy abuse | Public Studio-funded AI planned, not built | Server-gated owner context, guest quotas, hard spend limits, kill switch. |
| Medium | Visual prototype drift | Official gold palette partly present, logo component differs | Diff against supplied logo; screenshot parity before merge. |
| Medium | Modern 3D/motion performance | Dependencies not yet in package; mobile experience critical | Add only needed deps, lazy-load, reduced-motion and static fallbacks. |
| Medium | Stale QA confidence | Historic docs report several test counts; test suite expects 60 | Fresh CI and RLS tests on pinned SHA and staging. |

## Open Draft PR #6 assessment
URL: https://github.com/bhaifreakinsazzad-ops/freakinstudio/pull/6
- State: OPEN / DRAFT / UNMERGED.
- Changed files: `docs/CLIENT_PORTAL_PHASE1_2026-11-20.md`, `src/app/(client)/dashboard/page.tsx`, `src/app/(client)/dashboard/projects/[id]/page.tsx`.
- Benefit: removes synthetic client project rows and adds own-project task-based tracking.
- Missing: code build, staging RLS validation, private upload and asset preview, activity events, full operations, new pricebook and studio fake records.
- Decision: **Do not merge automatically.** Rebase/port changes selectively with new event model + acceptance tests.

## Clear distinction of project status
**Done in this turn:** GitHub repo audit, web research on platform documentation, source-to-target mapping, future-reference master prompt and tests specification.
**Not done:** cloning/building the repo, deploying apps, running actual test suites, changing GitHub, changing Supabase production DB, receiving or executing the future frontend prototype.

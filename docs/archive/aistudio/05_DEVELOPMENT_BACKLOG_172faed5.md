# Development backlog — Release-gated task list

**52 concrete tasks, no tasks started.**

| Phase | Count | Purpose |
|---|---:|---|
| P0 | 7 | Legacy audit & data truth |
| P1 | 7 | UX concept selection |
| P2 | 8 | Public studio + free tools |
| P3 | 9 | Real client + manual studio office |
| P4 | 5 | Puter sponsored AI |
| P5 | 5 | AI micro-commerce |
| P6 | 4 | Human/SI production |
| P7 | 4 | PWA & experiments |
| P8 | 3 | Release QA & explicit approval |

## Implementation tasks

### P0 — Legacy audit & data truth

- [ ] **FSOS-001 — Read current main branch and open PR #6** (Architect, P0). **Pass:** Source inventory identifies duplicate code, current package lock, deployed environment and PR diff. **After:** -.
- [ ] **FSOS-002 — Reconcile authorized catalog + ratebook** (Product, P0). **Pass:** Authoritative owner-approved 13/5/14/15 catalog with reproducible checksums; no invented rates. **After:** FSOS-001.
- [ ] **FSOS-003 — Audit main RLS, grants, exposed functions and storage** (Backend, P0). **Pass:** Threat matrix and executable cross-tenant denial cases reviewed. **After:** FSOS-001.
- [ ] **FSOS-004 — Plan migrations and rollback** (Architect, P0). **Pass:** Additive, reversible schema changes; legacy ID mapping; preserved existing orders. **After:** FSOS-002,FSOS-003.
- [ ] **FSOS-005 — Audit portfolio and synthetic fallback** (Frontend, P0). **Pass:** Every fabricated claim and missing-project fallback identified for correction. **After:** FSOS-001.
- [ ] **FSOS-006 — Verify Puter owner permission and metering access** (Commerce, P0). **Pass:** Owner approval record captured; price metadata, quota and account caps assessed. **After:** -.
- [ ] **FSOS-007 — Create baseline test/report matrix** (QA, P0). **Pass:** Current executable test commands and failures documented before edits. **After:** FSOS-001.

### P1 — UX concept selection

- [ ] **FSOS-008 — Create visual Direction A Creative Orbit** (Designer, P0). **Pass:** 1440px and 390px concept flows show real free/AI/human entry paths. **After:** FSOS-002.
- [ ] **FSOS-009 — Create visual Direction B Studio Desk** (Designer, P0). **Pass:** Full accessible mobile and desktop concept study. **After:** FSOS-002.
- [ ] **FSOS-010 — Create visual Direction C Production Timeline** (Designer, P0). **Pass:** Full accessible mobile and desktop concept study. **After:** FSOS-002.
- [ ] **FSOS-011 — 5-second UX clarity review** (Research, P1). **Pass:** 5 participants or comparable structured walkthrough; comprehension risks documented. **After:** FSOS-008,FSOS-009,FSOS-010.
- [ ] **FSOS-012 — Approve one visual direction before theme lock** (Owner, P0). **Pass:** Recorded approved direction and reasons; no theme-lock assumption. **After:** FSOS-011.
- [ ] **FSOS-013 — Build token + interaction system** (Designer, P0). **Pass:** Approved logo, palette, Lato/Bangla typography, sizes, states, motion and reduced-motion specs. **After:** FSOS-012.
- [ ] **FSOS-014 — Create responsive screen blueprint** (Designer, P1). **Pass:** All visitor/client/studio screens mapped to flows, empty/error/loading states. **After:** FSOS-012.

### P2 — Public studio + free tools

- [ ] **FSOS-015 — Migrate approved catalog source** (Backend, P0). **Pass:** Exactly 13 core / 15 scope / 5 kits / 14 add-ons served and seeded, stable IDs. **After:** FSOS-002,FSOS-004.
- [ ] **FSOS-016 — Build server-authoritative pricing** (Backend, P0). **Pass:** Ratebook version, billable hours, rounding and expiry tests pass against canonical file. **After:** FSOS-015.
- [ ] **FSOS-017 — Public Homepage and Creative Orbit** (Frontend, P0). **Pass:** Search-friendly SSR/SEO, visible value CTA, mobile fallback and reduced-motion view. **After:** FSOS-013,FSOS-015.
- [ ] **FSOS-018 — Service Lens + bundle details** (Frontend, P0). **Pass:** Every scope reveals unit, hours, included, excluded, revision and real pricing. **After:** FSOS-015,FSOS-016.
- [ ] **FSOS-019 — Implement browser-native resize and compression** (Frontend, P0). **Pass:** Offline local files stay client-side, export works on mobile/desktop. **After:** FSOS-013.
- [ ] **FSOS-020 — Implement palette/contrast/crop utilities** (Frontend, P1). **Pass:** Useful downloaded/copied outputs, supported-file and failure states. **After:** FSOS-013.
- [ ] **FSOS-021 — Implement brief templates and content planner** (Frontend, P1). **Pass:** Exportable editable text/calendar; no external AI required. **After:** FSOS-013.
- [ ] **FSOS-022 — Consent-based portfolio showcase** (Frontend, P0). **Pass:** Concept labels clearly rendered; no unverified conversions or claims. **After:** FSOS-005.

### P3 — Real client + manual studio office

- [ ] **FSOS-023 — Guest brief and secure identity boundary** (Backend, P0). **Pass:** No signup for tools; verified account for private submission; anti-abuse and retention. **After:** FSOS-003,FSOS-014.
- [ ] **FSOS-024 — Progressive smart brief wizard** (Frontend, P0). **Pass:** 3 essential first questions, dynamic discipline fields and accessible back/resume. **After:** FSOS-014,FSOS-023.
- [ ] **FSOS-025 — Encrypted private asset upload** (Backend, P0). **Pass:** File validation, private bucket, short-lived signed URLs, RLS tests Client A vs B. **After:** FSOS-023.
- [ ] **FSOS-026 — Real request state machine** (Backend, P0). **Pass:** Atomic server state transitions, audit events and idempotency on submission. **After:** FSOS-024.
- [ ] **FSOS-027 — Formal quote approval and accepted hour cap** (Backend, P0). **Pass:** No client amount authority, versioned service price, acceptable pending/accepted rules. **After:** FSOS-016,FSOS-026.
- [ ] **FSOS-028 — Manual admin intake and work assignment** (Studio, P0). **Pass:** Studio human can triage, accept, assign, prioritize and decline with logs. **After:** FSOS-026.
- [ ] **FSOS-029 — Real project timeline and inbox** (Client, P0). **Pass:** No fake fallback or percentages, persisted events, client ownership protection. **After:** FSOS-026,FSOS-028.
- [ ] **FSOS-030 — Proofing, notes, revision and version approval** (Client, P0). **Pass:** Image pin and/or video timestamp persisted; revision limit and version specific approval. **After:** FSOS-025,FSOS-029.
- [ ] **FSOS-031 — Secure final delivery and archives** (Client, P0). **Pass:** Actual authorized file downloads; approval and receipt recorded. **After:** FSOS-030.

### P4 — Puter sponsored AI

- [ ] **FSOS-032 — Build server-only AI provider interface** (AI, P0). **Pass:** Puter and fallback adapters implement common structured response; secrets not client-visible. **After:** FSOS-006.
- [ ] **FSOS-033 — Enable owner-context Puter in sandbox** (AI, P0). **Pass:** No visitor Puter login; worker/Node token held server side; permission and API behavior test. **After:** FSOS-032.
- [ ] **FSOS-034 — Guest quotas, risk and cost limits** (Security, P0). **Pass:** Daily cap, rate buckets, model allowlist, timeouts, kill switch and abuse denial tested. **After:** FSOS-033.
- [ ] **FSOS-035 — Free AI creative tool schema** (Product, P0). **Pass:** Brief, hooks, captions, listing outputs validated; 2-3 guest calls proposed by config. **After:** FSOS-034.
- [ ] **FSOS-036 — AI usage metering and owner budget dashboard** (Backend, P0). **Pass:** Records model, cost, latency, completion and masked request; budget alerts function. **After:** FSOS-034.

### P5 — AI micro-commerce

- [ ] **FSOS-037 — Freeze micro-SKU output contracts** (Product, P0). **Pass:** ৳49/99/199 are proposed tests; exact outputs, limits, terms and refunds explicit. **After:** FSOS-035,FSOS-036.
- [ ] **FSOS-038 — Merchant sandbox and verified webhook** (Commerce, P0). **Pass:** Signed webhook, amount and currency checks, duplicate callback idempotency tested. **After:** FSOS-037.
- [ ] **FSOS-039 — Immutable AI credit and reservation ledger** (Backend, P0). **Pass:** No negative credits/double charge, ambiguous timeouts reconcile safely. **After:** FSOS-038.
- [ ] **FSOS-040 — AI micro-kit generation/export** (AI, P0). **Pass:** Exactly named outputs generated, structured PDF/text, retries/refunds described. **After:** FSOS-037,FSOS-039.
- [ ] **FSOS-041 — Human studio upsell at value moment** (Growth, P1). **Pass:** Free experience remains useful; no dark patterns, measurable outbound path. **After:** FSOS-040.

### P6 — Human/SI production

- [ ] **FSOS-042 — Human/SI agent command center** (Studio, P0). **Pass:** Roles separated; assistant cannot approve money/deadlines/final handover. **After:** FSOS-028,FSOS-032.
- [ ] **FSOS-043 — Durable agent jobs with audit and retry** (Backend, P0). **Pass:** Idempotency, cancellation, retries, budget cap and real visible events. **After:** FSOS-042.
- [ ] **FSOS-044 — Express slot preflight and booking** (Studio, P0). **Pass:** 10 min offered only on single-file qualifying tasks and real available time slot. **After:** FSOS-028.
- [ ] **FSOS-045 — Event-based human/SI progress display** (Client, P0). **Pass:** Client sees accurate actors and next step, without fake percentages. **After:** FSOS-042,FSOS-043.

### P7 — PWA & experiments

- [ ] **FSOS-046 — PWA manifest, service worker, install UI** (Frontend, P1). **Pass:** Manifest passes install checks, iOS instructions, no private data offline cached. **After:** FSOS-017.
- [ ] **FSOS-047 — Opt-in delivery notifications** (Backend, P1). **Pass:** Client-owned subscriptions and event-triggered notifications, unsubscribe works. **After:** FSOS-029,FSOS-046.
- [ ] **FSOS-048 — Product and service funnel analytics** (Growth, P1). **Pass:** Real anonymized event taxonomy and consent; no raw creative data in events. **After:** FSOS-017,FSOS-041.
- [ ] **FSOS-049 — Accessibility, motion, mobile and performance** (QA, P0). **Pass:** Keyboard/reduced motion, 360/390/1440, poor network, LCP/INP/CLS targets measured. **After:** FSOS-046.

### P8 — Release QA & explicit approval

- [ ] **FSOS-050 — All tests on staging and two-tenant fixtures** (QA, P0). **Pass:** typecheck/lint/unit/integration/build/e2e/RLS/storage, negative tests with logs. **After:** FSOS-049.
- [ ] **FSOS-051 — Release staging demo and rollback evidence** (Architect, P0). **Pass:** Screenshots are from real app; smoke test payment, AI costs and real file handoff. **After:** FSOS-050.
- [ ] **FSOS-052 — Final permission to merge/deploy** (Owner, P0). **Pass:** Owner explicitly reviews staging evidence and approves production rollout. **After:** FSOS-051.

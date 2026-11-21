# P0 / P1 Go-No-Go Acceptance Gates

A **GO** requires verified proof, not source comments or screenshots alone.

| Gate | Test / evidence | Failure condition |
|---|---|---|
| Repo baseline | Clean `main` HEAD and feature branch commit SHA; CI logs | Uncommitted/unknown changes or untraceable branch |
| Type and lint | `npm ci`, `npm run typecheck`, `npm run lint` | `@ts-nocheck`/`eslint-disable` in production feature to bypass unresolved bugs |
| Full build | `npm run build` succeeds with env-appropriate mocks only in staging | Build errors or hidden required env |
| Unit tests | `npm run test:unit`, explicit new catalog & financial tests | Previous dated reports presented as new passes |
| Integration | `npm run test:integration` against isolated staging DB + SQL migration list/advisors | Missing migrations or cross-user access |
| E2E | `npm run test:e2e` updated to real routes/flows (Chromium/mobile at minimum) | Old hardcoded text test only or failed user flows |
| Commercial | every approved ratebook row in BDT/USD verified; discounts correct, server time; DB constraints | Single invented global hourly rate, stale seed, mismatched FK |
| Checkout | accepted quote yields authorized order and verified provider payment; exactly-once callbacks | Stub redirect / success without paid order |
| Inquiry | durable receipt after commit; restart and cross-instance read test; rate limit | In-memory-only confirmation |
| Client tenancy | user A/B, unauth, missing ID, staff/admin, file download, annotations | Access to others' data or stock asset used as real proof |
| Tracking | real manual admin event → durable database → client-visible milestone | Demo timeline treated as production |
| Express | studioSlotConfirmed `=== true`, scope + files + actual slot event | Unconfirmed slot accepted |
| Puter | real server-only Puter request with configured provider; cap/budget/quota/kill | `PUTER_SERVER_TOKEN` only changes response label |
| AI kits | reserved credits, paid webhook, delivered output, refund/idempotency, measured margin | Paid CTA accepted without fulfillment & cost accounting |
| PWA | manifest, icon, appropriate SW/offline utility, no private-cache leakage | Install icon is only PWA evidence |
| Security | no service secrets or internal blueprints exposed; RLS advisor scan; input quotas | leaked docs/secrets/PII |
| Accessibility | 360/390 mobile, keyboard, ARIA, reduced motion, color contrast | Motion blocks task completion |
| Release | rollback plan, monitoring, owner-approved staging smoke + explicit deploy approval | Unapproved live DB migration/merge/deploy |

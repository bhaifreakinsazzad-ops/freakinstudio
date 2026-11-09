# Remaining Work

This is the honest gap list after Phase 0-1 (Foundation). Nothing below is implemented. See `CLAUDE.md` for the phase numbering these map to.

## Immediate (unblocks verification of what's already written)

- [ ] Create a hosted Supabase project and populate `.env.local` / `.env.test`.
- [ ] Apply the 8 migrations in `supabase/migrations/` to that project.
- [ ] Run `npm run seed:catalog` and confirm 60 rows in `services`.
- [ ] Run `npm run test:integration` and confirm all 6 RLS/auth tests pass.
- [ ] Do a real signup → email confirmation → login → `/dashboard` pass in the browser.

## Phase 2 — Catalog & Package Builder (not started)

- Service catalog storefront (category pages, search/filter, service detail pages).
- Seven-step "Build Your Creative Package" wizard wired to the real database.
- Draft persistence (save/resume/duplicate packages), including for signed-out guests.
- Dynamic per-service configuration forms (the legacy prototype hardcoded these per service type — needs a real schema-driven approach, e.g. `service_config_schemas`).

## Phase 3 — Commercial Engine (not started)

- Price books, pricing rules, admin price-approval workflow. **The legacy's hardcoded USD/BDT prices and ×1.35 rush multiplier are development fixtures only — do not expose them as official pricing until an admin approval flow exists** (see `CLAUDE.md` → Commercial governance).
- Quotation request → review → issue → accept flow with immutable commercial snapshots.
- Server-authoritative pricing endpoint (the legacy only ever described this as prose: `POST /api/pricing/quote`, never built).

## Phase 4 — Checkout & Orders (not started)

- SSLCOMMERZ adapter (Bangladesh) and, if eligible, Stripe (international) — real server-side verification, not the legacy's `setTimeout`-based simulation.
- `orders`, `payments`, `invoices` tables (not yet migrated).
- Idempotent order creation, invoice generation.

## Phase 5 — Client Workspace (not started)

- Real project dashboard (current `/dashboard` only proves auth works — it shows the signed-in profile, nothing else).
- Service-specific onboarding briefs.
- File uploads to Supabase Storage (the legacy used `FileReader` → base64 in `localStorage`, unviable — no Storage buckets exist yet).

## Phase 6 — Production & Creative Review (not started)

- Kanban / project lifecycle state machine, staff assignment.
- Visual annotation/proofing system (`project_assets`, `asset_annotations` — not migrated). Note: the legacy's own embedded SQL draft had `project_assets` RLS *enabled with no policy* — when this table is eventually migrated, make sure it gets a real policy from the start, unlike the legacy draft.
- Revision quota enforcement, approval workflow.
- Real final-file delivery. **The legacy's "Download Final Archive (.ZIP)" button is fake — it only shows a toast notification, no file is ever generated.** This needs to actually work when built (the legacy's SQL-schema download button, which uses a real `Blob` + `<a download>`, is the correct pattern to copy).

## Phase 7 — Studio Admin OS & Automation (not started)

- **Rebuild `StudioAdminView` — confirmed missing from the legacy source, not just hard to find** (see `docs/LEGACY_AUDIT.md` §1). There is no reference implementation to port; this needs to be designed fresh.
- Service catalog manager, add-on manager, pricing manager, package manager, quote desk, order/payment center, production manager, customer manager, analytics, business settings.
- Workflow automation (event-driven: payment verified → order → project → brief request, etc.).
- Notifications (in-app + email).

## Phase 8 — Polish & Release (not started)

- Bilingual UI — `title_bn`/`name_bn` columns exist in the schema and are populated from the legacy data, but nothing in the UI renders or switches languages yet.
- SEO (metadata, sitemap, structured data), a simple CMS for marketing content.
- Analytics (real event tracking — no fabricated metrics).
- `.cyber-scanline` decorative motif (deferred from Foundation as purely cosmetic).
- Accessibility (WCAG 2.2 AA) and performance passes.
- Production deployment (Vercel + Supabase), monitoring, backups.

## Explicitly deferred architectural decisions

- `(commerce)` and `(admin)` Next.js route groups were intentionally not created in Foundation — they'd be empty. First real files land in Phase 2 and Phase 7 respectively.
- `docs/ARCHITECTURE.md`, `docs/API_REFERENCE.md`, `docs/PAYMENT_INTEGRATION.md`, `docs/SECURITY_CHECKLIST.md`, `docs/TEST_RESULTS.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/ADMIN_GUIDE.md` (named in the original project brief) are not written yet — they describe systems that don't exist yet in this codebase; writing them now would be describing vaporware.

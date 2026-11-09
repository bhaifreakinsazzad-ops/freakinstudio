# Legacy Source Audit

**Source file**: `reference/legacy/freakin_s_studio_creative_commerce_os.html` (preserved byte-for-byte from `freakin_s_studio_creative_commerce_os (6).html`, SHA-256 `c5b8641b1b7c94e0c5f7e5857a225e498b04549616cfc38f761c4038a5018269`).

Single-file HTML app: React 18 (UMD) + ReactDOM + Babel Standalone (`<script type="text/babel">`), Tailwind via CDN with a custom theme extension, Anime.js 3.2.1. No build step, no modules — 3,483 lines, 188,346 bytes.

This document is the permanent record of what was found in the legacy prototype, so later phases don't need to re-derive it.

## 1. Component inventory

| Section | Component | Status |
|---|---|---|
| 0 | `SYSTEM_FLAGS`, `Icon`, `StudioSFX`, `MotionFX` | defined (infra) |
| 1 | `SERVICE_CATEGORIES`, `INITIAL_CANONICAL_SERVICES`, `ADD_ON_UNIT_PRICES` | defined (data) |
| 2 | `DB_STORAGE_KEY`, `getInitialDatabaseState`, `loadDatabase` | defined |
| 3 | `App()` (root) | defined |
| 4 | `PackageBuilderView` | defined |
| 5 | `CatalogStorefrontView` | defined |
| 6 | `ClientPortalView` | defined |
| 7 | **`StudioAdminView`** | **MISSING — referenced once in JSX (`currentView === 'admin-os'`), never defined. Section 7's header comment is immediately followed by section 8's component with zero code between. Confirmed regression; navigating to the admin view in the legacy app throws `ReferenceError`.** |
| 8 | `PaymentGatewayModal` | defined (simulated, see §5) |
| 9 | `BrandedInvoiceModal` | defined |
| 10 | `ArchitectureAuditModal` | defined (includes in-browser self-tests + embedded SQL generator) |

Not ported in this pass: none of these components (Foundation builds new Next.js pages, not a port of this file). `StudioAdminView` rebuild is deferred to a later phase (Studio Admin OS).

## 2. Catalog data (60 services — verified intact)

`INITIAL_CANONICAL_SERVICES`: flat array of 60 objects, fields `{ id, cat, title, bn, baseUSD, baseBDT, days, revisions, pricingStatus: 'approved'|'quote_required', addOns: [string,...] }`. `SERVICE_CATEGORIES`: `{ id, name, bn, count }` per category A–G.

Category distribution verified: A=10, B=8, C=12, D=8, E=8, F=7, G=7 = **60 total**, matching the authoritative master-spec catalog exactly. This data is extracted verbatim (not re-typed) via `scripts/extract-legacy-catalog.ts` into `supabase/seed/data/`.

## 3. Add-on model

Add-ons in the legacy file are **per-service label arrays only** — no separate priced entity. A single flat global rate is applied per selected add-on label: `ADD_ON_UNIT_PRICES = { USD: 25, BDT: 3000 }`. The legacy's own embedded (never-executed) SQL draft (§4 below) already models add-ons more properly as normalized `add_ons` + `service_add_ons` tables — that normalized shape is what the real schema adopts, with per-service label arrays deduped into `add_ons` rows during seed extraction.

## 4. Embedded SQL draft (reference only — not executed as-is)

Found inside `ArchitectureAuditModal`'s `generatePostgresSchemaSQL()` — a template literal, never run against a real database. Header claims "24 Relational Entities" but only **17 `CREATE TABLE IF NOT EXISTS`** statements actually exist: `profiles, organizations, organization_members, service_categories, services, add_ons, service_add_ons, quotes, quote_items, orders, payments, project_briefs, project_tasks, project_assets, asset_annotations, approvals, audit_logs`.

RLS coverage: only 3 tables have RLS enabled (`orders`, `quotes`, `project_assets`), only 2 policies exist (customers see only their own `orders`/`quotes` via `auth.uid() = client_id`). **`project_assets` has RLS enabled but no policy defined — a gap that would deny all access.** `profiles.id references auth.users(id)` confirms Supabase Auth was the intended identity provider. `profiles.role` CHECK constraint lists 9 roles: `customer, customer_team, designer, video_editor, project_manager, sales_rep, finance_manager, studio_admin, super_admin`.

This draft is treated as a reference starting point only. The real Foundation migrations (this pass) cover a subset (identity + catalog) with full RLS on every table — see `docs/DATABASE_SCHEMA.md`.

## 5. Payment flow — fully simulated

`PaymentGatewayModal` has zero network calls. It's a pure state machine (`select → redirecting → verifying → success`) driven by chained `setTimeout`s (1200ms → 1500ms → 800ms), producing a fake transaction ID via `Math.random()` suffixed `-SANDBOX`. `SYSTEM_FLAGS` confirm nothing real is wired: `ENABLE_LIVE_PAYMENTS: false, ENABLE_STRIPE: false, ENABLE_SSLCOMMERZ: false`. Two planned (undocumented-as-code) server endpoints are described in prose in the Architecture Audit modal: `POST /api/pricing/quote` and `POST /api/payments/sslcommerz/ipn`. Out of scope for this pass.

## 6. Role switching — dev-only, zero auth

A `SYSTEM_FLAGS.ENABLE_DEV_ROLE_SWITCHER`-gated `<select>` let the demo instantly swap `db.activeUserId` client-side with no authentication at all. **This pattern is explicitly not ported, in any form** — real roles come from Supabase Auth + `profiles.role`, enforced via RLS, from day one (see `docs/DATABASE_SCHEMA.md` §Auth).

## 7. File upload / proofing

`handleFileUpload` used `FileReader.readAsDataURL` to store files as base64 strings directly in app state (and thus in `localStorage`) — not viable for production (quota limits, no real storage). Click-to-pin annotation (`handleCanvasClick`) converts click position to percentage coordinates and uses `window.prompt()` for feedback text, appending to `asset.annotations`. Both are out of scope for this pass; Supabase Storage private-bucket design is anticipated for a later phase but no buckets are created now.

## 8. Design tokens (preserved this pass)

Dark "cyberpunk SaaS ops console" aesthetic, forced dark theme (`<html class="dark">`, `darkMode:'class'`):

- Colors: `black #09090b, surface #121215, card #18181b, border #27272a, muted #71717a, light #f4f4f5, accent #e4e4e7, highlight #3b82f6, success #10b981, warning #f59e0b, danger #ef4444`.
- Fonts: Inter (sans, 300–900) + JetBrains Mono / Fira Code (mono, badges/numeric data).
- Signature motifs: `.glass-panel`/`.glass-card` (frosted blur), `.cyber-glow` (colored box-shadow glow), `.cyber-scanline` (repeating-gradient overlay — **deferred**, purely decorative), `.badge-mono` (mono pill labels), thin dark scrollbars.

Ported into `src/app/globals.css` as Tailwind 4 `@theme` tokens — see `docs/DATABASE_SCHEMA.md` is not relevant here; see the project `CLAUDE.md` for the design-token summary.

## 9. Other notable logic (reference only, not implemented this pass)

- Rush delivery surcharge ×1.35, applied after qty+add-ons summed.
- Quote-required gating: any `pricingStatus==='quote_required'` service, OR >5 services selected, OR BDT subtotal > ৳150,000.
- Volume discount logic exists but is disabled via `SYSTEM_FLAGS.ENABLE_UNAPPROVED_PROMOTIONS: false`.
- No live USD↔BDT FX conversion — `baseUSD`/`baseBDT` are independent fields per service.
- "Download Final Archive (.ZIP)" button is **not a real download** — it only shows a toast notification. (Contrast: the embedded SQL schema download *is* a real `Blob` + `<a download>`, proving the pattern exists but wasn't applied to asset delivery.)
- `ArchitectureAuditModal` includes 5 in-browser self-test assertions (catalog distribution, qty tamper-guard, cross-customer isolation, revision quota, promotions flag) — a good "spec as code" reference for this pass's real Vitest integration tests.

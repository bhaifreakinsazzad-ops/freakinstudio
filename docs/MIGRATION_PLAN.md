# Migration Plan — Creative Office OS 2.0 (Forward-Only SQL)

**Version:** Creative Office OS 2.0  
**Scope:** Non-destructive schema evolution from Foundation / Directive 9.0 (`001`–`010`) to Canonical Catalog, Durable Intake, Production Events, AI Metering, and Reconciled Financial RPCs (`011`–`014`).  
**Deployment Target:** Isolated Staging Supabase project first (`psql` / Supabase SQL Editor); **never** execute directly against production without backup, dry-run, and explicit owner authorization.

---

## 1. Migration Inventory (`supabase/migrations/`)

| Order | Migration File | Purpose | Staging Execution Status |
|---|---|---|---|
| 001 | `20261109000001_extensions.sql` | Postgres extensions (`pgcrypto`, `uuid-ossp`) | Previously applied on reference DB |
| 002 | `20261109000002_enums.sql` | `user_role`, `pricing_status` enums | Previously applied on reference DB |
| 003 | `20261109000003_profiles.sql` | `profiles` table + `handle_new_user()` trigger | Previously applied on reference DB |
| 004 | `20261109000004_organizations.sql` | Multi-org workspace entities | Previously applied on reference DB |
| 005 | `20261109000005_organization_members.sql` | Org membership roles | Previously applied on reference DB |
| 006 | `20261109000006_catalog.sql` | Base `service_categories`, `services`, `add_ons`, `service_add_ons` | Previously applied on reference DB |
| 007 | `20261109000007_helper_functions.sql` | `SECURITY DEFINER` helpers `is_admin()`, `is_org_member()` | Previously applied on reference DB |
| 008 | `20261109000008_rls_policies.sql` | Baseline RLS policies across identity & catalog tables | Previously applied on reference DB |
| 009 | `20261109000009_packages_quotes_orders.sql` | `package_drafts`, `quotes`, `quote_items`, `orders`, `order_items`, `payments`, `projects`, `project_briefs`, `project_tasks`, `project_assets`, `asset_annotations`, `approvals`, `audit_logs`, `delivery_events` | **Pending staging verification** |
| 010 | `20261109000010_trusted_transactions.sql` | Initial trusted quote/order/payment RPCs | **Pending staging verification (superseded by 014)** |
| 011 | `20261121000011_canonical_catalog_ratebook.sql` | Non-destructive canonical `4/13/15/5/14` catalog upsert, `service_variants`, `commercial_bundles`, `legacy_service_map`; sets historical `A01..G07` rows `active = false` without deletion; defaults `SRV-01..SRV-13` to `pricing_status = 'quote_required'` & `ratebook_approved = false` | **New — Pending staging execution** |
| 012 | `20261121000012_inquiries_and_project_events.sql` | Durable `inquiries` table (`reference_id`, `status`, `assigned_to`, `source_ip_hash`), `project_events` immutable timeline (`actor_kind`, `si_status`, `visibility`), plus `projects`/`quotes`/`orders` columns (`quote_id`, `assigned_to`, `deadline_at`, `express_slot_confirmed`, `ratebook_version`, `expires_at`, `gateway`, `gateway_tran_id`, promo columns) | **New — Pending staging execution** |
| 013 | `20261121000013_ai_gateway_and_microkits.sql` | `ai_gateway_config` singleton kill switch & daily budget cap, `ai_usage_events` telemetry, `credit_ledger` append-only ledger, `microkit_orders` | **New — Pending staging execution** |
| 014 | `20261121000014_fix_trusted_rpcs.sql` | Reconciles `create_quotation_request`, `create_pending_order`, `settle_verified_payment`, `submit_project_brief`, `approve_project_asset` with variant multipliers, compatible add-ons, bundle handling, `Asia/Dhaka` 5% launch promo window, `p_terms_accepted`, strict `approved + ratebook_approved` checkout lock, and idempotent payment-to-project creation | **New — Pending staging execution** |

---

## 2. Historical Data & Foreign Key Preservation Strategy

1. **Zero Destructive Truncation**: Legacy `A..G` categories and `A01..G07` services are **never** deleted (`DELETE` / `TRUNCATE` are omitted completely). Migration `011` only sets `active = false` on non-`DISC-*` categories and non-`SRV-*` services while keeping every FK in `quote_items` and `order_items` intact.
2. **Legacy Crosswalk Table (`legacy_service_map`)**: Maps legacy IDs (e.g., `A01..G07`) to canonical `SRV-01..SRV-13` targets or marks them `retired_from_public_storefront` so legacy quotes/orders remain queryable in Admin and Client portals.
3. **Catalog Seeding Idempotency**: `scripts/seed-services.ts` (`npm run seed:catalog`) upserts `service_categories` (4), `services` (13), `service_variants` (15), `commercial_bundles` (5), `add_ons` (14), and `service_add_ons` while preserving legacy rows.
4. **Ratebook v8/v8.1 Approval Gate**: Until the owner provides verified BDT & USD per-service hourly rates in SQL/Admin, all `SRV-01..SRV-13` and `BND-01..BND-05` rows keep `pricing_status = 'quote_required'` and `ratebook_approved = false`, preventing unapproved self-serve checkout in both `/api/pricing/quote` and `create_pending_order`.

---

## 3. Staging Rollout Procedure

1. Take a full logical snapshot of staging Postgres (`pg_dump --format=custom --no-owner`).
2. Apply migrations `009` → `010` → `011` → `012` → `013` → `014` sequentially inside a staging transaction or Supabase SQL Editor.
3. Run `npm run seed:catalog` against staging (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
4. Verify row counts:
   - `service_categories`: 4 active (`DISC-01`..`DISC-04`), legacy rows `active = false`.
   - `services`: 13 active (`SRV-01`..`SRV-13`), legacy rows `active = false`.
   - `service_variants`: 15 (`VAR-01`..`VAR-15`).
   - `commercial_bundles`: 5 (`BND-01`..`BND-05`).
   - `add_ons`: 14 (`ADD-01`..`ADD-14`).
   - `ai_gateway_config`: 1 singleton row (`id = 'default'`).
5. Execute `npm run test:integration` with staging `.env.test` credentials to verify RLS & auth isolation (`tests/integration/rls-auth.test.ts`).

---

## 4. Rollback Plan (If Staging Smoke Fails)

- **Schema & RPC Rollback**:
  - Restore the pre-migration `pg_dump` snapshot on staging, **or** run a targeted revert script dropping newly added objects (`drop table if exists public.microkit_orders, public.credit_ledger, public.ai_usage_events, public.ai_gateway_config, public.project_events, public.inquiries, public.legacy_service_map, public.commercial_bundles, public.service_variants cascade;`) and re-enabling legacy `active = true` on non-`SRV-*` rows if reverting to Directive 9.0.
- **Application Code Rollback**:
  - Revert deployment / feature branch commit; old historical orders (`A01..G07`) remain intact in Postgres because no destructive column or row drops occurred.

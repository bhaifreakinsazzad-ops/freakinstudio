# Database Schema (Foundation phase)

Migrations live in `supabase/migrations/`, applied in filename order. Target: a hosted Supabase (Postgres 15+) project — see `README.md` for how to apply them (no local Docker/CLI stack on this machine).

## Scope

Foundation covers **identity** and **catalog** only — 7 tables. Commerce, production, communication, and operations tables from the original project brief's full ~24-entity target (quotes, orders, payments, project_briefs, project_tasks, project_assets, asset_annotations, approvals, audit_logs, etc.) are **not created**. See `docs/REMAINING_WORK.md`.

## Tables

### `profiles`
One row per `auth.users` row, created automatically by the `handle_new_user()` trigger (migration 3) — **never created or role-assigned by client code**. `role` defaults to `'customer'` and is enum-typed (`user_role`, migration 2).

### `organizations` / `organization_members`
A customer organization and its membership roster. `organization_members.org_role` (`'owner' | 'member'`) is local to the org and distinct from the global `profiles.role`.

### `service_categories` / `services` / `add_ons` / `service_add_ons`
The 60-service catalog, normalized (unlike the legacy prototype's flat per-service label arrays — see `docs/LEGACY_AUDIT.md` §3). IDs (`'A01'`, etc.) are preserved verbatim from the legacy data. Seeded from `supabase/seed/data/*.json`, which was extracted verbatim from `reference/legacy/` by `scripts/extract-legacy-catalog.ts` — see that script's header comment for how (no `eval`/`vm` on the downloaded file; a small hand-written literal-to-JSON converter instead).

## Role enum

```sql
create type user_role as enum (
  'customer', 'customer_org_admin', 'customer_team_member', 'sales_rep',
  'designer', 'video_editor', 'project_manager', 'finance_manager',
  'studio_admin', 'super_admin'
);
```

Reconciles the legacy prototype's 9-role `CHECK` constraint against the original project brief's 11 named roles. "Visitor" is unauthenticated and so isn't a persisted enum value. The brief's "Customer Organization Admin" and "Customer Team Member" are kept distinct (the legacy only had one `customer_team` role).

## Row Level Security

Every table above has RLS **enabled and at least one policy** — no exceptions. This is a deliberate fix for a confirmed gap in the legacy's own embedded SQL draft, where `project_assets` had RLS enabled with zero policies defined (which would silently deny all access). See migration `20261109000008_rls_policies.sql` for every policy; summary:

- `profiles`: read own row (or any row, if admin); update own row but the `role` column is locked (checked via `with check`) unless the caller is an admin.
- `organizations` / `organization_members`: read restricted to members of that org (or admins); insert/update restricted to the creator/an owner-role member.
- `service_categories` / `services` / `add_ons` / `service_add_ons`: public read (unauthenticated catalog browsing is a later-phase UI feature, but the schema supports it today); write restricted to admins.

`is_admin()` and `is_org_member(org_id)` (migration 7) are `SECURITY DEFINER` functions, required to avoid infinite recursion when a policy on `profiles` itself needs to check the caller's role.

## TypeScript types

`src/types/database.types.ts` is **hand-written** to mirror the migrations exactly — the Supabase CLI's `gen types` command isn't runnable on this machine. Once a hosted project exists and the CLI works somewhere (e.g. CI, or another machine), regenerate it with:

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
```

and reconcile any drift against the hand-written version (which was written carefully to match the `GenericTable` shape `@supabase/supabase-js` expects — each table needs `Row`, `Insert`, `Update`, and `Relationships: []`, or the whole schema silently types as `never`).

## Verifying the schema

1. Apply all migrations in `supabase/migrations/` in order.
2. `npm run seed:catalog` — should report 7 categories, 60 services, and however many unique add-ons/links the extractor found; the script itself asserts `services` ends up with exactly 60 rows.
3. `npm run test:integration` (needs `.env.test`) — runs the full RLS/auth isolation suite described in `tests/integration/rls-auth.test.ts`.

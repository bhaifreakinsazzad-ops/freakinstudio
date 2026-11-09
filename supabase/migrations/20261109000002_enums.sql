-- Freakin's Studio — Foundation migration 2/8
-- Role enum reconciles the legacy prototype's 9-role CHECK constraint with
-- the master spec's 11 named roles (Visitor is unauthenticated, so it is
-- not a persisted value — "Customer Organization Admin" and "Customer Team
-- Member" are kept distinct, per the spec, unlike the legacy's single
-- "customer_team"). See docs/LEGACY_AUDIT.md §6 and docs/DATABASE_SCHEMA.md.
create type user_role as enum (
  'customer',
  'customer_org_admin',
  'customer_team_member',
  'sales_rep',
  'designer',
  'video_editor',
  'project_manager',
  'finance_manager',
  'studio_admin',
  'super_admin'
);

create type pricing_status as enum ('approved', 'quote_required');

-- Freakin's Studio — Migration 9/10 (Directive 10.0 security remediation)
--
-- Tables for drafts, quotations, orders, payments, projects, assets,
-- approvals, delivery events, pricing rules and audit logs.
--
-- AUTHORIZATION MODEL (read this before adding a policy):
--   * Customers get SELECT on their own commercial records and nothing else.
--     They can never INSERT/UPDATE/DELETE quotes, quote_items, orders,
--     order_items, payments, projects, approvals or delivery_events through
--     the client SDK. There is deliberately NO customer write policy on any
--     of those tables.
--   * Every sensitive transition (quote request, quote acceptance, pending
--     order creation, payment settlement, brief submission, revision request,
--     version approval) runs through a function in migration 10 that
--     re-checks identity, ownership, state and amounts inside one transaction.
--   * Functions that move money state are executable by service_role only.
--   * Every RLS-enabled table has at least one policy.

-- ---------------------------------------------------------------------------
-- 0. Price approval metadata on the catalog
-- ---------------------------------------------------------------------------
-- The seeded prices are legacy development fixtures. A service is only
-- directly purchasable once an administrator has explicitly approved its
-- price (price_approved_at is not null). pricing_status alone is NOT approval.
alter table public.services
  add column if not exists price_approved_at timestamptz,
  add column if not exists price_approved_by uuid references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 1. PRICING RULES (versioned, administrator-controlled)
-- ---------------------------------------------------------------------------
-- No row is seeded: with no active rule the engine applies no rush surcharge
-- and sends every package to manual quotation.
create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  status text not null default 'draft' check (status in ('draft', 'active', 'retired')),
  rush_surcharge_rate numeric(5, 4) not null default 0 check (rush_surcharge_rate >= 0 and rush_surcharge_rate <= 2),
  max_direct_checkout_services int not null default 0 check (max_direct_checkout_services >= 0),
  max_direct_checkout_bdt numeric(14, 2) not null default 0 check (max_direct_checkout_bdt >= 0),
  max_direct_checkout_usd numeric(12, 2) not null default 0 check (max_direct_checkout_usd >= 0),
  max_quantity_per_service int not null default 100 check (max_quantity_per_service between 1 and 10000),
  notes text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  -- an active rule must carry an approval record
  constraint pricing_rules_active_needs_approval
    check (status <> 'active' or (approved_by is not null and approved_at is not null))
);

create unique index if not exists pricing_rules_single_active_idx
  on public.pricing_rules ((true)) where status = 'active';

alter table public.pricing_rules enable row level security;

create policy "pricing_rules_select_active_or_admin" on public.pricing_rules
  for select using (status = 'active' or public.is_admin());

create policy "pricing_rules_admin_write" on public.pricing_rules
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. PACKAGE DRAFTS (customer-owned working data, no commercial authority)
-- ---------------------------------------------------------------------------
create table if not exists public.package_drafts (
  id text primary key check (char_length(id) between 8 and 80),
  user_id uuid not null references public.profiles(id) on delete cascade,
  objective jsonb not null default '{}'::jsonb,
  services text[] not null default '{}',
  service_configs jsonb not null default '{}'::jsonb,
  selected_add_ons jsonb not null default '{}'::jsonb,
  -- display cache only; never read back as a price
  pricing_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_drafts_user_id_idx on public.package_drafts (user_id);

alter table public.package_drafts enable row level security;

create policy "package_drafts_select_owner_or_admin" on public.package_drafts
  for select using (auth.uid() = user_id or public.is_admin());

create policy "package_drafts_insert_owner" on public.package_drafts
  for insert with check (auth.uid() = user_id);

create policy "package_drafts_update_owner" on public.package_drafts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "package_drafts_delete_owner" on public.package_drafts
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. QUOTATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_ref text not null unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'issued', 'accepted', 'declined', 'expired', 'withdrawn', 'converted')),
  -- 'priced': every line was priced from approved catalog prices.
  -- 'manual': at least one line has no approved price; amounts are not binding
  --           until an administrator issues the quote.
  pricing_mode text not null default 'manual' check (pricing_mode in ('priced', 'manual')),
  version int not null default 1 check (version >= 1),
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  amount_bdt numeric(14, 2) not null default 0 check (amount_bdt >= 0),
  amount_usd numeric(12, 2) not null default 0 check (amount_usd >= 0),
  scope_snapshot jsonb not null default '{}'::jsonb,
  -- licensing/revision terms are set by the studio when issuing; null = none granted
  license_terms jsonb,
  revisions_included int check (revisions_included is null or revisions_included >= 0),
  notes text,
  admin_notes text,
  expires_at timestamptz,
  issued_at timestamptz,
  issued_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_client_id_idx on public.quotes (client_id);
create index if not exists quotes_status_idx on public.quotes (status);

alter table public.quotes enable row level security;

create policy "quotes_select_owner_or_admin" on public.quotes
  for select using (auth.uid() = client_id or public.is_admin());

-- No customer INSERT/UPDATE/DELETE policy on purpose. Admin edits are further
-- constrained by the immutability trigger in migration 10.
create policy "quotes_admin_write" on public.quotes
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id text references public.services(id) on delete set null,
  title text not null,
  quantity int not null default 1 check (quantity > 0),
  unit_rate_bdt numeric(12, 2) not null default 0 check (unit_rate_bdt >= 0),
  unit_rate_usd numeric(10, 2) not null default 0 check (unit_rate_usd >= 0),
  add_ons_total_bdt numeric(12, 2) not null default 0 check (add_ons_total_bdt >= 0),
  add_ons_total_usd numeric(10, 2) not null default 0 check (add_ons_total_usd >= 0),
  rush_surcharge_bdt numeric(12, 2) not null default 0 check (rush_surcharge_bdt >= 0),
  rush_surcharge_usd numeric(10, 2) not null default 0 check (rush_surcharge_usd >= 0),
  line_total_bdt numeric(14, 2) not null default 0 check (line_total_bdt >= 0),
  line_total_usd numeric(12, 2) not null default 0 check (line_total_usd >= 0),
  price_approved boolean not null default false,
  config jsonb not null default '{}'::jsonb
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

alter table public.quote_items enable row level security;

create policy "quote_items_select" on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and (q.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "quote_items_admin_write" on public.quote_items
  for all using (public.is_admin()) with check (public.is_admin());

-- Append-only record of every issued version of a quote.
create table if not exists public.quote_versions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  version int not null,
  currency text not null,
  amount_bdt numeric(14, 2) not null,
  amount_usd numeric(12, 2) not null,
  snapshot jsonb not null,
  issued_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (quote_id, version)
);

alter table public.quote_versions enable row level security;

create policy "quote_versions_select" on public.quote_versions
  for select using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and (q.client_id = auth.uid() or public.is_admin())
    )
  );
-- no write policy: rows are written only by issue_quote() (security definer)

-- ---------------------------------------------------------------------------
-- 4. ORDERS, ORDER ITEMS & PAYMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  currency text not null check (currency in ('BDT', 'USD')),
  -- amount is the amount payable in `currency`; the server is its only writer
  amount numeric(14, 2) not null check (amount > 0),
  amount_bdt numeric(14, 2) not null check (amount_bdt >= 0),
  amount_usd numeric(12, 2) not null check (amount_usd >= 0),
  payment_status text not null default 'awaiting_payment' check (payment_status in ('awaiting_payment', 'payment_initiated', 'verifying', 'paid', 'failed', 'cancelled', 'refunded')),
  -- true only for orders created for the development test payment provider
  is_test boolean not null default false,
  revisions_included int not null default 0 check (revisions_included >= 0),
  license_terms jsonb,
  scope_snapshot jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_client_id_idx on public.orders (client_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
-- one order per accepted quote
create unique index if not exists orders_quote_id_unique_idx on public.orders (quote_id) where quote_id is not null;

alter table public.orders enable row level security;

create policy "orders_select_client_or_admin" on public.orders
  for select using (auth.uid() = client_id or public.is_admin());
-- No INSERT/UPDATE/DELETE policy for anyone: orders are written only by
-- create_pending_order() / settle_order_payment() under service_role.
-- (service_role bypasses RLS; admins get no direct write path to payment state.)

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id text references public.services(id) on delete set null,
  title text not null,
  quantity int not null default 1 check (quantity > 0),
  unit_rate_bdt numeric(12, 2) not null check (unit_rate_bdt >= 0),
  unit_rate_usd numeric(10, 2) not null check (unit_rate_usd >= 0),
  line_total_bdt numeric(14, 2) not null check (line_total_bdt >= 0),
  line_total_usd numeric(12, 2) not null check (line_total_usd >= 0),
  config jsonb not null default '{}'::jsonb
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.client_id = auth.uid() or public.is_admin())
    )
  );

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  gateway text not null check (gateway in ('sslcommerz', 'stripe', 'dev_test_adapter')),
  -- the reference we hand to / receive from the provider for this attempt
  transaction_ref text not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null check (currency in ('BDT', 'USD')),
  status text not null default 'initiated' check (status in ('initiated', 'verified', 'failed')),
  channel text,
  provider_ref text,
  verified boolean not null default false,
  verified_at timestamptz,
  is_test boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (gateway, transaction_ref),
  constraint payments_verified_consistent
    check ((verified and status = 'verified' and verified_at is not null) or (not verified and status <> 'verified'))
);

create index if not exists payments_order_id_idx on public.payments (order_id);
-- at most one verified payment per order: the database itself refuses a second settlement
create unique index if not exists payments_one_verified_per_order_idx on public.payments (order_id) where verified;

alter table public.payments enable row level security;

create policy "payments_select_client_or_admin" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.client_id = auth.uid() or public.is_admin())
    )
  );
-- No write policy for anyone (service_role functions only).

-- ---------------------------------------------------------------------------
-- 5. PROJECTS, BRIEFS, TASKS, ASSETS, ANNOTATIONS, APPROVALS, DELIVERY
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  assigned_pm_id uuid references public.profiles(id) on delete set null,
  assigned_designer_id uuid references public.profiles(id) on delete set null,
  title text not null,
  status text not null default 'awaiting_brief' check (status in ('awaiting_brief', 'brief_submitted', 'in_production', 'client_review', 'revision_requested', 'revision_in_progress', 'client_approved', 'completed', 'cancelled')),
  revisions_used int not null default 0 check (revisions_used >= 0),
  -- copied from the paid order's accepted scope; there is no default allowance
  max_revisions int not null default 0 check (max_revisions >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_revisions_within_allowance check (revisions_used <= max_revisions)
);

create index if not exists projects_client_id_idx on public.projects (client_id);
-- exactly one project per order: duplicate fulfilment is impossible
create unique index if not exists projects_order_id_unique_idx on public.projects (order_id);

alter table public.projects enable row level security;

-- Is the caller the client of this project (owner, or member of the owning org)?
create or replace function public.is_project_client(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (
        p.client_id = auth.uid()
        or (p.organization_id is not null and public.is_org_member(p.organization_id))
      )
  );
$$;

-- Is the caller assigned studio staff on this project?
create or replace function public.is_project_staff(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (p.assigned_pm_id = auth.uid() or p.assigned_designer_id = auth.uid())
  );
$$;

create policy "projects_select_participants" on public.projects
  for select using (
    public.is_project_client(id) or public.is_project_staff(id) or public.is_admin()
  );

-- Only administrators write projects directly (status, staff assignment).
-- Client-driven transitions go through the functions in migration 10.
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  brand_name text not null default '',
  objective text not null default '',
  audience text not null default '',
  platforms text not null default '',
  answers jsonb not null default '{}'::jsonb,
  submitted boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_briefs enable row level security;

create policy "project_briefs_select" on public.project_briefs
  for select using (
    public.is_project_client(project_id) or public.is_project_staff(project_id) or public.is_admin()
  );

create policy "project_briefs_admin_write" on public.project_briefs
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_tasks_project_id_idx on public.project_tasks (project_id);

alter table public.project_tasks enable row level security;

create policy "project_tasks_select" on public.project_tasks
  for select using (
    public.is_project_client(project_id) or public.is_project_staff(project_id) or public.is_admin()
  );

create policy "project_tasks_staff_write" on public.project_tasks
  for all
  using (public.is_admin() or public.is_project_staff(project_id))
  with check (public.is_admin() or public.is_project_staff(project_id));

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_label text not null default 'v1',
  revision_round int not null default 0 check (revision_round >= 0),
  file_name text not null,
  -- object path inside the private 'project-assets' storage bucket
  storage_path text not null unique,
  content_type text not null default 'application/octet-stream',
  file_size_bytes bigint not null check (file_size_bytes > 0),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  is_source_file boolean not null default false,
  is_approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_assets_project_id_idx on public.project_assets (project_id);

alter table public.project_assets enable row level security;

create policy "project_assets_select" on public.project_assets
  for select using (
    public.is_project_client(project_id) or public.is_project_staff(project_id) or public.is_admin()
  );

-- Staff may register uploads but can never mark their own upload as approved:
-- approval is set only by approve_project_asset() on behalf of the client.
create policy "project_assets_staff_insert" on public.project_assets
  for insert with check (
    (public.is_admin() or public.is_project_staff(project_id))
    and uploaded_by = auth.uid()
    and is_approved = false
    and approved_at is null
    and approved_by is null
  );

create policy "project_assets_admin_delete" on public.project_assets
  for delete using (public.is_admin() and is_approved = false);

create table if not exists public.asset_annotations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  coord_x_percent int not null check (coord_x_percent between 0 and 100),
  coord_y_percent int not null check (coord_y_percent between 0 and 100),
  feedback_text text not null check (char_length(feedback_text) between 1 and 2000),
  created_by uuid not null references public.profiles(id) on delete cascade,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists asset_annotations_asset_id_idx on public.asset_annotations (asset_id);

alter table public.asset_annotations enable row level security;

create policy "asset_annotations_select" on public.asset_annotations
  for select using (
    exists (
      select 1 from public.project_assets a
      where a.id = asset_id
        and (public.is_project_client(a.project_id) or public.is_project_staff(a.project_id) or public.is_admin())
    )
  );

create policy "asset_annotations_insert_participant" on public.asset_annotations
  for insert with check (
    auth.uid() = created_by
    and resolved = false
    and exists (
      select 1 from public.project_assets a
      where a.id = asset_id
        and (public.is_project_client(a.project_id) or public.is_project_staff(a.project_id) or public.is_admin())
    )
  );

create policy "asset_annotations_staff_resolve" on public.asset_annotations
  for update
  using (
    exists (
      select 1 from public.project_assets a
      where a.id = asset_id and (public.is_project_staff(a.project_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.project_assets a
      where a.id = asset_id and (public.is_project_staff(a.project_id) or public.is_admin())
    )
  );

-- An approval always names the exact asset version that was approved.
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid not null references public.project_assets(id) on delete restrict,
  asset_sha256 text not null,
  approved_by uuid not null references public.profiles(id) on delete cascade,
  terms_accepted boolean not null check (terms_accepted),
  notes text,
  created_at timestamptz not null default now(),
  unique (project_id, asset_id)
);

create index if not exists approvals_project_id_idx on public.approvals (project_id);

alter table public.approvals enable row level security;

create policy "approvals_select" on public.approvals
  for select using (
    public.is_project_client(project_id) or public.is_project_staff(project_id) or public.is_admin()
  );
-- no write policy: rows are written only by approve_project_asset()

create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  downloaded_by uuid references public.profiles(id) on delete set null,
  asset_ids uuid[] not null,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists delivery_events_project_id_idx on public.delivery_events (project_id);

alter table public.delivery_events enable row level security;

create policy "delivery_events_select" on public.delivery_events
  for select using (public.is_project_client(project_id) or public.is_admin());
-- no write policy: rows are written only by the server after a download

-- ---------------------------------------------------------------------------
-- 6. AUDIT LOGS
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  details text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.is_admin());

-- Only administrators may write entries directly, and only as themselves.
-- Everything else is logged by security-definer functions, so a customer
-- cannot forge an audit trail or attribute an event to another user.
create policy "audit_logs_insert_admin_self" on public.audit_logs
  for insert with check (public.is_admin() and actor_id = auth.uid());

-- Freakin's Studio — Migration 9/9
-- Comprehensive schema expansion for:
-- 1. package_drafts
-- 2. quotes & quote_items
-- 3. orders, order_items & payments
-- 4. projects, project_briefs, project_tasks, project_assets, asset_annotations, approvals
-- 5. audit_logs
-- All tables have Row Level Security enabled with explicit policies.

-- 1. PACKAGE DRAFTS
create table if not exists public.package_drafts (
  id text primary key, -- e.g. 'DRAFT-1731174000000' or uuid
  user_id uuid references public.profiles(id) on delete cascade,
  objective jsonb not null default '{}'::jsonb,
  services text[] not null default '{}',
  service_configs jsonb not null default '{}'::jsonb,
  selected_add_ons jsonb not null default '{}'::jsonb,
  pricing_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_drafts_user_id_idx on public.package_drafts (user_id);

alter table public.package_drafts enable row level security;

create policy "package_drafts_select_owner_or_admin" on public.package_drafts
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "package_drafts_insert_owner" on public.package_drafts
  for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "package_drafts_update_owner" on public.package_drafts
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "package_drafts_delete_owner" on public.package_drafts
  for delete
  using (auth.uid() = user_id or public.is_admin());

-- 2. QUOTATIONS & QUOTE ITEMS
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_ref text not null unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'approved', 'issued', 'accepted', 'declined', 'expired', 'withdrawn', 'converted')),
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  amount_bdt numeric(14, 2) not null default 0,
  amount_usd numeric(12, 2) not null default 0,
  scope_snapshot jsonb not null default '{}'::jsonb,
  notes text,
  admin_notes text,
  expires_at timestamptz not null default (now() + interval '14 days'),
  issued_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_client_id_idx on public.quotes (client_id);
create index if not exists quotes_status_idx on public.quotes (status);

alter table public.quotes enable row level security;

create policy "quotes_select_owner_or_admin" on public.quotes
  for select
  using (auth.uid() = client_id or public.is_admin());

create policy "quotes_insert_client" on public.quotes
  for insert
  with check (auth.uid() = client_id or public.is_admin());

create policy "quotes_update_admin_or_accept" on public.quotes
  for update
  using (auth.uid() = client_id or public.is_admin())
  with check (
    public.is_admin() or 
    (auth.uid() = client_id and status in ('accepted', 'declined'))
  );

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id text references public.services(id) on delete set null,
  title text not null,
  quantity int not null default 1,
  rate_snapshot_bdt numeric(12, 2) not null default 0,
  rate_snapshot_usd numeric(10, 2) not null default 0,
  config jsonb not null default '{}'::jsonb
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

alter table public.quote_items enable row level security;

create policy "quote_items_select" on public.quote_items
  for select
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and (q.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "quote_items_write_admin_or_client" on public.quote_items
  for all
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and (q.client_id = auth.uid() or public.is_admin())
    )
  );

-- 3. ORDERS, ORDER ITEMS & PAYMENTS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  currency text not null check (currency in ('BDT', 'USD')),
  amount numeric(14, 2) not null,
  amount_bdt numeric(14, 2) not null,
  amount_usd numeric(12, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'awaiting_payment', 'verifying', 'paid', 'failed', 'cancelled', 'refunded')),
  project_status text not null default 'awaiting_brief' check (project_status in ('awaiting_brief', 'brief_submitted', 'in_production', 'client_review', 'revision_requested', 'revision_in_progress', 'client_approved', 'completed', 'cancelled')),
  scope_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_client_id_idx on public.orders (client_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

alter table public.orders enable row level security;

create policy "orders_select_client_or_admin" on public.orders
  for select
  using (auth.uid() = client_id or public.is_admin());

create policy "orders_insert_client" on public.orders
  for insert
  with check (auth.uid() = client_id or public.is_admin());

create policy "orders_update_admin" on public.orders
  for update
  using (public.is_admin() or auth.uid() = client_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id text references public.services(id) on delete set null,
  title text not null,
  quantity int not null default 1,
  rate_bdt numeric(12, 2) not null,
  rate_usd numeric(10, 2) not null,
  config jsonb not null default '{}'::jsonb
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items_select" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_items_admin_write" on public.order_items
  for all
  using (public.is_admin());

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  gateway text not null check (gateway in ('sslcommerz', 'stripe', 'bank_transfer', 'sandbox')),
  transaction_ref text not null unique,
  amount numeric(14, 2) not null,
  currency text not null check (currency in ('BDT', 'USD')),
  channel text,
  verified boolean not null default false,
  verified_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_tx_ref_idx on public.payments (transaction_ref);

alter table public.payments enable row level security;

create policy "payments_select_client_or_admin" on public.payments
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "payments_admin_or_service_write" on public.payments
  for all
  using (public.is_admin());

-- 4. PROJECTS, BRIEFS, TASKS, ASSETS, ANNOTATIONS & APPROVALS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  assigned_pm_id uuid references public.profiles(id) on delete set null,
  assigned_designer_id uuid references public.profiles(id) on delete set null,
  title text not null,
  status text not null default 'awaiting_brief',
  revisions_used int not null default 0,
  max_revisions int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_order_id_idx on public.projects (order_id);

alter table public.projects enable row level security;

create policy "projects_select_client_or_staff" on public.projects
  for select
  using (
    auth.uid() = client_id or 
    auth.uid() = assigned_pm_id or 
    auth.uid() = assigned_designer_id or 
    public.is_admin()
  );

create policy "projects_write_admin_or_staff" on public.projects
  for all
  using (public.is_admin() or auth.uid() = assigned_pm_id);

create table if not exists public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
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

create index if not exists project_briefs_project_id_idx on public.project_briefs (project_id);

alter table public.project_briefs enable row level security;

create policy "project_briefs_select" on public.project_briefs
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin() or p.assigned_pm_id = auth.uid() or p.assigned_designer_id = auth.uid())
    )
  );

create policy "project_briefs_update_client" on public.project_briefs
  for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin())
    )
  );

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
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin() or p.assigned_pm_id = auth.uid() or p.assigned_designer_id = auth.uid())
    )
  );

create policy "project_tasks_admin_staff_write" on public.project_tasks
  for all
  using (public.is_admin());

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_label text not null default 'v1.0',
  file_name text not null,
  storage_path text not null,
  file_type text not null default 'image',
  file_size_bytes bigint not null default 0,
  is_approved boolean not null default false,
  is_final_deliverable boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_assets_project_id_idx on public.project_assets (project_id);

alter table public.project_assets enable row level security;

create policy "project_assets_select" on public.project_assets
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin() or p.assigned_pm_id = auth.uid() or p.assigned_designer_id = auth.uid())
    )
  );

create policy "project_assets_write_staff_admin" on public.project_assets
  for all
  using (public.is_admin());

create table if not exists public.asset_annotations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  coord_x_percent int not null check (coord_x_percent between 0 and 100),
  coord_y_percent int not null check (coord_y_percent between 0 and 100),
  feedback_text text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists asset_annotations_asset_id_idx on public.asset_annotations (asset_id);

alter table public.asset_annotations enable row level security;

create policy "asset_annotations_select" on public.asset_annotations
  for select
  using (
    exists (
      select 1 from public.project_assets a
      join public.projects p on p.id = a.project_id
      where a.id = asset_id and (p.client_id = auth.uid() or public.is_admin() or p.assigned_pm_id = auth.uid() or p.assigned_designer_id = auth.uid())
    )
  );

create policy "asset_annotations_insert" on public.asset_annotations
  for insert
  with check (auth.uid() = created_by or public.is_admin());

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid references public.project_assets(id) on delete set null,
  approved_by uuid not null references public.profiles(id) on delete cascade,
  legal_terms_accepted boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists approvals_project_id_idx on public.approvals (project_id);

alter table public.approvals enable row level security;

create policy "approvals_select" on public.approvals
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "approvals_insert_client" on public.approvals
  for insert
  with check (auth.uid() = approved_by or public.is_admin());

-- 5. AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  details text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "audit_logs_select_admin" on public.audit_logs
  for select
  using (public.is_admin());

create policy "audit_logs_insert_any" on public.audit_logs
  for insert
  with check (true);

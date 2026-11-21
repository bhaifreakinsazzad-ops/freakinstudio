-- Freakin's Studio — Creative Office OS 2.0
-- Migration 012: Durable Consultation Inquiries & Event-Sourced Project Workflow

-- 1. Durable Inquiries Table (replaces volatile in-memory Map and anonymous audit_logs hack)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  full_name text not null,
  work_email text not null,
  organization text default '',
  timeline text not null,
  discipline text not null,
  brief text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'converted', 'archived')),
  assigned_to uuid references public.profiles(id) on delete set null,
  source_ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inquiries_status_created on public.inquiries(status, created_at desc);

alter table public.inquiries enable row level security;

drop policy if exists "inquiries_admin_select" on public.inquiries;
create policy "inquiries_admin_select" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

-- 2. Extend projects, quotes, orders for complete Human + SI Production Office
alter table public.projects
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists deadline_at timestamptz,
  add column if not exists express_slot_confirmed boolean not null default false;

alter table public.quotes
  add column if not exists ratebook_version text not null default 'v2.0-pending-ratebook-v8_1',
  add column if not exists expires_at timestamptz;

alter table public.orders
  add column if not exists gateway text,
  add column if not exists gateway_tran_id text,
  add column if not exists ratebook_version text not null default 'v2.0-pending-ratebook-v8_1',
  add column if not exists promo_discount_bdt numeric not null default 0,
  add column if not exists promo_discount_usd numeric not null default 0;

-- 3. Immutable / Auditable Project Events Timeline (Human / SI Assistant / System / Client)
create table if not exists public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_kind text not null check (actor_kind in ('human_expert', 'si_assistant', 'system', 'client')),
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  state_before text,
  state_after text,
  artifact_id uuid references public.project_assets(id) on delete set null,
  si_status text check (si_status is null or si_status in ('suggested', 'scheduled', 'running', 'completed', 'human_approved', 'rejected')),
  visibility text not null default 'client' check (visibility in ('client', 'studio_internal')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_events_project_created on public.project_events(project_id, created_at desc);

alter table public.project_events enable row level security;

drop policy if exists "project_events_client_or_admin_select" on public.project_events;
create policy "project_events_client_or_admin_select" on public.project_events
  for select using (
    public.is_admin()
    or (
      visibility = 'client'
      and exists (
        select 1 from public.projects p
        where p.id = project_id and (p.client_id = auth.uid() or p.assigned_to = auth.uid())
      )
    )
  );

drop policy if exists "project_events_admin_insert" on public.project_events;
create policy "project_events_admin_insert" on public.project_events
  for insert with check (
    public.is_admin()
    or (
      actor_kind = 'client'
      and actor_id = auth.uid()
      and exists (
        select 1 from public.projects p
        where p.id = project_id and p.client_id = auth.uid()
      )
    )
  );

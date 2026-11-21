-- Freakin's Studio — Creative Office OS 2.0
-- Migration 013: AI Gateway Metering, Budget Kill Switch, Credit Ledger & AI Micro-Kit Orders

-- 1. Studio AI Gateway Configuration (singleton row)
create table if not exists public.ai_gateway_config (
  id text primary key default 'default',
  kill_switch_active boolean not null default false,
  daily_budget_cap_bdt numeric not null default 500 check (daily_budget_cap_bdt >= 0),
  guest_daily_quota int not null default 3 check (guest_daily_quota >= 0),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.ai_gateway_config (id, kill_switch_active, daily_budget_cap_bdt, guest_daily_quota)
values ('default', false, 500, 3)
on conflict (id) do nothing;

alter table public.ai_gateway_config enable row level security;

drop policy if exists "ai_gateway_config_admin_all" on public.ai_gateway_config;
create policy "ai_gateway_config_admin_all" on public.ai_gateway_config
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. AI Usage Metering Events
create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  session_id text not null,
  user_id uuid references public.profiles(id) on delete set null,
  assistant_id text not null,
  provider text not null check (provider in ('puter_sponsored', 'demo_template', 'blocked')),
  model text not null,
  status text not null check (status in ('completed', 'quota_blocked', 'budget_blocked', 'kill_switch_blocked', 'failed')),
  input_chars int not null default 0,
  output_chars int not null default 0,
  estimated_cost_bdt numeric not null default 0 check (estimated_cost_bdt >= 0),
  latency_ms int not null default 0,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_created on public.ai_usage_events(created_at desc);
create index if not exists idx_ai_usage_session_created on public.ai_usage_events(session_id, created_at desc);

alter table public.ai_usage_events enable row level security;

drop policy if exists "ai_usage_events_select_self_or_admin" on public.ai_usage_events;
create policy "ai_usage_events_select_self_or_admin" on public.ai_usage_events
  for select using (auth.uid() = user_id or public.is_admin());

-- 3. Immutable AI Credit Ledger
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_type text not null check (entry_type in ('purchase_mint', 'reservation_hold', 'settlement_commit', 'reservation_release', 'refund', 'promo_grant')),
  delta_credits int not null,
  reference_id text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_ledger_user on public.credit_ledger(user_id, created_at desc);

alter table public.credit_ledger enable row level security;

drop policy if exists "credit_ledger_select_self_or_admin" on public.credit_ledger;
create policy "credit_ledger_select_self_or_admin" on public.credit_ledger
  for select using (auth.uid() = user_id or public.is_admin());

-- 4. AI Micro-Product Orders (SKU-SHOP-49, SKU-CAMP-99, SKU-BRAND-199)
create table if not exists public.microkit_orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  sku text not null check (sku in ('SKU-SHOP-49', 'SKU-CAMP-99', 'SKU-BRAND-199')),
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  amount numeric not null check (amount > 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'fulfilled', 'failed', 'refunded')),
  gateway text,
  prompt_input text not null,
  artifact_payload jsonb,
  fulfilled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.microkit_orders enable row level security;

drop policy if exists "microkit_orders_select_self_or_admin" on public.microkit_orders;
create policy "microkit_orders_select_self_or_admin" on public.microkit_orders
  for select using (auth.uid() = user_id or public.is_admin());

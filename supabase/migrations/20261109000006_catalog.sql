-- Freakin's Studio — Foundation migration 6/8
-- Catalog: the 60 canonical services across 7 categories, plus add-ons.
-- Normalized per the legacy prototype's own embedded SQL draft shape
-- (docs/LEGACY_AUDIT.md §3-4), not the flat per-service label array the
-- prototype's UI actually used. IDs are preserved verbatim from the legacy
-- data (e.g. 'A01') rather than regenerated, so seed data stays traceable.

create table public.service_categories (
  id text primary key,         -- 'A'..'G', matching legacy category codes
  name text not null,
  name_bn text,
  sort_order int not null
);

create table public.services (
  id text primary key,         -- legacy service id, preserved verbatim (e.g. 'A01')
  category_id text not null references public.service_categories(id),
  title text not null,
  title_bn text,
  base_usd numeric(10, 2) not null,
  base_bdt numeric(12, 2) not null,
  days int not null,
  revisions int not null,
  pricing_status pricing_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_id_idx on public.services (category_id);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create table public.add_ons (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,       -- deduped family label from legacy per-service arrays
  unit_price_usd numeric(10, 2) not null default 25,
  unit_price_bdt numeric(12, 2) not null default 3000
);

create table public.service_add_ons (
  service_id text not null references public.services(id) on delete cascade,
  add_on_id uuid not null references public.add_ons(id) on delete cascade,
  primary key (service_id, add_on_id)
);

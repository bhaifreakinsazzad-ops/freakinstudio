-- Freakin's Studio — Foundation migration 4/8
-- organizations: a customer organization (agency client account). Created
-- by a profile, which becomes its first (owner) member in application code.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

alter table public.profiles
  add constraint profiles_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete set null;

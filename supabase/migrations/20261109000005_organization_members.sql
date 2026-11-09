-- Freakin's Studio — Foundation migration 5/8
-- organization_members: join table between profiles and organizations.
-- org_role is local to the organization ('owner' | 'member') and is
-- distinct from the global user_role enum on profiles.

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  org_role text not null default 'member' check (org_role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create index organization_members_profile_id_idx on public.organization_members (profile_id);

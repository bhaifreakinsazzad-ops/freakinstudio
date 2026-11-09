-- Freakin's Studio — Foundation migration 7/8
-- SECURITY DEFINER helper functions used by RLS policies. These must be
-- SECURITY DEFINER (and query profiles directly) to avoid infinite
-- recursion when a policy on `profiles` itself needs to check the caller's
-- role — a plain `in (select ... from profiles)` subquery inside a
-- profiles policy would otherwise re-trigger RLS on profiles.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('studio_admin', 'super_admin')
  );
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org_id and profile_id = auth.uid()
  );
$$;

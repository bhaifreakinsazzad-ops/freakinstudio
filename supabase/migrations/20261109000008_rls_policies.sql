-- Freakin's Studio — Foundation migration 8/8
-- Enable RLS on every Foundation-phase table and give every single one a
-- policy. This is the explicit fix for the legacy prototype's RLS gap
-- (docs/LEGACY_AUDIT.md §4: project_assets had RLS enabled with no policy,
-- which would silently deny all access) — no table in this schema is ever
-- left enabled-but-policy-less.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.add_ons enable row level security;
alter table public.service_add_ons enable row level security;

-- profiles: a user reads their own row (or an admin reads any row).
create policy "profiles_select_self_or_admin" on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

-- profiles: a user may update their own row, but the role column must stay
-- unchanged — role changes are an out-of-band admin action only (admins
-- bypass this via the separate admin-update policy below, or via the
-- service-role key in scripts/).
create policy "profiles_update_self_no_role_escalation" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

create policy "profiles_admin_update_any" on public.profiles
  for update
  using (public.is_admin());

-- organizations: members (or admins) can read; only the creator can insert
-- their own org; only an owner-role member can update it.
create policy "organizations_select_member_or_admin" on public.organizations
  for select
  using (public.is_org_member(id) or public.is_admin());

create policy "organizations_insert_as_creator" on public.organizations
  for insert
  with check (auth.uid() = created_by);

create policy "organizations_update_owner" on public.organizations
  for update
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = id and m.profile_id = auth.uid() and m.org_role = 'owner'
    )
  );

-- organization_members: members of the same org (or admins) can read the
-- roster. An owner can add members; a user can also insert themselves
-- (covers the org-creation flow where the creator joins as 'owner').
create policy "organization_members_select_same_org" on public.organization_members
  for select
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "organization_members_insert_owner_or_self" on public.organization_members
  for insert
  with check (
    auth.uid() = profile_id
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_id and m.profile_id = auth.uid() and m.org_role = 'owner'
    )
  );

-- Catalog: public read (unauthenticated browsing is a later-phase feature,
-- but the schema allows it from day one); writes restricted to admins.
create policy "service_categories_public_select" on public.service_categories
  for select using (true);
create policy "service_categories_admin_write" on public.service_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "services_public_select" on public.services
  for select using (true);
create policy "services_admin_write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "add_ons_public_select" on public.add_ons
  for select using (true);
create policy "add_ons_admin_write" on public.add_ons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "service_add_ons_public_select" on public.service_add_ons
  for select using (true);
create policy "service_add_ons_admin_write" on public.service_add_ons
  for all using (public.is_admin()) with check (public.is_admin());

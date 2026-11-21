-- Freakin's Studio — Creative Office OS 2.0
-- Migration 011: Non-destructive Canonical 4/13/15/5/14 Catalog & Ratebook Crosswalk
-- Preserves all historical A01..G07 rows and existing foreign keys.

-- 1. Extend service_categories and services non-destructively
alter table public.service_categories
  add column if not exists code text,
  add column if not exists name_bn text,
  add column if not exists description text;

alter table public.services
  add column if not exists code text,
  add column if not exists estimated_hours numeric not null default 4,
  add column if not exists express_eligible boolean not null default false,
  add column if not exists express_rule text,
  add column if not exists summary text,
  add column if not exists included jsonb not null default '[]'::jsonb,
  add column if not exists excluded jsonb not null default '[]'::jsonb,
  add column if not exists formats jsonb not null default '[]'::jsonb,
  add column if not exists ratebook_version text not null default 'v2.0-pending-ratebook-v8_1',
  add column if not exists ratebook_approved boolean not null default false;

alter table public.add_ons
  add column if not exists code text,
  add column if not exists label_bn text,
  add column if not exists extra_hours numeric not null default 1,
  add column if not exists summary text;

-- 2. Scoped Variants (VAR-01..VAR-15)
create table if not exists public.service_variants (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  title text not null,
  title_bn text,
  scope_summary text not null,
  estimated_hours numeric not null check (estimated_hours > 0),
  hour_multiplier numeric not null check (hour_multiplier > 0),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Commercial Bundles (BND-01..BND-05)
create table if not exists public.commercial_bundles (
  id text primary key,
  title text not null,
  title_bn text,
  included_service_ids text[] not null,
  estimated_hours numeric not null check (estimated_hours > 0),
  turnaround_days text not null,
  revisions int not null default 2,
  summary text not null,
  deliverables jsonb not null default '[]'::jsonb,
  base_bdt numeric not null default 0,
  base_usd numeric not null default 0,
  pricing_status public.pricing_status not null default 'quote_required',
  ratebook_version text not null default 'v2.0-pending-ratebook-v8_1',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Legacy Catalog Crosswalk (preserves A01..G07 orders/quotes without deletion)
create table if not exists public.legacy_service_map (
  legacy_service_id text primary key references public.services(id) on delete cascade,
  canonical_service_id text not null references public.services(id) on delete cascade,
  disposition text not null check (disposition in ('mapped', 'retired_from_public_storefront')),
  notes text,
  created_at timestamptz not null default now()
);

-- 5. Enable RLS & define policies for new catalog tables
alter table public.service_variants enable row level security;
alter table public.commercial_bundles enable row level security;
alter table public.legacy_service_map enable row level security;

drop policy if exists "service_variants_public_select" on public.service_variants;
create policy "service_variants_public_select" on public.service_variants
  for select using (true);
drop policy if exists "service_variants_admin_write" on public.service_variants;
create policy "service_variants_admin_write" on public.service_variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "commercial_bundles_public_select" on public.commercial_bundles;
create policy "commercial_bundles_public_select" on public.commercial_bundles
  for select using (true);
drop policy if exists "commercial_bundles_admin_write" on public.commercial_bundles;
create policy "commercial_bundles_admin_write" on public.commercial_bundles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "legacy_service_map_public_select" on public.legacy_service_map;
create policy "legacy_service_map_public_select" on public.legacy_service_map
  for select using (true);
drop policy if exists "legacy_service_map_admin_write" on public.legacy_service_map;
create policy "legacy_service_map_admin_write" on public.legacy_service_map
  for all using (public.is_admin()) with check (public.is_admin());

-- 6. Mark any legacy A..G / A01..G07 rows inactive on public storefront without deleting them
update public.service_categories
set active = false
where id not in ('DISC-01', 'DISC-02', 'DISC-03', 'DISC-04');

update public.services
set active = false
where id not like 'SRV-%';

-- 7. Upsert Canonical 4 Disciplines
insert into public.service_categories (id, code, name, name_bn, description, sort_order, active) values
  ('DISC-01', '01', 'Brand & Visual Identity', 'ব্র্যান্ড ও ভিজ্যুয়াল আইডেন্টিটি', 'Logo systems, brand refresh, visual guidelines, and stationery lockups.', 1, true),
  ('DISC-02', '02', 'Social Media & Campaign Creative', 'সোশ্যাল মিডিয়া ও ক্যাম্পেইন ক্রিয়েটিভ', 'Social post graphics, carousel storytelling, performance ad creatives, and profile branding kits.', 2, true),
  ('DISC-03', '03', 'Commercial Graphic & Print Design', 'কমার্শিয়াল গ্রাফিক ও প্রিন্ট ডিজাইন', 'Posters, flyers, brochures, packaging dielines, labels, and executive presentation decks.', 3, true),
  ('DISC-04', '04', 'Motion, Reels & Short-Form Video', 'মোশন, রিলস ও শর্ট-ফর্ম ভিডিও', 'Reels/Shorts editing, animated social ads, logo intros, and kinetic promo graphics.', 4, true)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  name_bn = excluded.name_bn,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true;

-- 8. Upsert Canonical 13 Services (Gated to 'quote_required' until Owner Ratebook v8/v8.1 import)
insert into public.services (
  id, code, category_id, title, title_bn, base_bdt, base_usd, estimated_hours, days, revisions,
  pricing_status, express_eligible, express_rule, summary, ratebook_version, ratebook_approved, active
) values
  ('SRV-01', 'SRV-01', 'DISC-01', 'Logo Design & Mark Creation', 'লোগো ডিজাইন ও মার্ক তৈরি', 9000, 90, 6, 3, 2, 'quote_required', false, null, 'Bespoke geometric monogram and primary brand mark engineered for scalability.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-02', 'SRV-02', 'DISC-01', 'Logo Redesign / Vector Cleanup', 'লোগো রিডিজাইন ও ভেক্টর ক্লিনআপ', 3000, 30, 2, 1, 2, 'quote_required', true, '10-Min Express eligible ONLY for single-file vector trace/color fix with ready source file and confirmed desk slot.', 'Precision vectorization and format rescue for existing marks.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-03', 'SRV-03', 'DISC-01', 'Brand Identity Starter System', 'ব্র্যান্ড আইডেন্টিটি স্টার্টার সিস্টেম', 15000, 150, 10, 5, 2, 'quote_required', false, null, 'Foundational visual identity system uniting logomark, palette, and typography.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-04', 'SRV-04', 'DISC-01', 'Business Card & Stationery Suite', 'বিজনেস কার্ড ও স্টেশনারি সুইট', 4500, 45, 3, 2, 2, 'quote_required', false, null, 'Print-ready corporate stationery and card layouts.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-05', 'SRV-05', 'DISC-02', 'Social Media Single Post Creative', 'সোশ্যাল মিডিয়া সিঙ্গেল পোস্ট ক্রিয়েটিভ', 3000, 30, 2, 1, 2, 'quote_required', true, '10-Min Express eligible ONLY for text/price swap or crop adaptation on existing studio file with confirmed desk slot.', 'High-contrast single-frame social graphic.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-06', 'SRV-06', 'DISC-02', 'Carousel & Story Design Set', 'ক্যারোসেল ও স্টোরি ডিজাইন সেট', 6000, 60, 4, 2, 2, 'quote_required', false, null, 'Seamless multi-slide narrative carousels.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-07', 'SRV-07', 'DISC-02', 'Paid Ad Creative Variations', 'পেইড অ্যাড ক্রিয়েটিভ ভ্যারিয়েশন', 7500, 75, 5, 2, 2, 'quote_required', false, null, 'Performance-engineered static ad variations.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-08', 'SRV-08', 'DISC-02', 'Social Channel Banner & Profile Kit', 'সোশ্যাল চ্যানেল ব্যানার ও প্রোফাইল কিট', 4500, 45, 3, 2, 2, 'quote_required', false, null, 'Cohesive multi-platform header and avatar system.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-09', 'SRV-09', 'DISC-03', 'Poster, Flyer & Print Collateral', 'পোস্টার, ফ্লায়ার ও প্রিন্ট ডিজাইন', 4500, 45, 3, 2, 2, 'quote_required', false, null, 'Editorial-grade promotional posters and flyers.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-10', 'SRV-10', 'DISC-03', 'Packaging & Label Design', 'প্যাকেজিং ও লেবেল ডিজাইন', 10500, 105, 7, 4, 2, 'quote_required', false, null, 'Product labels, pouches, and rigid box graphics with dielines.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-11', 'SRV-11', 'DISC-03', 'Presentation & Pitch Deck Design', 'প্রেজেন্টেশন ও পিচ ডেক ডিজাইন', 12000, 120, 8, 4, 2, 'quote_required', false, null, 'Executive investor pitch decks and presentations.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-12', 'SRV-12', 'DISC-04', 'Short-Form Video / Reel Edit', 'শর্ট-ফর্ম ভিডিও / রিল এডিট', 7500, 75, 5, 3, 2, 'quote_required', false, null, 'High-retention vertical video editing for Reels/Shorts.', 'v2.0-pending-ratebook-v8_1', false, true),
  ('SRV-13', 'SRV-13', 'DISC-04', 'Motion Graphic Ad & Logo Animation', 'মোশন গ্রাফিক অ্যাড ও লোগো অ্যানিমেশন', 9000, 90, 6, 3, 2, 'quote_required', true, '10-Min Express eligible ONLY for end-slate text/CTA update on existing studio motion project with confirmed desk slot.', 'Kinetic logo reveals and animated ad loops.', 'v2.0-pending-ratebook-v8_1', false, true)
on conflict (id) do update set
  code = excluded.code,
  category_id = excluded.category_id,
  title = excluded.title,
  title_bn = excluded.title_bn,
  estimated_hours = excluded.estimated_hours,
  days = excluded.days,
  revisions = excluded.revisions,
  express_eligible = excluded.express_eligible,
  express_rule = excluded.express_rule,
  summary = excluded.summary,
  active = true;

-- 9. Upsert Canonical 15 Variants
insert into public.service_variants (id, service_id, title, title_bn, scope_summary, estimated_hours, hour_multiplier, sort_order) values
  ('VAR-01', 'SRV-01', 'Single Concept Wordmark', 'সিঙ্গেল কনসেপ্ট ওয়ার্ডমার্ক', '1 focused direction + vector lockups', 4, 0.75, 1),
  ('VAR-02', 'SRV-01', 'Dual Concept Mark + Monogram', 'ডুয়াল কনসেপ্ট মার্ক + মনোগ্রাম', '2 concepts + custom FS-grade monogram', 6, 1.0, 2),
  ('VAR-03', 'SRV-02', '10-Min Express Micro Vector Fix', '১০-মিনিট এক্সপ্রেস ভেক্টর ফিক্স', 'Pre-checked single file color/path tweak', 1, 0.5, 3),
  ('VAR-04', 'SRV-03', 'Core Identity Sheet (6 Pages)', 'কোর আইডেন্টিটি শিট (৬ পেজ)', 'Logo, palette, typography & clearspace', 10, 1.0, 4),
  ('VAR-05', 'SRV-03', 'Extended Identity Book (12 Pages)', 'এক্সটেন্ডেড আইডেন্টিটি বুক (১২ পেজ)', 'Includes social grids, tone & mockups', 14, 1.4, 5),
  ('VAR-06', 'SRV-04', 'Card + Letterhead Duo', 'কার্ড + লেটারহেড ডুয়ো', '2 core corporate print items', 3, 1.0, 6),
  ('VAR-07', 'SRV-05', 'Single Platform Post (1:1 or 4:5)', 'সিঙ্গেল প্ল্যাটফর্ম পোস্ট', '1 static high-impact visual', 2, 1.0, 7),
  ('VAR-08', 'SRV-06', '6-Slide Carousel Set', '৬-স্লাইড ক্যারোসেল সেট', 'Seamless storytelling swipe deck', 4, 1.0, 8),
  ('VAR-09', 'SRV-06', '10-Slide Authority Carousel', '১০-স্লাইড অথরিটি ক্যারোসেল', 'Deep-dive educational/product swipe deck', 6, 1.5, 9),
  ('VAR-10', 'SRV-07', '3-Hook Ad Test Pack', '৩-হুক অ্যাড টেস্ট প্যাক', '3 distinct headline/visual ad angles', 5, 1.0, 10),
  ('VAR-11', 'SRV-09', 'Single-Sided Poster / Flyer', 'সিঙ্গেল-সাইডেড পোস্টার / ফ্লায়ার', 'A3/A4/A5 pre-press layout', 3, 1.0, 11),
  ('VAR-12', 'SRV-10', 'Flat Pouch / Bottle Label', 'ফ্ল্যাট পাউচ / বোতল লেবেল', 'Single SKU wrap label + 3D preview', 7, 1.0, 12),
  ('VAR-13', 'SRV-10', 'Rigid Box Full Dieline + Foil Spec', 'রিজিড বক্স ডাইলাইন + ফয়েল স্পেক', 'Outer box + UV/foil separation layers', 10, 1.4, 13),
  ('VAR-14', 'SRV-11', '12-Slide Executive Deck', '১২-স্লাইড এক্সিকিউটিভ ডেক', 'Core pitch narrative & chart polish', 8, 1.0, 14),
  ('VAR-15', 'SRV-12', 'Up to 60s Vertical Reel Edit', '৬০ সেকেন্ড পর্যন্ত রিল এডিট', 'Paced cuts, captions & audio mastering', 5, 1.0, 15)
on conflict (id) do update set
  service_id = excluded.service_id,
  title = excluded.title,
  title_bn = excluded.title_bn,
  scope_summary = excluded.scope_summary,
  estimated_hours = excluded.estimated_hours,
  hour_multiplier = excluded.hour_multiplier,
  sort_order = excluded.sort_order,
  active = true;

-- 10. Upsert Canonical 5 Bundles
insert into public.commercial_bundles (id, title, title_bn, included_service_ids, estimated_hours, turnaround_days, revisions, summary, base_bdt, base_usd, pricing_status) values
  ('BND-01', 'Brand Launch Starter Pack', 'ব্র্যান্ড লঞ্চ স্টার্টার প্যাক', array['SRV-01','SRV-04','SRV-08'], 11, '5–6 Days', 2, 'Complete day-one identity foundation: custom logomark, executive stationery, and multi-channel social profile kit.', 16500, 165, 'quote_required'),
  ('BND-02', 'Social Growth Monthly Pulse', 'সোশ্যাল গ্রোথ মান্থলি পালস', array['SRV-05','SRV-06','SRV-12'], 16, '7–10 Days', 2, 'Consistent social authority package combining 4 single posts, 2 carousels, and 2 short-form Reels.', 24000, 240, 'quote_required'),
  ('BND-03', 'Performance Ad Campaign Pod', 'পারফরম্যান্স অ্যাড ক্যাম্পেইন পড', array['SRV-07','SRV-13'], 11, '4–5 Days', 2, 'Built for media buyers: 3 static A/B hook creatives paired with 1 motion graphic ad loop.', 16500, 165, 'quote_required'),
  ('BND-04', 'Retail Packaging & Shelf Suite', 'রিটেইল প্যাকেজিং ও শেলফ সুইট', array['SRV-03','SRV-10','SRV-09'], 18, '7–9 Days', 2, 'Physical commerce flagship combining starter brand identity, packaging dieline, and retail POS flyer.', 27000, 270, 'quote_required'),
  ('BND-05', 'Founder Pitch & Fundraising Kit', 'ফাউন্ডার পিচ ও ফান্ডরেইজিং কিট', array['SRV-03','SRV-11'], 16, '6–8 Days', 2, 'Investor-ready narrative pairing a brand identity sheet with a 12-slide pitch deck.', 24000, 240, 'quote_required')
on conflict (id) do update set
  title = excluded.title,
  title_bn = excluded.title_bn,
  included_service_ids = excluded.included_service_ids,
  estimated_hours = excluded.estimated_hours,
  turnaround_days = excluded.turnaround_days,
  revisions = excluded.revisions,
  summary = excluded.summary,
  active = true;

-- 11. Upsert Canonical 14 Add-ons
insert into public.add_ons (id, code, label, label_bn, unit_price_bdt, unit_price_usd, extra_hours, summary, active) values
  ('ADD-01', 'ADD-01', 'Editable Open Source Files (AI / PSD / FIG)', 'এডিটেবল সোর্স ফাইল (AI / PSD / FIG)', 3000, 30, 2, 'Packaged working layers with organized artboards.', true),
  ('ADD-02', 'ADD-02', 'Extra Aspect Ratio Adaptation (9:16 / 16:9 / 1:1)', 'অতিরিক্ত অ্যাসপেক্ট রেশিও অ্যাডাপ্টেশন', 1500, 15, 1, 'Re-layout of approved master into an additional platform dimension.', true),
  ('ADD-03', 'ADD-03', 'Bilingual Copy Layout (Bangla + English)', 'দ্বিভাষিক কপি লেআউট (বাংলা + ইংরেজি)', 1500, 15, 1, 'Dual-language typographic pairing for local & global audiences.', true),
  ('ADD-04', 'ADD-04', 'Additional Consolidated Revision Round (+1)', 'অতিরিক্ত রিভিশন রাউন্ড (+১)', 2250, 22.5, 1.5, 'Extends standard 2-revision policy by 1 structured feedback cycle.', true),
  ('ADD-05', 'ADD-05', 'Print Pre-Press Foil & Spot-UV Separation', 'প্রিন্ট ফয়েল ও স্পট-ইউভি সেপারেশন', 2250, 22.5, 1.5, 'Dedicated vector spot plates for metallic foil and embossing.', true),
  ('ADD-06', 'ADD-06', '3D Studio Mockup Render Pack (3 Angles)', 'থ্রিডি স্টুডিও মকআপ রেন্ডার প্যাক', 3000, 30, 2, 'High-resolution hero renders for e-commerce and launch PR.', true),
  ('ADD-07', 'ADD-07', 'Animated Subtitles & SRT Caption File', 'অ্যানিমেটেড সাবটাইটেল ও SRT ফাইল', 1500, 15, 1, 'Burned-in kinetic captions plus clean SRT sidecar file.', true),
  ('ADD-08', 'ADD-08', 'Custom Thumbnail & Cover Frame', 'কাস্টম থাম্বনেইল ও কভার ফ্রেম', 1500, 15, 1, 'High-CTR static cover frame matched to video aesthetic.', true),
  ('ADD-09', 'ADD-09', 'Extra 4 Presentation Slides', 'অতিরিক্ত ৪টি প্রেজেন্টেশন স্লাইড', 3750, 37.5, 2.5, 'Expands 12-slide base deck with 4 additional bespoke slides.', true),
  ('ADD-10', 'ADD-10', 'Extra 2 Carousel Slides', 'অতিরিক্ত ২টি ক্যারোসেল স্লাইড', 1500, 15, 1, 'Extends carousel story depth with 2 additional seamless frames.', true),
  ('ADD-11', 'ADD-11', 'Social Post Caption & Hashtag Matrix', 'সোশ্যাল ক্যাপশন ও হ্যাশট্যাগ ম্যাট্রিক্স', 1500, 15, 1, 'Human-edited conversion copy and CTA hooks for your visual.', true),
  ('ADD-12', 'ADD-12', 'SKU Flavor / Colorway Variant Adaptation', 'এসকেইউ ফ্লেভার / কালারওয়ে ভ্যারিয়েন্ট', 3000, 30, 2, 'Adapts master packaging dieline to a second product flavor/scent.', true),
  ('ADD-13', 'ADD-13', 'Brand Color Accessibility & WCAG Audit Sheet', 'ব্র্যান্ড কালার অ্যাক্সেসিবিলিটি ও WCAG শিট', 2250, 22.5, 1.5, 'Contrast matrix verifying AA/AAA digital legibility.', true),
  ('ADD-14', 'ADD-14', 'Priority Same-Day Studio Slot (Subject to Confirmation)', 'প্রায়োরিটি সেম-ডে স্টুডিও স্লট (কনফার্মেশন সাপেক্ষে)', 3000, 30, 2, 'Reserves dedicated evening/same-day queue after studio slot verification.', true)
on conflict (id) do update set
  code = excluded.code,
  label = excluded.label,
  label_bn = excluded.label_bn,
  extra_hours = excluded.extra_hours,
  summary = excluded.summary,
  active = true;

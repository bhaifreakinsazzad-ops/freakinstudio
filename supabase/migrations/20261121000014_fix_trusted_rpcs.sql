-- Freakin's Studio — Creative Office OS 2.0
-- Migration 014: Reconcile Trusted Financial RPCs (Variants, Add-ons, Bundles, 5% Promo, Quote Acceptance & Approvals)
-- Compatible 100% with Migration 009 & 010 tables, CHECK constraints, and security grants.

-- 1. Drop legacy conflicting function signatures safely before re-creating
drop function if exists public.create_quotation_request(uuid, text, jsonb, jsonb, text);
drop function if exists public.create_quotation_request(uuid, text, jsonb, jsonb);
drop function if exists public.create_quotation_request(uuid, text, jsonb, jsonb, boolean, text);

create or replace function public.create_quotation_request(
  p_client_id uuid,
  p_currency text,
  p_scope jsonb,
  p_items jsonb,
  p_terms_accepted boolean default true,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_quote_id uuid;
  v_quote_ref text;
  v_total_bdt numeric := 0;
  v_total_usd numeric := 0;
  v_item jsonb;
  v_srv record;
  v_var record;
  v_addon record;
  v_addon_id text;
  v_qty int;
  v_mult numeric;
  v_line_bdt numeric;
  v_line_usd numeric;
  v_addons_bdt numeric;
  v_addons_usd numeric;
  v_now timestamptz := now();
  v_promo_active boolean := false;
  v_discount_bdt numeric := 0;
  v_discount_usd numeric := 0;
  v_all_approved boolean := true;
begin
  v_caller := auth.uid();
  if v_caller is null or (v_caller <> p_client_id and not public.is_admin()) then
    raise exception 'Unauthorized: Caller must match authenticated client';
  end if;

  if p_currency not in ('BDT', 'USD') then
    raise exception 'Invalid currency %', p_currency;
  end if;

  if coalesce(p_terms_accepted, false) = false then
    raise exception 'Terms must be accepted before submitting a quotation request';
  end if;

  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Quotation request requires at least one catalog service';
  end if;

  v_quote_ref := 'FS-QT-' || to_char(v_now, 'YYYY') || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

  insert into public.quotes (
    client_id, quote_ref, currency, amount_bdt, amount_usd, status, pricing_mode,
    revisions_included, scope_snapshot, notes, ratebook_version, expires_at
  ) values (
    p_client_id,
    v_quote_ref,
    p_currency,
    0,
    0,
    'pending',
    'manual',
    2,
    coalesce(p_scope, '{}'::jsonb),
    p_notes,
    'v2.0-pending-ratebook-v8_1',
    v_now + interval '14 days'
  ) returning id into v_quote_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_srv from public.services where id = (v_item->>'service_id');
    if not found then
      raise exception 'Invalid catalog service_id: %', (v_item->>'service_id');
    end if;

    if v_srv.pricing_status <> 'approved' or not coalesce(v_srv.ratebook_approved, false) then
      v_all_approved := false;
    end if;

    v_qty := greatest(1, least(100, coalesce((v_item->>'quantity')::int, 1)));
    v_mult := 1.0;

    if (v_item->'config'->>'variantId') is not null then
      select * into v_var
      from public.service_variants
      where id = (v_item->'config'->>'variantId')
        and service_id = v_srv.id;
      if found then
        v_mult := v_var.hour_multiplier;
      end if;
    end if;

    v_line_bdt := round((v_srv.base_bdt * v_mult) * v_qty);
    v_line_usd := round((v_srv.base_usd * v_mult) * v_qty);
    v_addons_bdt := 0;
    v_addons_usd := 0;

    if jsonb_typeof(v_item->'addOnIds') = 'array' then
      for v_addon_id in select jsonb_array_elements_text(v_item->'addOnIds')
      loop
        select * into v_addon from public.add_ons where id = v_addon_id and active = true;
        if found then
          v_addons_bdt := v_addons_bdt + v_addon.unit_price_bdt;
          v_addons_usd := v_addons_usd + v_addon.unit_price_usd;
        end if;
      end loop;
    end if;

    v_total_bdt := v_total_bdt + v_line_bdt + v_addons_bdt;
    v_total_usd := v_total_usd + v_line_usd + v_addons_usd;

    insert into public.quote_items (
      quote_id, service_id, title, quantity,
      unit_rate_bdt, unit_rate_usd,
      add_ons_total_bdt, add_ons_total_usd,
      line_total_bdt, line_total_usd,
      price_approved, config
    ) values (
      v_quote_id,
      v_srv.id,
      coalesce(v_item->>'title', v_srv.title),
      v_qty,
      round(v_srv.base_bdt * v_mult),
      round(v_srv.base_usd * v_mult),
      v_addons_bdt,
      v_addons_usd,
      v_line_bdt + v_addons_bdt,
      v_line_usd + v_addons_usd,
      (v_srv.pricing_status = 'approved' and coalesce(v_srv.ratebook_approved, false)),
      jsonb_build_object(
        'serviceConfig', coalesce(v_item->'config', '{}'::jsonb),
        'addOnIds', coalesce(v_item->'addOnIds', '[]'::jsonb)
      )
    );
  end loop;

  -- Server-clock 5% Launch Promo (20 Nov – 15 Dec 2026 Asia/Dhaka)
  v_promo_active := v_now >= '2026-11-20T00:00:00+06:00'::timestamptz
                    and v_now <= '2026-12-15T23:59:59+06:00'::timestamptz;
  if v_promo_active then
    v_discount_bdt := round(v_total_bdt * 0.05);
    v_discount_usd := round(v_total_usd * 0.05);
    v_total_bdt := greatest(0, v_total_bdt - v_discount_bdt);
    v_total_usd := greatest(0, v_total_usd - v_discount_usd);
  end if;

  update public.quotes
  set
    amount_bdt = v_total_bdt,
    amount_usd = v_total_usd,
    pricing_mode = case when v_all_approved then 'priced' else 'manual' end,
    updated_at = v_now
  where id = v_quote_id;

  insert into public.audit_logs (event_type, details, actor_id, metadata)
  values (
    'QUOTE_REQUESTED',
    format('Quotation request %s created (%s %s)', v_quote_ref, p_currency, case when p_currency = 'USD' then v_total_usd else v_total_bdt end),
    p_client_id,
    jsonb_build_object('quote_id', v_quote_id, 'quote_ref', v_quote_ref, 'currency', p_currency, 'promo_active', v_promo_active)
  );

  return jsonb_build_object(
    'ok', true,
    'quote_id', v_quote_id,
    'quote_ref', v_quote_ref,
    'amount_bdt', v_total_bdt,
    'amount_usd', v_total_usd,
    'promo_active', v_promo_active
  );
end;
$$;

revoke all on function public.create_quotation_request from public, anon;
grant execute on function public.create_quotation_request to authenticated, service_role;

-- 2. Reconcile create_pending_order (supports direct approved items OR formal issued quote acceptance)
drop function if exists public.create_pending_order(uuid, uuid, text, text, jsonb, jsonb, boolean);
drop function if exists public.create_pending_order(uuid, uuid, text, text, jsonb, jsonb, boolean, text);

create or replace function public.create_pending_order(
  p_client_id uuid,
  p_quote_id uuid,
  p_order_ref text,
  p_currency text,
  p_scope jsonb,
  p_items jsonb,
  p_is_test boolean default false,
  p_gateway text default 'sslcommerz'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_order_id uuid;
  v_total_bdt numeric := 0;
  v_total_usd numeric := 0;
  v_final_amount numeric := 0;
  v_quote record;
  v_item jsonb;
  v_srv record;
  v_var record;
  v_addon record;
  v_addon_id text;
  v_qty int;
  v_mult numeric;
  v_line_bdt numeric;
  v_line_usd numeric;
  v_addons_bdt numeric;
  v_addons_usd numeric;
  v_now timestamptz := now();
  v_promo_active boolean := false;
  v_discount_bdt numeric := 0;
  v_discount_usd numeric := 0;
  v_resolved_scope jsonb := coalesce(p_scope, '{}'::jsonb);
  v_resolved_currency text := case when p_currency = 'USD' then 'USD' else 'BDT' end;
  v_revisions int := 2;
begin
  v_caller := auth.uid();
  if v_caller is null or (v_caller <> p_client_id and not public.is_admin()) then
    raise exception 'Unauthorized: Caller must match authenticated client';
  end if;

  if p_currency not in ('BDT', 'USD') then
    raise exception 'Invalid currency %', p_currency;
  end if;

  if p_quote_id is not null then
    select * into v_quote from public.quotes where id = p_quote_id and client_id = p_client_id for update;
    if not found then
      raise exception 'Quotation not found or belongs to another account';
    end if;
    if v_quote.status not in ('issued', 'accepted') then
      raise exception 'Quotation must be in issued state before acceptance (current: %)', v_quote.status;
    end if;
    if v_quote.expires_at is not null and v_quote.expires_at < v_now then
      update public.quotes set status = 'expired', updated_at = v_now where id = p_quote_id;
      raise exception 'Quotation has expired; please request an updated studio quote';
    end if;

    v_total_bdt := coalesce(v_quote.amount_bdt, 0);
    v_total_usd := coalesce(v_quote.amount_usd, 0);
    if v_total_bdt <= 0 or v_total_usd <= 0 then
      raise exception 'Issued quotation has invalid zero monetary total';
    end if;
    v_resolved_scope := coalesce(v_quote.scope_snapshot, v_resolved_scope);
    v_revisions := coalesce(v_quote.revisions_included, 2);

    update public.quotes
    set status = 'accepted', accepted_at = coalesce(accepted_at, v_now), updated_at = v_now
    where id = p_quote_id;
  else
    if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
      raise exception 'Order creation requires at least one approved service or an issued quote';
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      select * into v_srv from public.services where id = (v_item->>'service_id');
      if not found then
        raise exception 'Invalid service_id: %', (v_item->>'service_id');
      end if;
      if v_srv.pricing_status = 'quote_required' or not coalesce(v_srv.ratebook_approved, false) then
        raise exception 'Service % (%) requires formal studio quotation before checkout', v_srv.title, v_srv.id;
      end if;

      v_qty := greatest(1, least(100, coalesce((v_item->>'quantity')::int, 1)));
      v_mult := 1.0;

      if (v_item->'config'->>'variantId') is not null then
        select * into v_var
        from public.service_variants
        where id = (v_item->'config'->>'variantId')
          and service_id = v_srv.id;
        if found then
          v_mult := v_var.hour_multiplier;
        end if;
      end if;

      v_line_bdt := round((v_srv.base_bdt * v_mult) * v_qty);
      v_line_usd := round((v_srv.base_usd * v_mult) * v_qty);
      v_addons_bdt := 0;
      v_addons_usd := 0;

      if jsonb_typeof(v_item->'addOnIds') = 'array' then
        for v_addon_id in select jsonb_array_elements_text(v_item->'addOnIds')
        loop
          select * into v_addon from public.add_ons where id = v_addon_id and active = true;
          if found then
            v_addons_bdt := v_addons_bdt + v_addon.unit_price_bdt;
            v_addons_usd := v_addons_usd + v_addon.unit_price_usd;
          end if;
        end loop;
      end if;

      v_total_bdt := v_total_bdt + v_line_bdt + v_addons_bdt;
      v_total_usd := v_total_usd + v_line_usd + v_addons_usd;
    end loop;

    v_promo_active := v_now >= '2026-11-20T00:00:00+06:00'::timestamptz
                      and v_now <= '2026-12-15T23:59:59+06:00'::timestamptz;
    if v_promo_active then
      v_discount_bdt := round(v_total_bdt * 0.05);
      v_discount_usd := round(v_total_usd * 0.05);
      v_total_bdt := greatest(0, v_total_bdt - v_discount_bdt);
      v_total_usd := greatest(0, v_total_usd - v_discount_usd);
    end if;
  end if;

  v_final_amount := case when v_resolved_currency = 'USD' then v_total_usd else v_total_bdt end;
  if v_final_amount <= 0 then
    raise exception 'Order payable amount must be positive';
  end if;

  insert into public.orders (
    order_ref, client_id, quote_id, currency, amount, amount_bdt, amount_usd,
    payment_status, gateway, revisions_included, scope_snapshot, is_test, promo_discount_bdt, promo_discount_usd
  ) values (
    p_order_ref, p_client_id, p_quote_id, v_resolved_currency, v_final_amount, v_total_bdt, v_total_usd,
    'awaiting_payment', p_gateway, v_revisions, v_resolved_scope, p_is_test, v_discount_bdt, v_discount_usd
  ) returning id into v_order_id;

  if p_items is not null and jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_qty := greatest(1, least(100, coalesce((v_item->>'quantity')::int, 1)));
      select * into v_srv from public.services where id = (v_item->>'service_id');
      if found then
        insert into public.order_items (
          order_id, service_id, title, quantity, unit_rate_bdt, unit_rate_usd, line_total_bdt, line_total_usd, config
        ) values (
          v_order_id, v_srv.id, coalesce(v_item->>'title', v_srv.title), v_qty,
          v_srv.base_bdt, v_srv.base_usd, v_srv.base_bdt * v_qty, v_srv.base_usd * v_qty,
          coalesce(v_item->'config', '{}'::jsonb)
        );
      end if;
    end loop;
  end if;

  insert into public.audit_logs (event_type, details, actor_id, metadata)
  values (
    'ORDER_CREATED',
    format('Pending order %s created (%s %s via %s)', p_order_ref, v_resolved_currency, v_final_amount, p_gateway),
    p_client_id,
    jsonb_build_object('order_id', v_order_id, 'order_ref', p_order_ref, 'amount', v_final_amount, 'currency', v_resolved_currency, 'gateway', p_gateway)
  );

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'order_ref', p_order_ref,
    'amount', v_final_amount,
    'amount_bdt', v_total_bdt,
    'amount_usd', v_total_usd,
    'currency', v_resolved_currency
  );
end;
$$;

revoke all on function public.create_pending_order from public, anon;
grant execute on function public.create_pending_order to authenticated, service_role;

-- 3. Update settle_verified_payment (strictly service_role only, checks currency & amount, emits project_events)
create or replace function public.settle_verified_payment(
  p_order_ref text,
  p_gateway text,
  p_transaction_ref text,
  p_amount numeric,
  p_currency text,
  p_channel text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_payment_id uuid;
  v_project_id uuid;
  v_existing_verified boolean;
  v_brief jsonb;
  v_title text;
  v_has_brief boolean := false;
begin
  select * into v_order
  from public.orders
  where order_ref = p_order_ref
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Order not found');
  end if;

  if v_order.payment_status = 'paid' then
    select id into v_project_id from public.projects where order_id = v_order.id limit 1;
    return jsonb_build_object(
      'ok', true,
      'already_settled', true,
      'order_id', v_order.id,
      'order_ref', v_order.order_ref,
      'project_id', v_project_id
    );
  end if;

  if p_gateway not in ('sslcommerz', 'stripe', 'dev_test_adapter') then
    return jsonb_build_object('ok', false, 'error', 'Invalid payment gateway');
  end if;

  if v_order.currency <> p_currency then
    return jsonb_build_object('ok', false, 'error', 'Payment currency mismatch');
  end if;

  if abs(v_order.amount - p_amount) > 0.01 then
    return jsonb_build_object('ok', false, 'error', 'Payment amount mismatch against immutable order record');
  end if;

  select exists(
    select 1 from public.payments
    where order_id = v_order.id and verified = true
  ) into v_existing_verified;

  if v_existing_verified then
    return jsonb_build_object('ok', false, 'error', 'Order already has verified payment');
  end if;

  insert into public.payments (
    order_id, gateway, transaction_ref, amount, currency, status, channel, verified, verified_at, is_test, payload
  ) values (
    v_order.id, p_gateway, p_transaction_ref, p_amount, p_currency, 'verified',
    coalesce(p_channel, p_gateway), true, now(), (p_gateway = 'dev_test_adapter'), coalesce(p_payload, '{}'::jsonb)
  ) returning id into v_payment_id;

  update public.orders
  set
    payment_status = 'paid',
    gateway = p_gateway,
    gateway_tran_id = p_transaction_ref,
    paid_at = now(),
    updated_at = now()
  where id = v_order.id;

  if v_order.quote_id is not null then
    update public.quotes
    set status = 'converted', updated_at = now()
    where id = v_order.quote_id and status = 'accepted';
  end if;

  v_brief := coalesce(v_order.scope_snapshot->'objective', v_order.scope_snapshot->'brief', '{}'::jsonb);
  v_has_brief := coalesce(nullif(v_brief->>'objective', ''), '') <> '';
  v_title := v_order.order_ref || ' — ' || coalesce(nullif(v_brief->>'brandName', ''), nullif(v_brief->>'goal', ''), 'Creative Production Scope');

  insert into public.projects (
    order_id, client_id, organization_id, quote_id, title, status, revisions_used, max_revisions
  ) values (
    v_order.id, v_order.client_id, v_order.organization_id, v_order.quote_id, v_title,
    case when v_has_brief then 'brief_submitted' else 'awaiting_brief' end,
    0, coalesce(nullif(v_order.revisions_included, 0), 2)
  ) on conflict (order_id) do update set updated_at = now()
  returning id into v_project_id;

  insert into public.project_briefs (
    project_id, brand_name, objective, audience, platforms, submitted, submitted_at
  ) values (
    v_project_id,
    coalesce(v_brief->>'brandName', ''),
    coalesce(v_brief->>'objective', coalesce(v_brief->>'goal', '')),
    coalesce(v_brief->>'audience', ''),
    coalesce(v_brief->>'platforms', ''),
    v_has_brief,
    case when v_has_brief then now() else null end
  ) on conflict (project_id) do nothing;

  insert into public.project_tasks (project_id, title, description, status, display_order) values
    (v_project_id, '1. Creative Onboarding Brief Verification', 'Verify brief inputs & brand references', case when v_has_brief then 'done' else 'todo' end, 1),
    (v_project_id, '2. Studio Lead Assignment & Direction', 'Assign expert designer/editor & confirm deadline', 'todo', 2),
    (v_project_id, '3. Production Draft & Visual Proofing', 'Upload proof master for client pin review', 'todo', 3),
    (v_project_id, '4. Final Sign-Off & Commercial Handover', 'Verify client approval and deliver master ZIP', 'todo', 4)
  on conflict do nothing;

  insert into public.project_events (
    project_id, actor_kind, actor_id, event_type, state_before, state_after, visibility, summary, metadata
  ) values (
    v_project_id, 'system', v_order.client_id, 'DEPOSIT_VERIFIED', 'awaiting_payment',
    case when v_has_brief then 'brief_submitted' else 'awaiting_brief' end,
    'client',
    format('Verified payment settled via %s (%s %s). Studio workspace initialized.', p_gateway, p_currency, p_amount),
    jsonb_build_object('order_ref', v_order.order_ref, 'transaction_ref', p_transaction_ref, 'payment_id', v_payment_id)
  );

  insert into public.audit_logs (event_type, details, actor_id, metadata)
  values (
    'ORDER_PAID_VERIFIED',
    format('Payment of %s %s verified for order %s via %s', p_amount, p_currency, v_order.order_ref, p_gateway),
    v_order.client_id,
    jsonb_build_object('order_id', v_order.id, 'order_ref', v_order.order_ref, 'payment_id', v_payment_id, 'project_id', v_project_id, 'transaction_ref', p_transaction_ref)
  );

  return jsonb_build_object(
    'ok', true,
    'already_settled', false,
    'order_id', v_order.id,
    'order_ref', v_order.order_ref,
    'payment_id', v_payment_id,
    'project_id', v_project_id
  );
end;
$$;

revoke all on function public.settle_verified_payment from public, anon, authenticated;
grant execute on function public.settle_verified_payment to service_role;

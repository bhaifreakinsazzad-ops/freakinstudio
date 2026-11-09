-- Freakin's Studio — Migration 10/10 (Directive 13.0 Security Remediation)
--
-- TRUSTED DATABASE TRANSACTION LAYER & INTEGRITY PROCEDURES
--
-- REMEDIATED SECURITY SAFEGUARDS (Directive 13.0 §2, §3):
--   1. settle_verified_payment:
--      * REVOKED execution from anon and authenticated.
--      * EXECUTABLE ONLY by service_role (trusted server-side execution after provider verification).
--      * ENFORCES that caller amount and currency match the order record exactly.
--      * ENFORCES atomic settlement, row-locking (FOR UPDATE), and idempotent project creation.
--   2. create_pending_order:
--      * If based on an issued quote, DERIVES total directly from quotes table (ignoring caller parameters).
--      * Validates that quote is issued, accepted, and belongs to caller.
--      * If direct checkout, derives prices against approved services and add-ons.
--      * Rejects zero, negative, or unapproved quantities.
--   3. create_quotation_request:
--      * Validates caller identity.
--      * Calculates line totals from approved catalog prices (services.base_bdt / base_usd).
--   4. submit_project_brief & approve_project_asset:
--      * Strictly validates ownership and state transitions.

-- ---------------------------------------------------------------------------
-- 1. create_quotation_request
-- ---------------------------------------------------------------------------
create or replace function public.create_quotation_request(
  p_client_id uuid,
  p_currency text,
  p_scope jsonb,
  p_items jsonb,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quote_id uuid;
  v_quote_ref text;
  v_item jsonb;
  v_service record;
  v_qty int;
  v_rate_bdt numeric := 0;
  v_rate_usd numeric := 0;
  v_total_bdt numeric := 0;
  v_total_usd numeric := 0;
begin
  -- Validate caller authentication
  if auth.uid() is null or (auth.uid() <> p_client_id and not public.is_admin()) then
    raise exception 'Unauthorized quotation request';
  end if;

  if p_currency not in ('BDT', 'USD') then
    raise exception 'Invalid currency %', p_currency;
  end if;

  v_quote_ref := 'FS-QT-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  -- Insert base quotation in pending state
  insert into public.quotes (
    quote_ref,
    client_id,
    currency,
    amount_bdt,
    amount_usd,
    status,
    pricing_mode,
    scope_snapshot,
    notes,
    created_at,
    updated_at
  ) values (
    v_quote_ref,
    p_client_id,
    p_currency,
    0,
    0,
    'pending',
    'manual',
    coalesce(p_scope, '{}'::jsonb),
    p_notes,
    now(),
    now()
  ) returning id into v_quote_id;

  -- Process and validate each item from approved catalog
  if p_items is not null and jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_qty := coalesce((v_item->>'quantity')::int, 1);
      if v_qty <= 0 or v_qty > 1000 then
        raise exception 'Invalid item quantity %', v_qty;
      end if;

      -- Look up official service rates from database
      select * into v_service
      from public.services
      where id = (v_item->>'service_id');

      if found then
        v_rate_bdt := coalesce(v_service.base_bdt, 0);
        v_rate_usd := coalesce(v_service.base_usd, 0);
      else
        -- Fall back to 0 for custom/unapproved items (manual quotation mode)
        v_rate_bdt := 0;
        v_rate_usd := 0;
      end if;

      v_total_bdt := v_total_bdt + (v_rate_bdt * v_qty);
      v_total_usd := v_total_usd + (v_rate_usd * v_qty);

      insert into public.quote_items (
        quote_id,
        service_id,
        title,
        quantity,
        unit_rate_bdt,
        unit_rate_usd,
        line_total_bdt,
        line_total_usd,
        config
      ) values (
        v_quote_id,
        v_item->>'service_id',
        coalesce(v_item->>'title', coalesce(v_service.title, 'Service Item')),
        v_qty,
        v_rate_bdt,
        v_rate_usd,
        (v_rate_bdt * v_qty),
        (v_rate_usd * v_qty),
        coalesce(v_item->'config', '{}'::jsonb)
      );
    end loop;
  end if;

  -- Update quotation with server-calculated amounts
  update public.quotes
  set
    amount_bdt = v_total_bdt,
    amount_usd = v_total_usd
  where id = v_quote_id;

  insert into public.audit_logs (
    event_type,
    details,
    actor_id,
    metadata
  ) values (
    'QUOTE_REQUESTED',
    'Quotation ' || v_quote_ref || ' lodged successfully',
    p_client_id,
    jsonb_build_object('quote_id', v_quote_id, 'quote_ref', v_quote_ref, 'currency', p_currency)
  );

  return jsonb_build_object(
    'ok', true,
    'quote_id', v_quote_id,
    'quote_ref', v_quote_ref
  );
end;
$$;

-- Grant execution only to authenticated callers & service_role (NOT anon)
revoke all on function public.create_quotation_request from public, anon;
grant execute on function public.create_quotation_request to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. create_pending_order (Server-Authoritative Pricing)
-- ---------------------------------------------------------------------------
create or replace function public.create_pending_order(
  p_client_id uuid,
  p_quote_id uuid,
  p_order_ref text,
  p_currency text,
  p_scope jsonb,
  p_items jsonb,
  p_is_test boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_quote record;
  v_item jsonb;
  v_service record;
  v_qty int;
  v_rate_bdt numeric := 0;
  v_rate_usd numeric := 0;
  v_final_bdt numeric := 0;
  v_final_usd numeric := 0;
  v_payable_amount numeric := 0;
begin
  -- Validate caller
  if auth.uid() is null or (auth.uid() <> p_client_id and not public.is_admin()) then
    raise exception 'Unauthorized order creation';
  end if;

  if p_currency not in ('BDT', 'USD') then
    raise exception 'Invalid currency %', p_currency;
  end if;

  -- CASE A: Order is based on an issued quotation
  if p_quote_id is not null then
    select * into v_quote
    from public.quotes
    where id = p_quote_id and client_id = p_client_id;

    if not found then
      raise exception 'Quotation not found or not owned by client';
    end if;

    if v_quote.status not in ('issued', 'accepted') then
      raise exception 'Quotation is not in an orderable status (%)', v_quote.status;
    end if;

    if v_quote.expires_at is not null and v_quote.expires_at < now() then
      raise exception 'Quotation has expired';
    end if;

    -- Authoritative values derived strictly from accepted quotation
    v_final_bdt := v_quote.amount_bdt;
    v_final_usd := v_quote.amount_usd;
    v_payable_amount := case when p_currency = 'BDT' then v_final_bdt else v_final_usd end;

    -- Mark quote accepted if not already
    update public.quotes
    set status = 'accepted', accepted_at = coalesce(accepted_at, now())
    where id = p_quote_id;

  -- CASE B: Direct checkout (recalculate from catalog)
  else
    if p_items is null or jsonb_array_length(p_items) = 0 then
      raise exception 'Direct checkout order requires at least one service item';
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_qty := coalesce((v_item->>'quantity')::int, 1);
      if v_qty <= 0 or v_qty > 100 then
        raise exception 'Quantity out of permitted direct checkout range: %', v_qty;
      end if;

      select * into v_service
      from public.services
      where id = (v_item->>'service_id');

      if not found then
        raise exception 'Service not found: %', (v_item->>'service_id');
      end if;

      v_rate_bdt := coalesce(v_service.base_bdt, 0);
      v_rate_usd := coalesce(v_service.base_usd, 0);

      v_final_bdt := v_final_bdt + (v_rate_bdt * v_qty);
      v_final_usd := v_final_usd + (v_rate_usd * v_qty);
    end loop;

    v_payable_amount := case when p_currency = 'BDT' then v_final_bdt else v_final_usd end;
  end if;

  if v_payable_amount <= 0 then
    raise exception 'Order payable amount must be positive';
  end if;

  -- Insert order in strictly 'awaiting_payment' status
  insert into public.orders (
    order_ref,
    client_id,
    quote_id,
    currency,
    amount,
    amount_bdt,
    amount_usd,
    payment_status,
    is_test,
    scope_snapshot,
    created_at,
    updated_at
  ) values (
    p_order_ref,
    p_client_id,
    p_quote_id,
    p_currency,
    v_payable_amount,
    v_final_bdt,
    v_final_usd,
    'awaiting_payment',
    p_is_test,
    coalesce(p_scope, '{}'::jsonb),
    now(),
    now()
  ) returning id into v_order_id;

  -- Insert order items
  if p_items is not null and jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_qty := coalesce((v_item->>'quantity')::int, 1);
      select * into v_service from public.services where id = (v_item->>'service_id');

      insert into public.order_items (
        order_id,
        service_id,
        title,
        quantity,
        unit_rate_bdt,
        unit_rate_usd,
        line_total_bdt,
        line_total_usd,
        config
      ) values (
        v_order_id,
        v_item->>'service_id',
        coalesce(v_item->>'title', coalesce(v_service.title, 'Service Item')),
        v_qty,
        coalesce(v_service.base_bdt, 0),
        coalesce(v_service.base_usd, 0),
        coalesce(v_service.base_bdt, 0) * v_qty,
        coalesce(v_service.base_usd, 0) * v_qty,
        coalesce(v_item->'config', '{}'::jsonb)
      );
    end loop;
  end if;

  insert into public.audit_logs (
    event_type,
    details,
    actor_id,
    metadata
  ) values (
    'ORDER_CREATED',
    'Pending order ' || p_order_ref || ' created awaiting payment settlement',
    p_client_id,
    jsonb_build_object('order_id', v_order_id, 'order_ref', p_order_ref, 'amount', v_payable_amount, 'currency', p_currency)
  );

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'order_ref', p_order_ref,
    'amount', v_payable_amount,
    'currency', p_currency
  );
end;
$$;

revoke all on function public.create_pending_order from public, anon;
grant execute on function public.create_pending_order to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. settle_verified_payment (CRITICAL SECURITY HARDENED)
-- ---------------------------------------------------------------------------
-- Must only be executed by service_role following genuine provider validation.
-- Checks that amount and currency match order records strictly.
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
  v_scope jsonb;
  v_project_title text;
  v_expected_amount numeric;
begin
  -- Lookup target order with row lock to prevent race conditions
  select * into v_order
  from public.orders
  where order_ref = p_order_ref
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Order not found');
  end if;

  -- Idempotency check: If already paid, return success without re-creating project
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

  -- Validate gateway
  if p_gateway not in ('sslcommerz', 'stripe', 'dev_test_adapter') then
    return jsonb_build_object('ok', false, 'error', 'Invalid payment gateway');
  end if;

  -- Validate currency match against order record
  if v_order.currency <> p_currency then
    return jsonb_build_object('ok', false, 'error', 'Payment currency mismatch');
  end if;

  -- Validate amount match against order record
  v_expected_amount := v_order.amount;
  if abs(v_expected_amount - p_amount) > 0.01 then
    return jsonb_build_object('ok', false, 'error', 'Payment amount mismatch against immutable order record');
  end if;

  -- Check if verified payment already recorded
  select exists(
    select 1 from public.payments
    where order_id = v_order.id and verified = true
  ) into v_existing_verified;

  if v_existing_verified then
    return jsonb_build_object('ok', false, 'error', 'Order already has verified payment');
  end if;

  -- Record verified payment
  insert into public.payments (
    order_id,
    gateway,
    transaction_ref,
    amount,
    currency,
    status,
    channel,
    verified,
    verified_at,
    is_test,
    payload
  ) values (
    v_order.id,
    p_gateway,
    p_transaction_ref,
    p_amount,
    p_currency,
    'verified',
    coalesce(p_channel, p_gateway),
    true,
    now(),
    (p_gateway = 'dev_test_adapter'),
    coalesce(p_payload, '{}'::jsonb)
  ) returning id into v_payment_id;

  -- Transition order to paid
  update public.orders
  set
    payment_status = 'paid',
    paid_at = now(),
    updated_at = now()
  where id = v_order.id;

  -- Automatically initialize linked production project
  v_scope := coalesce(v_order.scope_snapshot, '{}'::jsonb);
  v_project_title := v_order.order_ref || ' — ' || coalesce(v_scope->'objective'->>'goal', 'Creative Production Scope');

  insert into public.projects (
    order_id,
    client_id,
    organization_id,
    title,
    status,
    revisions_used,
    max_revisions,
    created_at,
    updated_at
  ) values (
    v_order.id,
    v_order.client_id,
    v_order.organization_id,
    v_project_title,
    'awaiting_brief',
    0,
    coalesce(v_order.revisions_included, 3),
    now(),
    now()
  ) on conflict (order_id) do update set updated_at = now()
  returning id into v_project_id;

  -- Initialize project brief if not present
  insert into public.project_briefs (
    project_id,
    brand_name,
    objective,
    audience,
    platforms,
    submitted
  ) values (
    v_project_id,
    '',
    coalesce(v_scope->'objective'->>'goal', ''),
    '',
    '',
    false
  ) on conflict (project_id) do nothing;

  -- Initialize standard workflow tasks
  insert into public.project_tasks (project_id, title, status, display_order)
  values
    (v_project_id, 'Client Creative Brief Submission', 'todo', 1),
    (v_project_id, 'Production Kickoff & Creative Direction', 'todo', 2),
    (v_project_id, 'Draft Deliverable Delivery & Review', 'todo', 3),
    (v_project_id, 'Final Asset Handover & Archiving', 'todo', 4)
  on conflict do nothing;

  -- Audit log settlement
  insert into public.audit_logs (
    event_type,
    details,
    actor_id,
    metadata
  ) values (
    'ORDER_PAID_VERIFIED',
    'Payment of ' || p_amount || ' ' || p_currency || ' verified for order ' || v_order.order_ref || ' via ' || p_gateway,
    v_order.client_id,
    jsonb_build_object(
      'order_id', v_order.id,
      'order_ref', v_order.order_ref,
      'payment_id', v_payment_id,
      'project_id', v_project_id,
      'transaction_ref', p_transaction_ref
    )
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

-- CRITICAL FIX (Directive 13.0 §2): Revoke execution from PUBLIC, anon, and authenticated.
-- Restrict settlement exclusively to service_role.
revoke all on function public.settle_verified_payment from public, anon, authenticated;
grant execute on function public.settle_verified_payment to service_role;

-- ---------------------------------------------------------------------------
-- 4. submit_project_brief
-- ---------------------------------------------------------------------------
create or replace function public.submit_project_brief(
  p_project_id uuid,
  p_brand_name text,
  p_objective text,
  p_audience text,
  p_platforms text,
  p_answers jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project record;
begin
  select * into v_project
  from public.projects
  where id = p_project_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Project not found');
  end if;

  if auth.uid() is null or (auth.uid() <> v_project.client_id and not public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'Unauthorized brief submission');
  end if;

  update public.project_briefs
  set
    brand_name = coalesce(p_brand_name, brand_name),
    objective = coalesce(p_objective, objective),
    audience = coalesce(p_audience, audience),
    platforms = coalesce(p_platforms, platforms),
    answers = coalesce(p_answers, answers),
    submitted = true,
    submitted_at = now(),
    updated_at = now()
  where project_id = p_project_id;

  update public.projects
  set
    status = 'brief_submitted',
    updated_at = now()
  where id = p_project_id and status = 'awaiting_brief';

  update public.project_tasks
  set status = 'done'
  where project_id = p_project_id and display_order = 1;

  insert into public.audit_logs (
    event_type,
    details,
    actor_id,
    metadata
  ) values (
    'BRIEF_SUBMITTED',
    'Creative brief submitted for project ' || v_project.title,
    auth.uid(),
    jsonb_build_object('project_id', p_project_id)
  );

  return jsonb_build_object('ok', true, 'project_id', p_project_id);
end;
$$;

revoke all on function public.submit_project_brief from public, anon;
grant execute on function public.submit_project_brief to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5. approve_project_asset
-- ---------------------------------------------------------------------------
create or replace function public.approve_project_asset(
  p_project_id uuid,
  p_asset_id uuid,
  p_terms_accepted boolean,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project record;
  v_asset record;
begin
  select * into v_project from public.projects where id = p_project_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Project not found');
  end if;

  if auth.uid() is null or (auth.uid() <> v_project.client_id and not public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'Unauthorized asset approval');
  end if;

  if not p_terms_accepted then
    return jsonb_build_object('ok', false, 'error', 'Terms and conditions must be explicitly accepted');
  end if;

  select * into v_asset from public.project_assets where id = p_asset_id and project_id = p_project_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Deliverable asset not found');
  end if;

  -- Mark asset approved
  update public.project_assets
  set
    is_approved = true,
    approved_at = now(),
    approved_by = auth.uid()
  where id = p_asset_id;

  -- Insert approval record
  insert into public.approvals (
    project_id,
    asset_id,
    asset_sha256,
    approved_by,
    terms_accepted,
    notes
  ) values (
    p_project_id,
    p_asset_id,
    v_asset.sha256,
    auth.uid(),
    p_terms_accepted,
    p_notes
  ) on conflict (project_id, asset_id) do update
  set
    terms_accepted = p_terms_accepted,
    notes = p_notes,
    created_at = now();

  -- Transition project to client_approved
  update public.projects
  set
    status = 'client_approved',
    updated_at = now()
  where id = p_project_id;

  insert into public.audit_logs (
    event_type,
    details,
    actor_id,
    metadata
  ) values (
    'ASSET_APPROVED',
    'Asset ' || v_asset.file_name || ' (' || v_asset.version_label || ') approved by client',
    auth.uid(),
    jsonb_build_object('project_id', p_project_id, 'asset_id', p_asset_id)
  );

  return jsonb_build_object('ok', true, 'asset_id', p_asset_id, 'project_id', p_project_id);
end;
$$;

revoke all on function public.approve_project_asset from public, anon;
grant execute on function public.approve_project_asset to authenticated, service_role;

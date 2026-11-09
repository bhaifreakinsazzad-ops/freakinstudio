import { NextResponse } from "next/server";
import { devTestPayment } from "@/lib/payments/dev-test";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import type { Json } from "@/types/database.types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      payload[key] = value.toString();
    });

    return await handleCallback(payload, request);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error handling dev-test callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const payload: Record<string, unknown> = {};
    url.searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    return await handleCallback(payload, request);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error handling dev-test callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCallback(
  payload: Record<string, unknown>,
  request: Request
) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // PRODUCTION GATE: Never permit in production
  if (process.env.NODE_ENV === "production" || !devTestPayment.isEnabled) {
    return NextResponse.json(
      {
        error:
          "Development test payment adapter is strictly disabled in production environments.",
      },
      { status: 403 }
    );
  }

  const transactionRef = (payload.tran_id as string) || "";
  const orderRef = (payload.order_ref as string) || transactionRef;

  if (!transactionRef || !orderRef) {
    return NextResponse.json(
      { error: "Invalid callback: Missing tran_id or order_ref parameter." },
      { status: 400 }
    );
  }

  // 1. Privileged Client (Fails closed if SUPABASE_SERVICE_ROLE_KEY missing)
  let supabase;
  try {
    supabase = createPrivilegedClient();
  } catch (confErr: unknown) {
    console.error("Privileged client error in dev-test callback:", confErr);
    return NextResponse.redirect(
      `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
        "Settlement service unavailable: Server credentials not configured."
      )}`
    );
  }

  // 2. Identify order from database first
  const { data: rawOrder, error: orderLookupErr } = await supabase
    .from("orders")
    .select("*")
    .eq("order_ref", orderRef)
    .single();

  const order = rawOrder as {
    id: string;
    order_ref: string;
    client_id: string;
    amount: number;
    amount_bdt: number;
    amount_usd: number;
    currency: "BDT" | "USD";
    payment_status: string;
    scope_snapshot: Record<string, unknown>;
  } | null;

  if (orderLookupErr || !order) {
    console.error("Dev-test callback received for non-existent order:", orderRef);
    return NextResponse.redirect(
      `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
        "Invalid callback: Referenced order was not found in the studio database."
      )}`
    );
  }

  // 3. Anti-replay & Idempotent check
  if (order.payment_status === "paid") {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/projects?payment=success&tran_id=${encodeURIComponent(
        transactionRef
      )}`
    );
  }

  // 4. Load server-authoritative amount & currency
  const expectedAmount = Number(
    order.currency === "BDT" ? order.amount_bdt || order.amount : order.amount_usd || order.amount
  );
  const expectedCurrency = order.currency;

  // 5. Validate cryptographic test token and binding
  const validation = await devTestPayment.validatePayment({
    gateway: "dev_test_adapter",
    transactionRef,
    expectedAmount,
    expectedCurrency,
    gatewayPayload: payload,
  });

  if (validation.verified && validation.status === "paid") {
    // Execute trusted settlement RPC (Migration 10) under service_role
    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      "settle_verified_payment",
      {
        p_order_ref: order.order_ref,
        p_gateway: "dev_test_adapter",
        p_transaction_ref: transactionRef,
        p_amount: validation.amountVerified,
        p_currency: validation.currencyVerified,
        p_channel: "Dev Test Simulated",
        p_payload: validation.rawPayload as unknown as Json,
      }
    );

    if (rpcErr || (rpcRes && !(rpcRes as Record<string, unknown>).ok)) {
      console.error("Dev-test settlement RPC failed:", rpcErr?.message);
      return NextResponse.redirect(
        `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
          "Settlement execution failed: " + (rpcErr?.message || "Unknown error")
        )}`
      );
    }

    await supabase.from("audit_logs").insert({
      event_type: "ORDER_PAID_VERIFIED",
      details: `Dev-test simulated payment verified for order ${order.order_ref} (Tx: ${transactionRef})`,
      actor_id: order.client_id,
    });

    return NextResponse.redirect(
      `${baseUrl}/dashboard/projects?payment=success&tran_id=${encodeURIComponent(
        transactionRef
      )}`
    );
  }

  // Verification failed
  await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  return NextResponse.redirect(
    `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
      validation.error || "Development payment simulation rejected"
    )}`
  );
}

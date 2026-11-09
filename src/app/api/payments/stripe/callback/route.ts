import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import type { Json } from "@/types/database.types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id") || "";
    const orderRef = url.searchParams.get("order_ref") || "";

    const baseUrl = `${url.protocol}//${url.host}`;

    if (!sessionId && !orderRef) {
      return NextResponse.redirect(
        `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
          "Invalid callback: Missing session_id or order_ref parameter."
        )}`
      );
    }

    // 1. Privileged Client (Fails closed if SUPABASE_SERVICE_ROLE_KEY missing)
    let supabase;
    try {
      supabase = createPrivilegedClient();
    } catch (confErr: unknown) {
      console.error("Privileged client error in Stripe callback:", confErr);
      return NextResponse.redirect(
        `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
          "Settlement service unavailable: Server credentials not configured."
        )}`
      );
    }

    // 2. Resolve order reference
    let resolvedOrderRef = orderRef;
    if (!resolvedOrderRef && sessionId) {
      resolvedOrderRef = sessionId;
    }

    // Lookup order in database
    const { data: rawOrder, error: orderLookupErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_ref", resolvedOrderRef)
      .single();

    const order = rawOrder as {
      id: string;
      order_ref: string;
      client_id: string;
      amount: number;
      amount_usd: number;
      currency: "BDT" | "USD";
      payment_status: string;
      scope_snapshot: Record<string, unknown>;
    } | null;

    if (orderLookupErr || !order) {
      console.error("Stripe callback received for non-existent order:", resolvedOrderRef);
      return NextResponse.redirect(
        `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
          "Invalid callback: Referenced order was not found in the studio database."
        )}`
      );
    }

    // 3. Anti-replay & Idempotent check
    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/projects?payment=success&session_id=${encodeURIComponent(
          sessionId
        )}`
      );
    }

    // 4. Load server-authoritative amount & currency
    const expectedAmount = Number(order.amount_usd || order.amount);
    const expectedCurrency = order.currency;

    const payload: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => {
      payload[k] = v;
    });

    // 5. Validate Stripe payment against database expected amount
    const validation = await stripe.validatePayment({
      gateway: "stripe",
      transactionRef: sessionId,
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
          p_gateway: "stripe",
          p_transaction_ref: sessionId,
          p_amount: validation.amountVerified,
          p_currency: validation.currencyVerified,
          p_channel: "Stripe",
          p_payload: validation.rawPayload as unknown as Json,
        }
      );

      if (rpcErr || (rpcRes && !(rpcRes as Record<string, unknown>).ok)) {
        console.error("Stripe settlement RPC failed:", rpcErr?.message);
        return NextResponse.redirect(
          `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
            "Settlement execution failed: " + (rpcErr?.message || "Unknown error")
          )}`
        );
      }

      await supabase.from("audit_logs").insert({
        event_type: "ORDER_PAID_VERIFIED",
        details: `Stripe verified payment of $ ${validation.amountVerified} for order ${order.order_ref} (Session: ${sessionId})`,
        actor_id: order.client_id,
      });

      return NextResponse.redirect(
        `${baseUrl}/dashboard/projects?payment=success&session_id=${encodeURIComponent(
          sessionId
        )}`
      );
    }

    // Validation failed
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.redirect(
      `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
        validation.error || "Stripe payment verification failed"
      )}`
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error handling Stripe callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

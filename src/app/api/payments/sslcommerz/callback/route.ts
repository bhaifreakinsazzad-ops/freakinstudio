import { NextResponse } from "next/server";
import { sslcommerz } from "@/lib/payments/sslcommerz";
import { createClient } from "@/lib/supabase/server";
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
    const message = err instanceof Error ? err.message : "Error handling SSLCOMMERZ callback";
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
    const message = err instanceof Error ? err.message : "Error handling SSLCOMMERZ callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCallback(payload: Record<string, unknown>, request: Request) {
  const transactionRef = (payload.tran_id as string) || `SSLC-${Date.now()}`;
  const amount = Number(payload.amount || payload.total_amount || 0);
  const currency = ((payload.currency as string) || "BDT").toUpperCase() as "BDT" | "USD";
  const valId = payload.val_id as string | undefined;

  // Validate transaction
  const validation = await sslcommerz.validatePayment({
    gateway: "sslcommerz",
    transactionRef,
    expectedAmount: amount,
    expectedCurrency: currency,
    valId,
    gatewayPayload: payload,
  });

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const supabase = await createClient();

  // If verified successfully
  if (validation.verified && validation.status === "paid") {
    // Attempt to locate and update order
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .or(`order_ref.eq.${transactionRef},id.eq.${transactionRef}`)
      .single();

    if (order) {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          project_status: "awaiting_brief",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Record payment
      await supabase.from("payments").insert({
        order_id: order.id,
        gateway: "sslcommerz",
        transaction_ref: transactionRef,
        amount: validation.amountVerified,
        currency: validation.currencyVerified,
        channel: validation.cardType || "SSLCOMMERZ",
        verified: true,
        verified_at: new Date().toISOString(),
        payload: validation.rawPayload as unknown as Json,
      });

      // Activate or create project
      const { data: existingProject } = await supabase
        .from("projects")
        .select("id")
        .eq("order_id", order.id)
        .single();

      if (!existingProject) {
        await supabase.from("projects").insert({
          order_id: order.id,
          client_id: order.client_id,
          title: `${order.order_ref} — Creative Production Project`,
          status: "awaiting_brief",
          revisions_used: 0,
          max_revisions: 3,
        });
      }
    }

    // If an IPN background webhook (non-browser), return 200
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({
        status: "SUCCESS",
        verified: true,
        transactionRef,
      });
    }

    // Redirect client to portal dashboard
    return NextResponse.redirect(
      `${baseUrl}/dashboard/projects?payment=success&tran_id=${encodeURIComponent(
        transactionRef
      )}`
    );
  }

  // Payment failed or flagged
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json(
      {
        status: "FAILED",
        verified: false,
        error: validation.error || "Payment verification failed",
      },
      { status: 400 }
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
      validation.error || "Payment was rejected or cancelled"
    )}`
  );
}

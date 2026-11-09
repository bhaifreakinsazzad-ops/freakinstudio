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
    const message =
      err instanceof Error ? err.message : "Error handling SSLCOMMERZ callback";
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
      err instanceof Error ? err.message : "Error handling SSLCOMMERZ callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCallback(
  payload: Record<string, unknown>,
  request: Request
) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const transactionRef = (payload.tran_id as string) || "";

  if (!transactionRef) {
    return NextResponse.json(
      { error: "Invalid callback: Missing tran_id parameter." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // CRITICAL SECURITY FIX (Defect B):
  // 1. Identify order from database first using trusted transaction reference
  const { data: rawOrder, error: orderLookupErr } = await supabase
    .from("orders")
    .select("*")
    .eq("order_ref", transactionRef)
    .single();

  const order = rawOrder as {
    id: string;
    order_ref: string;
    client_id: string;
    amount: number;
    amount_bdt: number;
    currency: "BDT" | "USD";
    payment_status: string;
    scope_snapshot: Record<string, unknown>;
  } | null;

  if (orderLookupErr || !order) {
    console.error("Payment callback received for non-existent order:", transactionRef);
    return NextResponse.redirect(
      `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
        "Invalid callback: Referenced order was not found in the studio database."
      )}`
    );
  }

  // 2. Idempotent fulfillment check
  if (order.payment_status === "paid") {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/projects?payment=success&tran_id=${encodeURIComponent(
        transactionRef
      )}`
    );
  }

  // 3. Load server-authoritative amount & currency from database
  const expectedAmount = Number(order.amount_bdt || order.amount);
  const expectedCurrency = order.currency;
  const valId = payload.val_id as string | undefined;

  // 4. Validate transaction against database values (Defect B fix)
  const validation = await sslcommerz.validatePayment({
    gateway: "sslcommerz",
    transactionRef,
    expectedAmount,
    expectedCurrency,
    valId,
    gatewayPayload: payload,
  });

  // If verified successfully by provider
  if (validation.verified && validation.status === "paid") {
    // Transition order to paid
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        project_status: "awaiting_brief",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Record verified payment
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

    // Activate project (Defect A fix: project only created after payment verification)
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("order_id", order.id)
      .single();

    if (!existingProject) {
      const scope = (order.scope_snapshot || {}) as { objective?: { goal?: string } };
      const projectTitle = `${order.order_ref} — ${scope.objective?.goal || "Creative Production Scope"}`;

      const { data: newProject } = await supabase
        .from("projects")
        .insert({
          order_id: order.id,
          client_id: order.client_id,
          title: projectTitle,
          status: "awaiting_brief",
          revisions_used: 0,
          max_revisions: 3,
        })
        .select()
        .single();

      if (newProject) {
        await supabase.from("project_briefs").insert({
          project_id: newProject.id,
          brand_name: "",
          objective: scope.objective?.goal || "",
          audience: "",
          platforms: "",
          submitted: false,
        });

        const defaultTasks = [
          { title: "Client Creative Brief Submission", status: "todo" as const, display_order: 1 },
          { title: "Production Kickoff & Creative Direction", status: "todo" as const, display_order: 2 },
          { title: "Draft Deliverable Delivery & Review", status: "todo" as const, display_order: 3 },
          { title: "Final Asset Handover & Archiving", status: "todo" as const, display_order: 4 },
        ];

        for (const t of defaultTasks) {
          await supabase.from("project_tasks").insert({
            project_id: newProject.id,
            title: t.title,
            status: t.status,
            display_order: t.display_order,
          });
        }
      }
    }

    await supabase.from("audit_logs").insert({
      event_type: "ORDER_PAID_VERIFIED",
      details: `SSLCOMMERZ verified payment of ৳ ${validation.amountVerified} for order ${order.order_ref} (Tx: ${transactionRef})`,
      actor_id: order.client_id,
    });

    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({
        status: "SUCCESS",
        verified: true,
        transactionRef,
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/projects?payment=success&tran_id=${encodeURIComponent(
        transactionRef
      )}`
    );
  }

  // Verification failed or was rejected
  await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

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
      validation.error || "Payment was rejected or cancelled by payment gateway"
    )}`
  );
}

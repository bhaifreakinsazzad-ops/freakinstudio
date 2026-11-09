import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

    // CRITICAL SECURITY FIX (Defect B):
    // 1. Identify order from database first using order_ref or session lookup
    let query = supabase.from("orders").select("*");
    if (orderRef) {
      query = query.eq("order_ref", orderRef);
    } else {
      query = query.eq("order_ref", sessionId);
    }

    const { data: rawOrder, error: orderLookupErr } = await query.single();

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
      console.error("Stripe callback received for non-existent order:", orderRef || sessionId);
      return NextResponse.redirect(
        `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
          "Invalid callback: Referenced order was not found in the studio database."
        )}`
      );
    }

    // 2. Idempotent check
    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/projects?payment=success&session_id=${encodeURIComponent(
          sessionId
        )}`
      );
    }

    // 3. Load server-authoritative amount & currency from database order
    const expectedAmount = Number(order.amount_usd || order.amount);
    const expectedCurrency = order.currency;

    const payload: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => {
      payload[k] = v;
    });

    // 4. Validate Stripe payment against database values
    const validation = await stripe.validatePayment({
      gateway: "stripe",
      transactionRef: sessionId,
      expectedAmount,
      expectedCurrency,
      gatewayPayload: payload,
    });

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
        gateway: "stripe",
        transaction_ref: sessionId,
        amount: validation.amountVerified,
        currency: validation.currencyVerified,
        channel: "Stripe",
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

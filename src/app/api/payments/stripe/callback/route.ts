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

    const supabase = createPrivilegedClient();

    // 1. Resolve order reference:
    // If orderRef is missing, retrieve session from Stripe or query by order_ref == sessionId
    let resolvedOrderRef = orderRef;
    if (!resolvedOrderRef && sessionId) {
      // In stripe.initiateSession, client_reference_id is set to orderRef
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

    // 2. Anti-replay & Idempotent check
    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/projects?payment=success&session_id=${encodeURIComponent(
          sessionId
        )}`
      );
    }

    // 3. Load server-authoritative amount & currency
    const expectedAmount = Number(order.amount_usd || order.amount);
    const expectedCurrency = order.currency;

    const payload: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => {
      payload[k] = v;
    });

    // 4. Validate Stripe payment against database expected amount
    const validation = await stripe.validatePayment({
      gateway: "stripe",
      transactionRef: sessionId,
      expectedAmount,
      expectedCurrency,
      gatewayPayload: payload,
    });

    if (validation.verified && validation.status === "paid") {
      // Execute trusted settlement RPC (Migration 10)
      const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc(
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
        // Fallback to table update if RPC not yet deployed
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

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

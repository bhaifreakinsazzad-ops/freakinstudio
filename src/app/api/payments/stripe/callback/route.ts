import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id") || `STRIPE-${Date.now()}`;
    const amount = Number(url.searchParams.get("amount") || 0);
    const currency = ((url.searchParams.get("currency") as string) || "USD").toUpperCase() as "BDT" | "USD";

    const payload: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => {
      payload[k] = v;
    });

    const validation = await stripe.validatePayment({
      gateway: "stripe",
      transactionRef: sessionId,
      expectedAmount: amount,
      expectedCurrency: currency,
      gatewayPayload: payload,
    });

    const baseUrl = `${url.protocol}//${url.host}`;
    const supabase = await createClient();

    if (validation.verified && validation.status === "paid") {
      // Find order
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .or(`order_ref.eq.${sessionId},id.eq.${sessionId}`)
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

      return NextResponse.redirect(
        `${baseUrl}/dashboard/projects?payment=success&session_id=${encodeURIComponent(
          sessionId
        )}`
      );
    }

    return NextResponse.redirect(
      `${baseUrl}/builder?payment=failed&error=${encodeURIComponent(
        validation.error || "Stripe payment verification failed"
      )}`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error handling Stripe callback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

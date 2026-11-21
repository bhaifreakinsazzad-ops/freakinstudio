"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initiatePayment } from "@/lib/payments";
import type { PaymentGateway as DomainPaymentGateway } from "@/types/domain";
import type { PaymentGateway as AdapterPaymentGateway } from "@/lib/payments/types";

export async function signOut() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function acceptQuoteAndCheckoutAction(
  quoteId: string,
  gateway: DomainPaymentGateway
): Promise<{
  ok: boolean;
  error?: string;
  orderRef?: string;
  redirectUrl?: string;
}> {
  if (!quoteId) {
    return { ok: false, error: "Invalid quotation identifier." };
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      ok: false,
      error: "Live quote acceptance requires active Supabase configuration.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        ok: false,
        error: "Please sign in to accept a formal quotation.",
      };
    }

    const { data: quote, error: quoteErr } = await supabase
      .from("quotes")
      .select(
        "id, quote_ref, client_id, status, currency, amount_bdt, amount_usd, scope_snapshot, expires_at"
      )
      .eq("id", quoteId)
      .eq("client_id", user.id)
      .single();

    if (quoteErr || !quote) {
      return {
        ok: false,
        error: "Quotation record not found or belongs to another account.",
      };
    }

    if (quote.status !== "issued" && quote.status !== "accepted") {
      return {
        ok: false,
        error: `Quotation is currently '${quote.status}' and cannot proceed to payment.`,
      };
    }

    if (quote.expires_at && new Date(quote.expires_at).getTime() < Date.now()) {
      return {
        ok: false,
        error:
          "This quotation has expired. Please submit an updated Smart Brief for a refreshed studio quote.",
      };
    }

    const currency = quote.currency === "USD" ? "USD" : "BDT";
    const payableAmount =
      currency === "USD" ? Number(quote.amount_usd) : Number(quote.amount_bdt);

    if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
      return {
        ok: false,
        error:
          "Issued quotation amount is not finalized yet. Contact Studio Operations.",
      };
    }

    if (gateway === "manual_bank") {
      return {
        ok: false,
        error:
          "Offline bank transfer instructions must be coordinated with Studio Operations (bhaifreakinstudio@gmail.com) before automatic settlement.",
      };
    }

    const resolvedGateway: AdapterPaymentGateway =
      gateway === "stripe" ? "stripe" : "sslcommerz";

    // Check if an awaiting_payment order already exists for this quote
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, order_ref, amount, currency, payment_status")
      .eq("quote_id", quote.id)
      .eq("client_id", user.id)
      .maybeSingle();

    let orderId = existingOrder?.id || "";
    let orderRef = existingOrder?.order_ref || "";

    if (existingOrder?.payment_status === "paid") {
      return {
        ok: false,
        error: "This quotation already has a settled paid order.",
      };
    }

    if (!existingOrder) {
      orderRef = `FS-ORD-${new Date().getFullYear()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

      const { data: rpcRes, error: rpcErr } = await supabase.rpc(
        "create_pending_order",
        {
          p_client_id: user.id,
          p_quote_id: quote.id,
          p_order_ref: orderRef,
          p_currency: currency,
          p_scope: quote.scope_snapshot,
          p_items: [],
          p_is_test: false,
          p_gateway: resolvedGateway,
        }
      );

      const parsed = rpcRes as {
        ok?: boolean;
        order_id?: string;
        order_ref?: string;
        error?: string;
      } | null;

      if (rpcErr || !parsed?.ok || !parsed.order_id) {
        return {
          ok: false,
          error:
            rpcErr?.message ||
            parsed?.error ||
            "Failed to create pending order for accepted quotation.",
        };
      }
      orderId = parsed.order_id;
    }

    const callbackSlug =
      resolvedGateway === "stripe" ? "stripe" : "sslcommerz";

    const paymentInit = await initiatePayment(
      {
        orderId,
        orderRef,
        amount: payableAmount,
        currency,
        customerName:
          user.user_metadata?.full_name || user.email || "Freakin Studio Client",
        customerEmail: user.email || "client@freakinstudio.com",
        customerPhone: user.user_metadata?.phone || "+8801778307704",
        successUrl: `/api/payments/${callbackSlug}/callback`,
        failUrl: `/api/payments/${callbackSlug}/callback`,
        cancelUrl: `/api/payments/${callbackSlug}/callback`,
        ipnUrl: `/api/payments/${callbackSlug}/callback`,
      },
      resolvedGateway
    );

    if (!paymentInit.success) {
      return {
        ok: false,
        error:
          paymentInit.error ||
          "Merchant payment gateway credentials are not configured on this server.",
      };
    }

    return {
      ok: true,
      orderRef,
      redirectUrl: paymentInit.redirectUrl,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Unable to accept quotation.",
    };
  }
}

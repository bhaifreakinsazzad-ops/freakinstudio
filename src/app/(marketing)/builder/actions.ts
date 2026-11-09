"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { initiatePayment } from "@/lib/payments";
import { getCatalogServices, getAllAddOns } from "@/lib/catalog";
import { calculatePricingSummary, APPROVED_ENTERPRISE_POLICY } from "@/lib/pricing/engine";
import type { PaymentGateway } from "@/lib/payments/types";
import type { Json } from "@/types/database.types";
import type { PackageDraft } from "@/types/domain";

export async function saveDraftAction(draft: PackageDraft) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: true, isGuest: true, draftId: draft.id };
    }

    const { error } = await supabase.from("package_drafts").upsert(
      {
        id: draft.id,
        user_id: user.id,
        objective: draft.objective as unknown as Json,
        services: draft.services,
        service_configs: draft.serviceConfigs as unknown as Json,
        selected_add_ons: draft.selectedAddOns as unknown as Json,
        pricing_summary: draft.pricing as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("DB draft save error:", error.message);
      return {
        ok: false,
        error: `Failed to save draft to database: ${error.message}`,
      };
    }

    return { ok: true, isGuest: false, draftId: draft.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save draft";
    return { ok: false, error: message };
  }
}

export async function getUserDraftsAction(): Promise<{
  ok: boolean;
  drafts: PackageDraft[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: true, drafts: [] };
    }

    const { data, error } = await supabase
      .from("package_drafts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("DB draft fetch error:", error.message);
      return { ok: false, drafts: [], error: error.message };
    }

    interface PackageDraftRow {
      id: string;
      objective: PackageDraft["objective"] | null;
      services: string[] | null;
      service_configs: PackageDraft["serviceConfigs"] | null;
      selected_add_ons: PackageDraft["selectedAddOns"] | null;
      pricing_summary: PackageDraft["pricing"] | null;
      updated_at: string;
    }

    const drafts: PackageDraft[] = (
      (data as unknown as PackageDraftRow[]) || []
    ).map((row) => ({
      id: row.id,
      savedAt: row.updated_at || new Date().toISOString(),
      objective: (row.objective || {}) as PackageDraft["objective"],
      services: (row.services || []) as string[],
      serviceConfigs: (row.service_configs ||
        {}) as PackageDraft["serviceConfigs"],
      selectedAddOns: (row.selected_add_ons ||
        {}) as PackageDraft["selectedAddOns"],
      pricing: (row.pricing_summary || {
        currency: "BDT",
        subtotalBDT: 0,
        subtotalUSD: 0,
        rushSurchargeBDT: 0,
        rushSurchargeUSD: 0,
        addOnsTotalBDT: 0,
        addOnsTotalUSD: 0,
        finalBDT: 0,
        finalUSD: 0,
        quoteRequired: false,
        quoteReasons: [],
      }) as PackageDraft["pricing"],
      updatedAt: row.updated_at,
    }));

    return { ok: true, drafts };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load drafts";
    return { ok: false, drafts: [], error: message };
  }
}

export async function deleteDraftAction(
  draftId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: true };
    }

    const { error } = await supabase
      .from("package_drafts")
      .delete()
      .eq("id", draftId)
      .eq("user_id", user.id);

    if (error) {
      console.warn("DB draft delete error:", error.message);
      return { ok: false, error: `Failed to delete draft: ${error.message}` };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete draft";
    return { ok: false, error: message };
  }
}

export async function requestQuoteAction(draft: PackageDraft) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        requiresAuth: true,
        message:
          "Please sign in or create an account to lodge a formal quotation request.",
      };
    }

    // Server-authoritative price recalculation per Directive 10.0 Section 5
    const currency = draft.pricing?.currency || "BDT";
    const [catalogServices, catalogAddOns] = await Promise.all([
      getCatalogServices(),
      getAllAddOns(),
    ]);
    const calculatedPricing = calculatePricingSummary({
      serviceIds: draft.services,
      serviceConfigs: draft.serviceConfigs,
      selectedAddOns: draft.selectedAddOns,
      currency,
      catalogServices,
      catalogAddOns,
      policy: APPROVED_ENTERPRISE_POLICY,
    });

    const quoteRef = `FS-QT-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const { data: quote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        quote_ref: quoteRef,
        client_id: user.id,
        currency: calculatedPricing.currency,
        amount_bdt: calculatedPricing.finalBDT,
        amount_usd: calculatedPricing.finalUSD,
        status: "pending",
        scope_snapshot: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
        notes:
          draft.objective?.notes ||
          "Lodged via 7-Step Signature Package Builder",
      })
      .select()
      .single();

    if (quoteErr || !quote) {
      console.error("Quote insert error:", quoteErr?.message);
      return {
        ok: false,
        error: `Failed to lodge quotation request: ${
          quoteErr?.message || "Database insert error"
        }`,
      };
    }

    // Insert accurate item-level rows per Directive 10.0 Section 5
    for (const sid of draft.services) {
      const srv = catalogServices.find((s) => s.id === sid);
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      const qty = cfg.quantity || 1;
      const rateBDT = (srv?.base_bdt || 0) * qty;
      const rateUSD = (srv?.base_usd || 0) * qty;

      const { error: itemErr } = await supabase.from("quote_items").insert({
        quote_id: quote.id,
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        rate_snapshot_bdt: rateBDT,
        rate_snapshot_usd: rateUSD,
        config: cfg as unknown as Json,
      });

      if (itemErr) {
        console.error(`Quote item insert error for ${sid}:`, itemErr.message);
      }
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      event_type: "QUOTE_REQUESTED",
      details: `Client lodged formal quotation request ${quoteRef} for ${draft.services.length} services`,
      actor_id: user.id,
    });

    return { ok: true, quoteRef, quoteId: quote.id };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process quotation request";
    return { ok: false, error: message };
  }
}

export async function createOrderFromBuilderAction(
  draft: PackageDraft,
  gateway: "sslcommerz" | "stripe" | "sandbox"
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        requiresAuth: true,
        message: "Please sign in or create an account to initiate checkout.",
      };
    }

    // Server-authoritative price recalculation per Directive 10.0 Defect A & Section 3
    const currency = draft.pricing?.currency || "BDT";
    const [catalogServices, catalogAddOns] = await Promise.all([
      getCatalogServices(),
      getAllAddOns(),
    ]);
    const calculatedPricing = calculatePricingSummary({
      serviceIds: draft.services,
      serviceConfigs: draft.serviceConfigs,
      selectedAddOns: draft.selectedAddOns,
      currency,
      catalogServices,
      catalogAddOns,
      policy: APPROVED_ENTERPRISE_POLICY,
    });

    // Gating check: Block direct checkout if quotation is required
    if (calculatedPricing.quoteRequired) {
      return {
        ok: false,
        error: `This package configuration requires a formal studio quotation before order creation: ${calculatedPricing.quoteReasons.join(
          "; "
        )}`,
      };
    }

    // Gate development sandbox adapter in production
    if (gateway === "sandbox" && process.env.NODE_ENV === "production") {
      return {
        ok: false,
        error: "Development sandbox payment adapter is disabled in production.",
      };
    }

    const resolvedGateway: PaymentGateway =
      gateway === "stripe"
        ? "stripe"
        : gateway === "sslcommerz"
        ? "sslcommerz"
        : "dev_test_adapter";

    const orderRef = `FS-ORD-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const finalAmount =
      calculatedPricing.currency === "BDT"
        ? calculatedPricing.finalBDT
        : calculatedPricing.finalUSD;

    // CRITICAL DEFECT A FIX:
    // Initial order state is strictly 'awaiting_payment' (NEVER 'paid').
    // Project is NEVER created here before payment verification.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        client_id: user.id,
        currency: calculatedPricing.currency,
        amount: finalAmount,
        amount_bdt: calculatedPricing.finalBDT,
        amount_usd: calculatedPricing.finalUSD,
        payment_status: "awaiting_payment",
        project_status: "awaiting_brief",
        scope_snapshot: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("Order insert error:", orderErr?.message);
      return {
        ok: false,
        error: `Failed to create order: ${
          orderErr?.message || "Database insert error"
        }`,
      };
    }

    // Insert order items
    for (const sid of draft.services) {
      const srv = catalogServices.find((s) => s.id === sid);
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      const qty = cfg.quantity || 1;
      const rateBDT = (srv?.base_bdt || 0) * qty;
      const rateUSD = (srv?.base_usd || 0) * qty;

      await supabase.from("order_items").insert({
        order_id: order.id,
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        rate_bdt: rateBDT,
        rate_usd: rateUSD,
        config: cfg as unknown as Json,
      });
    }

    // Determine callback slug
    const callbackSlug =
      resolvedGateway === "stripe"
        ? "stripe"
        : resolvedGateway === "sslcommerz"
        ? "sslcommerz"
        : "dev-test";

    // Initiate payment session with payment adapter
    const paymentInit = await initiatePayment(
      {
        orderId: order.id,
        orderRef: order.order_ref,
        amount: finalAmount,
        currency: calculatedPricing.currency,
        customerName:
          user.user_metadata?.full_name ||
          user.email ||
          "Freakin Studio Client",
        customerEmail: user.email || "client@freakinstudio.com",
        customerPhone: user.user_metadata?.phone || "01700000000",
        successUrl: `/api/payments/${callbackSlug}/callback`,
        failUrl: `/api/payments/${callbackSlug}/callback`,
        cancelUrl: `/api/payments/${callbackSlug}/callback`,
        ipnUrl: `/api/payments/${callbackSlug}/callback`,
      },
      resolvedGateway
    );

    if (!paymentInit.success) {
      // Transition order status to failed initiation
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return {
        ok: false,
        error:
          paymentInit.error || "Payment gateway session initiation failed",
      };
    }

    // CRITICAL FIX: Insert unverified payment record (verified: false)
    await supabase.from("payments").insert({
      order_id: order.id,
      gateway: resolvedGateway,
      transaction_ref: paymentInit.transactionRef || order.order_ref,
      amount: order.amount,
      currency: order.currency,
      channel:
        resolvedGateway === "sslcommerz"
          ? "bKash / Card"
          : resolvedGateway === "stripe"
          ? "Card"
          : "Dev Sandbox",
      verified: false,
      verified_at: null,
      payload: {
        status: "initiated",
        redirectUrl: paymentInit.redirectUrl,
        mode: paymentInit.mode,
        initiated_at: new Date().toISOString(),
      } as unknown as Json,
    });

    // Log audit event
    await supabase.from("audit_logs").insert({
      event_type: "ORDER_CREATED",
      details: `Order ${order.order_ref} created awaiting payment verification via ${resolvedGateway} (Tx: ${paymentInit.transactionRef})`,
      actor_id: user.id,
    });

    return {
      ok: true,
      orderRef: order.order_ref,
      orderId: order.id,
      txId: paymentInit.transactionRef,
      redirectUrl: paymentInit.redirectUrl,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to launch order checkout";
    return { ok: false, error: message };
  }
}

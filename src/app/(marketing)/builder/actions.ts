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

    const quoteItemsPayload = draft.services.map((sid) => {
      const srv = catalogServices.find((s) => s.id === sid);
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      const qty = cfg.quantity || 1;
      return {
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        unit_rate_bdt: srv?.base_bdt || 0,
        unit_rate_usd: srv?.base_usd || 0,
        line_total_bdt: (srv?.base_bdt || 0) * qty,
        line_total_usd: (srv?.base_usd || 0) * qty,
        config: cfg,
      };
    });

    // Attempt RPC first (Directive 11.0 Migration 10 trusted transaction)
    const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc(
      "create_quotation_request" as unknown as "create_quotation_request",
      {
        p_client_id: user.id,
        p_currency: calculatedPricing.currency,
        p_amount_bdt: calculatedPricing.finalBDT,
        p_amount_usd: calculatedPricing.finalUSD,
        p_scope: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
        p_items: quoteItemsPayload as unknown as Json,
        p_notes:
          draft.objective?.notes ||
          "Lodged via 7-Step Signature Package Builder",
      }
    );

    if (!rpcErr && rpcRes && (rpcRes as Record<string, unknown>).ok) {
      const parsed = rpcRes as { ok: boolean; quote_id: string; quote_ref: string };
      return { ok: true, quoteRef: parsed.quote_ref, quoteId: parsed.quote_id };
    }

    // Fallback to direct client table operations if RPC not yet deployed
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
      console.error("Quote insert error:", quoteErr?.message || rpcErr?.message);
      return {
        ok: false,
        error: `Failed to lodge quotation request: ${
          quoteErr?.message || rpcErr?.message || "Database insert error"
        }`,
      };
    }

    for (const item of quoteItemsPayload) {
      await supabase.from("quote_items").insert({
        quote_id: quote.id,
        service_id: item.service_id,
        title: item.title,
        quantity: item.quantity,
        rate_snapshot_bdt: item.line_total_bdt,
        rate_snapshot_usd: item.line_total_usd,
        config: item.config as unknown as Json,
      });
    }

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

    const orderItemsPayload = draft.services.map((sid) => {
      const srv = catalogServices.find((s) => s.id === sid);
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      const qty = cfg.quantity || 1;
      return {
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        unit_rate_bdt: srv?.base_bdt || 0,
        unit_rate_usd: srv?.base_usd || 0,
        line_total_bdt: (srv?.base_bdt || 0) * qty,
        line_total_usd: (srv?.base_usd || 0) * qty,
        config: cfg,
      };
    });

    let orderId = "";
    const isTestOrder = resolvedGateway === "dev_test_adapter";

    // Attempt RPC first (Directive 11.0 Migration 10 trusted transaction)
    const { data: rpcOrderRes, error: rpcOrderErr } = await (supabase as any).rpc(
      "create_pending_order" as unknown as "create_pending_order",
      {
        p_client_id: user.id,
        p_quote_id: null,
        p_order_ref: orderRef,
        p_currency: calculatedPricing.currency,
        p_amount: finalAmount,
        p_amount_bdt: calculatedPricing.finalBDT,
        p_amount_usd: calculatedPricing.finalUSD,
        p_scope: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
        p_items: orderItemsPayload as unknown as Json,
        p_is_test: isTestOrder,
      }
    );

    if (!rpcOrderErr && rpcOrderRes && (rpcOrderRes as Record<string, unknown>).ok) {
      orderId = (rpcOrderRes as { order_id: string }).order_id;
    } else {
      // Direct client fallback
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
        console.error("Order insert error:", orderErr?.message || rpcOrderErr?.message);
        return {
          ok: false,
          error: `Failed to create order: ${
            orderErr?.message || rpcOrderErr?.message || "Database insert error"
          }`,
        };
      }

      orderId = order.id;

      for (const item of orderItemsPayload) {
        await supabase.from("order_items").insert({
          order_id: orderId,
          service_id: item.service_id,
          title: item.title,
          quantity: item.quantity,
          rate_bdt: item.line_total_bdt,
          rate_usd: item.line_total_usd,
          config: item.config as unknown as Json,
        });
      }
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
        orderId: orderId,
        orderRef: orderRef,
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
        .eq("id", orderId);

      return {
        ok: false,
        error:
          paymentInit.error || "Payment gateway session initiation failed",
      };
    }

    // CRITICAL FIX: Insert unverified payment record (verified: false)
    await supabase.from("payments").insert({
      order_id: orderId,
      gateway: resolvedGateway,
      transaction_ref: paymentInit.transactionRef || orderRef,
      amount: finalAmount,
      currency: calculatedPricing.currency,
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
      details: `Order ${orderRef} created awaiting payment verification via ${resolvedGateway} (Tx: ${paymentInit.transactionRef})`,
      actor_id: user.id,
    });

    return {
      ok: true,
      orderRef: orderRef,
      orderId: orderId,
      txId: paymentInit.transactionRef,
      redirectUrl: paymentInit.redirectUrl,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to launch order checkout";
    return { ok: false, error: message };
  }
}

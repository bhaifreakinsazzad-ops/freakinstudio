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
      evaluationDate: new Date(),
      policy: APPROVED_ENTERPRISE_POLICY,
    });

    const quoteItemsPayload = draft.services.map((sid) => {
      const srv = catalogServices.find((s) => s.id === sid);
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      const qty = cfg.quantity || 1;
      const addOnIds = draft.selectedAddOns[sid] || [];
      return {
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        config: cfg,
        addOnIds,
      };
    });

    // Execute trusted quotation RPC (Migration 014)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      "create_quotation_request",
      {
        p_client_id: user.id,
        p_currency: calculatedPricing.currency,
        p_scope: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
        p_items: quoteItemsPayload as unknown as Json,
        p_terms_accepted: true,
      }
    );

    const parsed = rpcRes as {
      ok?: boolean;
      quote_id?: string;
      quote_ref?: string;
      error?: string;
    } | null;

    if (rpcErr || !parsed?.ok || !parsed.quote_id || !parsed.quote_ref) {
      console.error("Trusted create_quotation_request RPC failed:", rpcErr?.message || parsed?.error);
      return {
        ok: false,
        error: `Database quotation service unavailable: ${
          rpcErr?.message || parsed?.error || "Trusted transaction procedure not ready."
        }. Your package draft has been preserved.`,
      };
    }

    return { ok: true, quoteRef: parsed.quote_ref, quoteId: parsed.quote_id };
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
      evaluationDate: new Date(),
      policy: APPROVED_ENTERPRISE_POLICY,
    });

    if (calculatedPricing.quoteRequired) {
      return {
        ok: false,
        error: `This package configuration requires a formal studio quotation before order creation: ${calculatedPricing.quoteReasons.join(
          "; "
        )}`,
      };
    }

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
      const addOnIds = draft.selectedAddOns[sid] || [];
      return {
        service_id: sid,
        title: srv?.title || `Service ${sid}`,
        quantity: qty,
        config: cfg,
        addOnIds,
      };
    });

    const isTestOrder = resolvedGateway === "dev_test_adapter";

    const { data: rpcOrderRes, error: rpcOrderErr } = await supabase.rpc(
      "create_pending_order",
      {
        p_client_id: user.id,
        p_quote_id: null,
        p_order_ref: orderRef,
        p_currency: calculatedPricing.currency,
        p_scope: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: calculatedPricing,
        } as unknown as Json,
        p_items: orderItemsPayload as unknown as Json,
        p_is_test: isTestOrder,
        p_gateway: resolvedGateway,
      }
    );

    const parsedOrder = rpcOrderRes as {
      ok?: boolean;
      order_id?: string;
      error?: string;
    } | null;

    if (rpcOrderErr || !parsedOrder?.ok || !parsedOrder.order_id) {
      console.error("Trusted create_pending_order RPC failed:", rpcOrderErr?.message || parsedOrder?.error);
      return {
        ok: false,
        error: `Database order transaction service unavailable: ${
          rpcOrderErr?.message || parsedOrder?.error || "Trusted procedure not ready."
        }. Checkout blocked to preserve commercial integrity.`,
      };
    }

    const orderId = parsedOrder.order_id;
    const callbackSlug =
      resolvedGateway === "stripe"
        ? "stripe"
        : resolvedGateway === "sslcommerz"
        ? "sslcommerz"
        : "dev-test";

    const paymentInit = await initiatePayment(
      {
        orderId,
        orderRef,
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
      return {
        ok: false,
        error:
          paymentInit.error || "Payment gateway session initiation failed",
      };
    }

    return {
      ok: true,
      orderRef,
      orderId,
      txId: paymentInit.transactionRef,
      redirectUrl: paymentInit.redirectUrl,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to launch order checkout";
    return { ok: false, error: message };
  }
}

export async function submitPackageAction(input: {
  serviceIds: string[];
  serviceConfigs: PackageDraft["serviceConfigs"];
  selectedAddOns: PackageDraft["selectedAddOns"];
  brief: {
    brandName: string;
    objective: string;
    audience: string;
    platforms: string;
  };
  currency: "BDT" | "USD";
  gateway: "sslcommerz" | "stripe" | "manual_bank";
  intent: "checkout" | "quote";
}): Promise<{
  ok: boolean;
  requiresAuth?: boolean;
  error?: string;
  redirectUrl?: string;
  quoteRef?: string;
  orderRef?: string;
}> {
  const [catalogServices, catalogAddOns] = await Promise.all([
    getCatalogServices(),
    getAllAddOns(),
  ]);
  const pricing = calculatePricingSummary({
    serviceIds: input.serviceIds,
    serviceConfigs: input.serviceConfigs,
    selectedAddOns: input.selectedAddOns,
    currency: input.currency,
    catalogServices,
    catalogAddOns,
    evaluationDate: new Date(),
    policy: APPROVED_ENTERPRISE_POLICY,
  });

  const draft: PackageDraft = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    objective: input.brief,
    services: input.serviceIds,
    serviceConfigs: input.serviceConfigs,
    selectedAddOns: input.selectedAddOns,
    pricing,
  };

  if (input.intent === "quote" || pricing.quoteRequired) {
    const res = await requestQuoteAction(draft);
    return {
      ok: res.ok,
      requiresAuth: res.requiresAuth,
      error: res.error || res.message,
      quoteRef: res.quoteRef,
      redirectUrl: res.ok ? "/dashboard" : undefined,
    };
  }

  const mappedGateway =
    input.gateway === "stripe"
      ? "stripe"
      : input.gateway === "sslcommerz"
      ? "sslcommerz"
      : "sandbox";

  const orderRes = await createOrderFromBuilderAction(draft, mappedGateway);
  return {
    ok: orderRes.ok,
    requiresAuth: orderRes.requiresAuth,
    error: orderRes.error || orderRes.message,
    orderRef: orderRes.orderRef,
    redirectUrl: orderRes.redirectUrl,
  };
}



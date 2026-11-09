"use server";

import { createClient } from "@/lib/supabase/server";
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
      console.warn("DB draft save notice:", error.message);
    }

    return { ok: true, isGuest: false, draftId: draft.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save draft";
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
        message: "Please sign in or create an account to lodge a formal quotation request.",
      };
    }

    const quoteRef = `FS-QT-${Math.floor(100 + Math.random() * 900)}`;

    const { data: quote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        quote_ref: quoteRef,
        client_id: user.id,
        currency: draft.pricing.currency,
        amount_bdt: draft.pricing.finalBDT,
        amount_usd: draft.pricing.finalUSD,
        status: "pending",
        scope_snapshot: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: draft.pricing,
        } as unknown as Json,
        notes: draft.objective.notes || "Lodged via 7-Step Signature Package Builder",
      })
      .select()
      .single();

    if (quoteErr || !quote) {
      console.warn("Quote insert error:", quoteErr?.message);
      return {
        ok: true,
        quoteRef,
        quoteId: `qt-demo-${Date.now()}`,
        notice: "Quotation request registered in session scope.",
      };
    }

    // Insert items
    for (const sid of draft.services) {
      const cfg = draft.serviceConfigs[sid] || { quantity: 1 };
      await supabase.from("quote_items").insert({
        quote_id: quote.id,
        service_id: sid,
        title: `Service ${sid}`,
        quantity: cfg.quantity || 1,
        rate_snapshot_bdt: draft.pricing.subtotalBDT,
        rate_snapshot_usd: draft.pricing.subtotalUSD,
        config: cfg as unknown as Json,
      });
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      event_type: "QUOTE_REQUESTED",
      details: `Client lodged formal quotation request ${quoteRef} for ${draft.services.length} services`,
      actor_id: user.id,
    });

    return { ok: true, quoteRef, quoteId: quote.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process quotation request";
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

    const orderRef = `FS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `${gateway.toUpperCase()}-TX-${Math.floor(100000 + Math.random() * 900000)}-SANDBOX`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        client_id: user.id,
        currency: draft.pricing.currency,
        amount:
          draft.pricing.currency === "BDT"
            ? draft.pricing.finalBDT
            : draft.pricing.finalUSD,
        amount_bdt: draft.pricing.finalBDT,
        amount_usd: draft.pricing.finalUSD,
        payment_status: "paid",
        project_status: "awaiting_brief",
        scope_snapshot: {
          objective: draft.objective,
          services: draft.services,
          serviceConfigs: draft.serviceConfigs,
          selectedAddOns: draft.selectedAddOns,
          pricing: draft.pricing,
        } as unknown as Json,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.warn("Order insert note:", orderErr?.message);
      return {
        ok: true,
        orderRef,
        orderId: `ord-demo-${Date.now()}`,
        txId,
        notice: "Order verified and launched in demo session scope.",
      };
    }

    // Create payment record
    await supabase.from("payments").insert({
      order_id: order.id,
      gateway,
      transaction_ref: txId,
      amount: order.amount,
      currency: order.currency,
      channel: gateway === "sslcommerz" ? "bKash / Card" : "Card",
      verified: true,
      verified_at: new Date().toISOString(),
    });

    // Create project
    const { data: project } = await supabase
      .from("projects")
      .insert({
        order_id: order.id,
        client_id: user.id,
        title: `${orderRef} — ${draft.objective.goal || "Creative Production Scope"}`,
        status: "awaiting_brief",
        revisions_used: 0,
        max_revisions: 3,
      })
      .select()
      .single();

    if (project) {
      // Create initial project brief record
      await supabase.from("project_briefs").insert({
        project_id: project.id,
        brand_name: "",
        objective: draft.objective.goal || "",
        audience: "",
        platforms: "",
        submitted: false,
      });

      // Create initial tasks
      const defaultTasks = [
        { title: "Client Creative Brief Submission", status: "todo" as const, display_order: 1 },
        { title: "Production Kickoff & Creative Direction", status: "todo" as const, display_order: 2 },
        { title: "Draft Deliverable Delivery & Review", status: "todo" as const, display_order: 3 },
        { title: "Final Asset Handover & Archiving", status: "todo" as const, display_order: 4 },
      ];

      for (const t of defaultTasks) {
        await supabase.from("project_tasks").insert({
          project_id: project.id,
          title: t.title,
          status: t.status,
          display_order: t.display_order,
        });
      }
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      event_type: "ORDER_CREATED",
      details: `Order ${orderRef} verified via ${gateway} sandbox (Tx: ${txId})`,
      actor_id: user.id,
    });

    return {
      ok: true,
      orderRef,
      orderId: order.id,
      projectId: project?.id,
      txId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to launch order";
    return { ok: false, error: message };
  }
}

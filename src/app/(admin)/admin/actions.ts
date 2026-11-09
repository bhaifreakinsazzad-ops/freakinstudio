"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/permissions/roles";
import type { PricingStatus } from "@/types/domain";

async function verifyAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized: Sign in required", user: null, supabase };
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr || !profile || !isAdminRole(profile.role)) {
    return {
      authorized: false,
      error: "Forbidden: Administrative access required",
      user: null,
      supabase,
    };
  }

  return { authorized: true, error: null, user, supabase };
}

export async function updateProjectStatusAction(
  projectId: string,
  newStatus: string
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const { error } = await auth.supabase
      .from("projects")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      return { ok: false, error: `Failed to update project status: ${error.message}` };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "ADMIN_PROJECT_STATUS_CHANGE",
      details: `Admin changed project ${projectId} status to ${newStatus}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status update failed";
    return { ok: false, error: msg };
  }
}

export async function updateServicePricingAction(
  serviceId: string,
  updates: {
    base_bdt?: number;
    base_usd?: number;
    pricing_status?: PricingStatus;
  }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    // Validate positive numbers if provided
    if (updates.base_bdt !== undefined && updates.base_bdt <= 0) {
      return { ok: false, error: "base_bdt must be a positive number" };
    }
    if (updates.base_usd !== undefined && updates.base_usd <= 0) {
      return { ok: false, error: "base_usd must be a positive number" };
    }

    const { error } = await auth.supabase
      .from("services")
      .update(updates)
      .eq("id", serviceId);

    if (error) {
      return { ok: false, error: `Failed to update service pricing: ${error.message}` };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "ADMIN_SERVICE_PRICING_UPDATED",
      details: `Admin updated pricing parameters for service ${serviceId}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/services");
    revalidatePath("/builder");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Service update failed";
    return { ok: false, error: msg };
  }
}

export async function issueQuoteAction(
  quoteId: string,
  approvedAmountBdt: number,
  approvedAmountUsd: number,
  adminNotes?: string
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    if (approvedAmountBdt <= 0 || approvedAmountUsd <= 0) {
      return { ok: false, error: "Approved quotation amounts must be greater than zero" };
    }

    const { error } = await auth.supabase
      .from("quotes")
      .update({
        status: "issued",
        amount_bdt: approvedAmountBdt,
        amount_usd: approvedAmountUsd,
        admin_notes: adminNotes || "Formal approved quotation issued by Studio Operations",
        issued_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    if (error) {
      return { ok: false, error: `Failed to issue quotation: ${error.message}` };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "QUOTE_ISSUED",
      details: `Admin issued approved quotation ${quoteId} (৳ ${approvedAmountBdt} / $ ${approvedAmountUsd})`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Quote issuance failed";
    return { ok: false, error: msg };
  }
}

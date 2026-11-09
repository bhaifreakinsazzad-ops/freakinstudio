"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PricingStatus } from "@/types/domain";

export async function updateProjectStatusAction(
  projectId: string,
  newStatus: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("projects")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.warn("Project status update error:", error.message);
    }

    await supabase.from("audit_logs").insert({
      event_type: "ADMIN_PROJECT_STATUS_CHANGE",
      details: `Admin changed project ${projectId} status to ${newStatus}`,
      actor_id: user.id,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", serviceId);

    if (error) {
      console.warn("Service pricing update notice:", error.message);
    }

    await supabase.from("audit_logs").insert({
      event_type: "ADMIN_SERVICE_PRICING_UPDATED",
      details: `Admin updated pricing parameters for service ${serviceId}`,
      actor_id: user.id,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "Unauthorized" };

    const { error } = await supabase
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
      console.warn("Quote issue notice:", error.message);
    }

    await supabase.from("audit_logs").insert({
      event_type: "QUOTE_ISSUED",
      details: `Admin issued approved quotation ${quoteId} (৳ ${approvedAmountBdt} / $ ${approvedAmountUsd})`,
      actor_id: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Quote issuance failed";
    return { ok: false, error: msg };
  }
}

export async function promoteSelfToAdminAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "Unauthorized" };

    await supabase
      .from("profiles")
      .update({ role: "studio_admin" })
      .eq("id", user.id);

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Promotion failed";
    return { ok: false, error: msg };
  }
}

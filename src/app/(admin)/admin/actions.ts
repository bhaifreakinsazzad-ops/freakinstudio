"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { isAdminRole } from "@/lib/permissions/roles";
import type { PricingStatus } from "@/types/domain";

const VALID_DB_PROJECT_STATUSES = new Set([
  "awaiting_brief",
  "brief_submitted",
  "in_production",
  "client_review",
  "revision_requested",
  "revision_in_progress",
  "client_approved",
  "completed",
  "cancelled",
]);

const PROJECT_TRANSITIONS: Record<string, string[]> = {
  awaiting_brief: ["brief_submitted", "in_production", "cancelled"],
  brief_submitted: ["in_production", "client_review", "cancelled"],
  in_production: ["client_review", "completed", "cancelled"],
  client_review: [
    "revision_requested",
    "revision_in_progress",
    "client_approved",
    "in_production",
    "cancelled",
  ],
  revision_requested: ["revision_in_progress", "in_production", "client_review", "cancelled"],
  revision_in_progress: ["client_review", "in_production", "cancelled"],
  client_approved: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

async function verifyAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      error: "Unauthorized: Sign in required",
      user: null,
      supabase,
    };
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

    if (!VALID_DB_PROJECT_STATUSES.has(newStatus)) {
      return {
        ok: false,
        error: `Invalid project status "${newStatus}". Must conform to production state machine.`,
      };
    }

    const { data: existing, error: fetchErr } = await auth.supabase
      .from("projects")
      .select("id, status, title")
      .eq("id", projectId)
      .single();

    if (fetchErr || !existing) {
      return { ok: false, error: "Target project not found." };
    }

    if (existing.status === newStatus) {
      return { ok: true };
    }

    const allowedNext = PROJECT_TRANSITIONS[existing.status] ?? [];
    if (!allowedNext.includes(newStatus)) {
      return {
        ok: false,
        error: `Transition from "${existing.status}" to "${newStatus}" is blocked by workflow state machine.`,
      };
    }

    const { error } = await auth.supabase
      .from("projects")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      return {
        ok: false,
        error: `Failed to update project status: ${error.message}`,
      };
    }

    await auth.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "human_expert",
      actor_id: auth.user.id,
      event_type: "STAGE_TRANSITION",
      state_before: existing.status,
      state_after: newStatus,
      visibility: "client",
      summary: `Studio Lead transitioned project stage: ${existing.status} -> ${newStatus}.`,
    });

    await auth.supabase.from("audit_logs").insert({
      event_type: "ADMIN_PROJECT_STATUS_CHANGE",
      details: `Admin changed project ${projectId} (${existing.title}) status ${existing.status} -> ${newStatus}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status update failed";
    return { ok: false, error: msg };
  }
}

export async function assignProjectStaffAction(
  projectId: string,
  updates: {
    assignedPmId?: string | null;
    assignedDesignerId?: string | null;
    expressSlotConfirmed?: boolean;
  }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const patch: {
      assigned_pm_id?: string | null;
      assigned_designer_id?: string | null;
      assigned_to?: string | null;
      express_slot_confirmed?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (updates.assignedPmId !== undefined) {
      patch.assigned_pm_id = updates.assignedPmId || null;
      patch.assigned_to = updates.assignedPmId || null;
    }
    if (updates.assignedDesignerId !== undefined) {
      patch.assigned_designer_id = updates.assignedDesignerId || null;
    }
    if (updates.expressSlotConfirmed !== undefined) {
      patch.express_slot_confirmed = updates.expressSlotConfirmed;
    }

    const { error } = await auth.supabase
      .from("projects")
      .update(patch)
      .eq("id", projectId);

    if (error) {
      return { ok: false, error: `Assignment update failed: ${error.message}` };
    }

    await auth.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "human_expert",
      actor_id: auth.user.id,
      event_type: "HUMAN_ASSIGNMENT_UPDATED",
      visibility: "client",
      summary:
        updates.expressSlotConfirmed !== undefined
          ? `Studio operations updated specialist assignment & Express Slot confirmation (${updates.expressSlotConfirmed ? "CONFIRMED" : "UNCONFIRMED"}).`
          : "Studio operations updated assigned human project specialists.",
    });

    await auth.supabase.from("audit_logs").insert({
      event_type: "PROJECT_STAFF_ASSIGNED",
      details: `Updated assignment/slot on project ${projectId}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Assignment failed",
    };
  }
}

export async function addProjectEventAction(
  projectId: string,
  payload: {
    actorKind: "human_expert" | "si_assistant";
    eventType: string;
    summary: string;
    visibility: "client" | "studio_internal";
  }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const cleanSummary = payload.summary.trim();
    if (cleanSummary.length < 3) {
      return { ok: false, error: "Event summary must be at least 3 characters." };
    }

    const isSi = payload.actorKind === "si_assistant";
    const { data, error } = await auth.supabase
      .from("project_events")
      .insert({
        project_id: projectId,
        actor_kind: payload.actorKind,
        actor_id: auth.user.id,
        event_type: payload.eventType.trim() || (isSi ? "SI_DRAFT_NOTE" : "HUMAN_PRODUCTION_UPDATE"),
        si_status: isSi ? "suggested" : null,
        visibility: isSi ? "studio_internal" : payload.visibility,
        summary: cleanSummary,
      })
      .select(
        "id, project_id, actor_kind, actor_id, event_type, state_before, state_after, artifact_id, si_status, visibility, summary, created_at"
      )
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Failed to record project event." };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: isSi ? "SI_PROPOSAL_LOGGED" : "HUMAN_PROJECT_EVENT_LOGGED",
      details: `Recorded ${payload.actorKind} event on project ${projectId}: ${cleanSummary.slice(0, 120)}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, event: data };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to log project event",
    };
  }
}

export async function reviewSiProposalAction(
  eventId: string,
  decision: "human_approved" | "rejected"
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const { data: existing, error: fetchErr } = await auth.supabase
      .from("project_events")
      .select("id, project_id, actor_kind, summary")
      .eq("id", eventId)
      .single();

    if (fetchErr || !existing) {
      return { ok: false, error: "SI proposal event not found." };
    }

    if (existing.actor_kind !== "si_assistant") {
      return { ok: false, error: "Only SI assistant proposals require approval gating." };
    }

    const { error } = await auth.supabase
      .from("project_events")
      .update({
        si_status: decision,
        visibility: decision === "human_approved" ? "client" : "studio_internal",
      })
      .eq("id", eventId);

    if (error) {
      return { ok: false, error: error.message };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "SI_PROPOSAL_REVIEWED",
      details: `Admin marked SI proposal ${eventId} as ${decision}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath(`/dashboard/projects/${existing.project_id}`);
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "SI proposal review failed",
    };
  }
}

export async function registerProjectProofAssetAction(formData: FormData) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const projectId = String(formData.get("projectId") || "").trim();
    const versionLabel = String(formData.get("versionLabel") || "v1").trim() || "v1";
    const isSourceFile = formData.get("isSourceFile") === "true";
    const revisionRoundRaw = Number(formData.get("revisionRound") || 0);
    const revisionRound = Number.isFinite(revisionRoundRaw) && revisionRoundRaw >= 0 ? Math.floor(revisionRoundRaw) : 0;
    const file = formData.get("file");

    if (!projectId || !(file instanceof File) || file.size <= 0) {
      return {
        ok: false,
        error: "Project ID and a non-empty deliverable file are required.",
      };
    }

    if (file.size > 25 * 1024 * 1024) {
      return { ok: false, error: "File size exceeds 25 MB upload limit." };
    }

    const privileged = createPrivilegedClient();
    if (!privileged) {
      return {
        ok: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY is missing. Storage upload to private bucket 'project-assets' requires server-side credentials.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    const storagePath = `projects/${projectId}/${Date.now()}-${safeName}`;

    const { error: uploadErr } = await privileged.storage
      .from("project-assets")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      return {
        ok: false,
        error: `Storage upload failed: ${uploadErr.message}`,
      };
    }

    const { data: assetRow, error: insertErr } = await auth.supabase
      .from("project_assets")
      .insert({
        project_id: projectId,
        version_label: versionLabel,
        revision_round: revisionRound,
        file_name: safeName,
        storage_path: storagePath,
        content_type: file.type || "application/octet-stream",
        file_size_bytes: file.size,
        sha256,
        is_source_file: isSourceFile,
        is_approved: false,
        uploaded_by: auth.user.id,
      })
      .select("id")
      .single();

    if (insertErr || !assetRow) {
      return {
        ok: false,
        error: `Asset record failed: ${insertErr?.message || "Unknown DB error"}`,
      };
    }

    await auth.supabase
      .from("projects")
      .update({
        status: "client_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    await auth.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "human_expert",
      actor_id: auth.user.id,
      event_type: "PROOF_UPLOADED",
      state_after: "client_review",
      artifact_id: assetRow.id,
      visibility: "client",
      summary: `Studio uploaded ${versionLabel} (${safeName}) for client proofing (SHA-256 ${sha256.slice(0, 12)}…).`,
    });

    await auth.supabase.from("audit_logs").insert({
      event_type: "PROJECT_PROOF_UPLOADED",
      details: `Uploaded ${safeName} (${versionLabel}) to project ${projectId}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, assetId: assetRow.id, sha256 };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Asset upload failed",
    };
  }
}

export async function updateInquiryStatusAction(
  inquiryId: string,
  status: "new" | "reviewing" | "quoted" | "converted" | "archived"
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    const { error } = await auth.supabase
      .from("inquiries")
      .update({
        status,
        assigned_to: auth.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId);

    if (error) {
      return { ok: false, error: `Inquiry update failed: ${error.message}` };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "INQUIRY_STATUS_UPDATED",
      details: `Updated inquiry ${inquiryId} status to ${status}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Inquiry update failed",
    };
  }
}

export async function updateAiGatewayConfigAction(input: {
  killSwitchActive: boolean;
  dailyBudgetCapBdt: number;
  guestDailyQuota: number;
}) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    if (
      !Number.isFinite(input.dailyBudgetCapBdt) ||
      input.dailyBudgetCapBdt < 0 ||
      !Number.isFinite(input.guestDailyQuota) ||
      input.guestDailyQuota < 0
    ) {
      return { ok: false, error: "Budget cap and guest quota must be non-negative numbers." };
    }

    const { error } = await auth.supabase.from("ai_gateway_config").upsert({
      id: "default",
      kill_switch_active: input.killSwitchActive,
      daily_budget_cap_bdt: Math.round(input.dailyBudgetCapBdt),
      guest_daily_quota: Math.floor(input.guestDailyQuota),
      updated_by: auth.user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { ok: false, error: `AI Gateway update failed: ${error.message}` };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "AI_GATEWAY_CONFIG_UPDATED",
      details: `KillSwitch=${input.killSwitchActive}, Cap=৳${input.dailyBudgetCapBdt}, GuestQuota=${input.guestDailyQuota}`,
      actor_id: auth.user.id,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save AI Gateway settings",
    };
  }
}

export async function updateServicePricingAction(
  serviceId: string,
  updates: {
    base_bdt?: number;
    base_usd?: number;
    pricing_status?: PricingStatus;
    ratebook_approved?: boolean;
  }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return { ok: false, error: auth.error || "Forbidden" };
    }

    if (updates.base_bdt !== undefined && updates.base_bdt <= 0) {
      return { ok: false, error: "base_bdt must be a positive number" };
    }
    if (updates.base_usd !== undefined && updates.base_usd <= 0) {
      return { ok: false, error: "base_usd must be a positive number" };
    }

    const shouldApprove =
      updates.pricing_status === "approved" && updates.ratebook_approved === true;

    const { error } = await auth.supabase
      .from("services")
      .update({
        ...(updates.base_bdt !== undefined ? { base_bdt: updates.base_bdt } : {}),
        ...(updates.base_usd !== undefined ? { base_usd: updates.base_usd } : {}),
        ...(updates.pricing_status !== undefined
          ? { pricing_status: updates.pricing_status }
          : {}),
        ...(updates.ratebook_approved !== undefined
          ? { ratebook_approved: updates.ratebook_approved }
          : {}),
        price_approved_at: shouldApprove ? new Date().toISOString() : null,
        price_approved_by: shouldApprove ? auth.user.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId);

    if (error) {
      return {
        ok: false,
        error: `Failed to update service pricing: ${error.message}`,
      };
    }

    await auth.supabase.from("audit_logs").insert({
      event_type: "ADMIN_SERVICE_PRICING_UPDATED",
      details: `Admin updated ratebook entry for ${serviceId} (approved=${shouldApprove})`,
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
      return {
        ok: false,
        error: "Approved quotation amounts must be greater than zero",
      };
    }

    const { data: existingQuote, error: fetchErr } = await auth.supabase
      .from("quotes")
      .select("id, status")
      .eq("id", quoteId)
      .single();

    if (fetchErr || !existingQuote) {
      return { ok: false, error: "Quotation record not found." };
    }

    if (!["pending", "under_review", "issued"].includes(existingQuote.status)) {
      return {
        ok: false,
        error: `Cannot re-issue quote in terminal status "${existingQuote.status}".`,
      };
    }

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await auth.supabase
      .from("quotes")
      .update({
        status: "issued",
        amount_bdt: approvedAmountBdt,
        amount_usd: approvedAmountUsd,
        admin_notes:
          adminNotes?.trim() ||
          "Formal approved quotation issued by Studio Operations",
        issued_at: new Date().toISOString(),
        issued_by: auth.user.id,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    if (error) {
      return {
        ok: false,
        error: `Failed to issue quotation: ${error.message}`,
      };
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

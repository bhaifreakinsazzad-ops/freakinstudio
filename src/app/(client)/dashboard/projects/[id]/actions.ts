"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/permissions/roles";

async function verifyProjectAccess(projectId: string, requireOwnerOnly = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required",
      user: null,
      project: null,
      supabase,
      isOwner: false,
      isAdmin: false,
    };
  }

  const { data: project, error: prjErr } = await supabase
    .from("projects")
    .select(
      "id, client_id, assigned_pm_id, assigned_designer_id, assigned_to, status, revisions_used, max_revisions, title, order_id"
    )
    .eq("id", projectId)
    .single();

  if (prjErr || !project) {
    return {
      authorized: false,
      error: "Project not found",
      user,
      project: null,
      supabase,
      isOwner: false,
      isAdmin: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile ? isAdminRole(profile.role) : false;
  const isOwner = project.client_id === user.id;
  const isAssignedStaff =
    project.assigned_pm_id === user.id ||
    project.assigned_designer_id === user.id ||
    project.assigned_to === user.id;

  if (requireOwnerOnly) {
    if (!isOwner && !isAdmin) {
      return {
        authorized: false,
        error: "Forbidden: Only the project owner or Studio Admin can perform this action",
        user,
        project,
        supabase,
        isOwner,
        isAdmin,
      };
    }
  } else if (!isOwner && !isAssignedStaff && !isAdmin) {
    return {
      authorized: false,
      error: "Forbidden: Access denied to project workspace",
      user,
      project,
      supabase,
      isOwner,
      isAdmin,
    };
  }

  return {
    authorized: true,
    error: null,
    user,
    project,
    supabase,
    isOwner,
    isAdmin,
  };
}

export async function submitBriefAction(
  projectId: string,
  formData: {
    brandName: string;
    objective: string;
    audience: string;
    platforms: string;
  }
) {
  try {
    const access = await verifyProjectAccess(projectId, true);
    if (!access.authorized || !access.user || !access.project) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    if (!formData.brandName.trim() || !formData.objective.trim()) {
      return {
        ok: false,
        error: "Brand name and project objective are required fields.",
      };
    }

    const { data: rpcRes, error: rpcErr } = await access.supabase.rpc(
      "submit_project_brief",
      {
        p_project_id: projectId,
        p_brand_name: formData.brandName.trim(),
        p_objective: formData.objective.trim(),
        p_audience: formData.audience.trim(),
        p_platforms: formData.platforms.trim(),
        p_answers: {},
      }
    );

    const parsed = rpcRes as { ok?: boolean; error?: string } | null;
    if (rpcErr || !parsed?.ok) {
      return {
        ok: false,
        error:
          rpcErr?.message ||
          parsed?.error ||
          "Failed to submit creative brief to database.",
      };
    }

    await access.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "client",
      actor_id: access.user.id,
      event_type: "BRIEF_SUBMITTED",
      state_before: access.project.status,
      state_after: "brief_submitted",
      visibility: "client",
      summary: `Client submitted onboarding creative brief for "${formData.brandName.trim()}".`,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to submit brief";
    return { ok: false, error: message };
  }
}

export async function addPinAnnotationAction(
  projectId: string,
  assetId: string,
  data: {
    coordX: number;
    coordY: number;
    feedbackText: string;
  }
) {
  try {
    const access = await verifyProjectAccess(projectId, false);
    if (!access.authorized || !access.user || !access.project) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    if (!assetId || assetId === "asset-master") {
      return {
        ok: false,
        error: "Pins can only be attached to an uploaded studio proof asset.",
      };
    }

    if (!data.feedbackText.trim()) {
      return { ok: false, error: "Annotation feedback text cannot be empty." };
    }

    const { data: asset, error: assetErr } = await access.supabase
      .from("project_assets")
      .select("id, project_id, version_label")
      .eq("id", assetId)
      .single();

    if (assetErr || !asset || asset.project_id !== projectId) {
      return {
        ok: false,
        error: "Target creative asset does not exist on this project.",
      };
    }

    const x = Math.min(100, Math.max(0, Math.round(data.coordX)));
    const y = Math.min(100, Math.max(0, Math.round(data.coordY)));

    const { data: annotation, error } = await access.supabase
      .from("asset_annotations")
      .insert({
        asset_id: assetId,
        coord_x_percent: x,
        coord_y_percent: y,
        feedback_text: data.feedbackText.trim(),
        created_by: access.user.id,
      })
      .select()
      .single();

    if (error || !annotation) {
      return {
        ok: false,
        error: error?.message || "Failed to save annotation to database.",
      };
    }

    await access.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: access.isAdmin ? "human_expert" : "client",
      actor_id: access.user.id,
      event_type: "PIN_ANNOTATION_ADDED",
      artifact_id: assetId,
      visibility: "client",
      summary: `Pinned proofing feedback on ${asset.version_label} at (${x}%, ${y}%).`,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, annotation };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to record feedback pin";
    return { ok: false, error: message };
  }
}

export async function requestRevisionAction(
  projectId: string,
  instructions: string
) {
  try {
    const access = await verifyProjectAccess(projectId, true);
    if (!access.authorized || !access.user || !access.project) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    if (!instructions.trim()) {
      return { ok: false, error: "Revision instructions cannot be empty." };
    }

    const used = access.project.revisions_used ?? 0;
    const max = access.project.max_revisions ?? 2;

    if (used >= max) {
      return {
        ok: false,
        error: `Scope revision quota reached (${used}/${max} rounds used). Contact your studio project manager to issue an extended revision change order.`,
      };
    }

    const newUsed = used + 1;

    const { error: prjUpdateErr } = await access.supabase
      .from("projects")
      .update({
        status: "revision_requested",
        revisions_used: newUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (prjUpdateErr) {
      return {
        ok: false,
        error: `Failed to update revision counter: ${prjUpdateErr.message}`,
      };
    }

    await access.supabase.from("project_tasks").insert({
      project_id: projectId,
      title: `Revision Round #${newUsed}: ${instructions.slice(0, 50)}`,
      description: instructions.trim(),
      status: "todo",
      display_order: 10 + newUsed,
    });

    await access.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "client",
      actor_id: access.user.id,
      event_type: "REVISION_REQUESTED",
      state_before: access.project.status,
      state_after: "revision_requested",
      visibility: "client",
      summary: `Client requested Revision Round #${newUsed}/${max}: ${instructions.trim().slice(0, 140)}`,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, revisionsUsed: newUsed, maxRevisions: max };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to request revision";
    return { ok: false, error: message };
  }
}

export async function approveProjectAction(
  projectId: string,
  assetId?: string,
  notes?: string
) {
  try {
    const access = await verifyProjectAccess(projectId, true);
    if (!access.authorized || !access.user || !access.project) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    let targetAssetId = assetId;
    if (!targetAssetId) {
      const { data: latestAsset } = await access.supabase
        .from("project_assets")
        .select("id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      targetAssetId = latestAsset?.id;
    }

    if (!targetAssetId) {
      return {
        ok: false,
        error:
          "No studio proof deliverable asset has been uploaded yet. Final sign-off unlocks once the studio uploads Proof v1.",
      };
    }

    const { data: rpcRes, error: rpcErr } = await access.supabase.rpc(
      "approve_project_asset",
      {
        p_project_id: projectId,
        p_asset_id: targetAssetId,
        p_terms_accepted: true,
        p_notes: notes || "Approved via Client Portal Creative Review Canvas",
      }
    );

    const parsed = rpcRes as { ok?: boolean; error?: string } | null;
    if (rpcErr || !parsed?.ok) {
      return {
        ok: false,
        error:
          rpcErr?.message ||
          parsed?.error ||
          "Failed to register asset approval in database.",
      };
    }

    await access.supabase.from("project_events").insert({
      project_id: projectId,
      actor_kind: "client",
      actor_id: access.user.id,
      event_type: "CLIENT_APPROVED",
      state_before: access.project.status,
      state_after: "client_approved",
      artifact_id: targetAssetId,
      visibility: "client",
      summary: "Client accepted commercial terms and signed off final master deliverables.",
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to approve project";
    return { ok: false, error: message };
  }
}

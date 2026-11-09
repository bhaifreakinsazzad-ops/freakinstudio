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
    return { authorized: false, error: "Authentication required", user: null, project: null, supabase };
  }

  const { data: project, error: prjErr } = await supabase
    .from("projects")
    .select("id, client_id, status, revisions_used, max_revisions, title, order_id")
    .eq("id", projectId)
    .single();

  if (prjErr || !project) {
    return { authorized: false, error: "Project not found", user, project: null, supabase };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile ? isAdminRole(profile.role) : false;
  const isOwner = project.client_id === user.id;

  if (requireOwnerOnly) {
    if (!isOwner && !isAdmin) {
      return { authorized: false, error: "Forbidden: Only the project owner can perform this action", user, project, supabase };
    }
  } else {
    if (!isOwner && !isAdmin) {
      return { authorized: false, error: "Forbidden: Access denied to project workspace", user, project, supabase };
    }
  }

  return { authorized: true, error: null, user, project, supabase, isOwner, isAdmin };
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
      return { ok: false, error: "Brand name and project objective are required fields." };
    }

    // Upsert project brief
    const { error: briefErr } = await access.supabase.from("project_briefs").upsert(
      {
        project_id: projectId,
        brand_name: formData.brandName.trim(),
        objective: formData.objective.trim(),
        audience: formData.audience.trim(),
        platforms: formData.platforms.trim(),
        submitted: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" }
    );

    if (briefErr) {
      return { ok: false, error: `Failed to save creative brief: ${briefErr.message}` };
    }

    // Advance project status to brief_submitted
    const { error: updateErr } = await access.supabase
      .from("projects")
      .update({
        status: "brief_submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateErr) {
      return { ok: false, error: `Failed to update project status: ${updateErr.message}` };
    }

    // Mark onboarding brief task as done
    await access.supabase
      .from("project_tasks")
      .update({ status: "done" })
      .eq("project_id", projectId)
      .ilike("title", "%brief%");

    await access.supabase.from("audit_logs").insert({
      event_type: "BRIEF_SUBMITTED",
      details: `Client submitted creative onboarding brief for project ${projectId}`,
      actor_id: access.user.id,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit brief";
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
    if (!access.authorized || !access.user) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    if (!data.feedbackText.trim()) {
      return { ok: false, error: "Annotation feedback text cannot be empty." };
    }

    // Verify asset belongs to project
    const { data: asset, error: assetErr } = await access.supabase
      .from("project_assets")
      .select("id, project_id")
      .eq("id", assetId)
      .single();

    if (assetErr || !asset || asset.project_id !== projectId) {
      return { ok: false, error: "Target creative asset does not exist on this project." };
    }

    const { data: annotation, error } = await access.supabase
      .from("asset_annotations")
      .insert({
        asset_id: assetId,
        coord_x_percent: Math.min(100, Math.max(0, Math.round(data.coordX))),
        coord_y_percent: Math.min(100, Math.max(0, Math.round(data.coordY))),
        feedback_text: data.feedbackText.trim(),
        created_by: access.user.id,
      })
      .select()
      .single();

    if (error || !annotation) {
      return { ok: false, error: error?.message || "Failed to save annotation to database." };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, annotation };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record feedback pin";
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
    const max = access.project.max_revisions ?? 3;

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
      return { ok: false, error: `Failed to update revision counter: ${prjUpdateErr.message}` };
    }

    // Insert revision task
    const { error: taskErr } = await access.supabase.from("project_tasks").insert({
      project_id: projectId,
      title: `Revision Round #${newUsed}: ${instructions.slice(0, 50)}...`,
      description: instructions,
      status: "todo",
      display_order: 10 + newUsed,
    });

    if (taskErr) {
      console.warn("Task creation notice:", taskErr.message);
    }

    await access.supabase.from("audit_logs").insert({
      event_type: "REVISION_REQUESTED",
      details: `Client lodged revision round ${newUsed}/${max} for project ${projectId}`,
      actor_id: access.user.id,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, revisionsUsed: newUsed, maxRevisions: max };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to request revision";
    return { ok: false, error: message };
  }
}

export async function approveProjectAction(
  projectId: string,
  notes?: string
) {
  try {
    const access = await verifyProjectAccess(projectId, true);
    if (!access.authorized || !access.user || !access.project) {
      return { ok: false, error: access.error || "Forbidden" };
    }

    // Update project status to client_approved
    const { error: prjErr } = await access.supabase
      .from("projects")
      .update({
        status: "client_approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (prjErr) {
      return { ok: false, error: `Failed to register project approval: ${prjErr.message}` };
    }

    const { error: appErr } = await access.supabase.from("approvals").insert({
      project_id: projectId,
      approved_by: access.user.id,
      legal_terms_accepted: true,
      notes: notes || "Approved via Client Portal Creative Review Canvas",
    });

    if (appErr) {
      return { ok: false, error: `Failed to insert approval record: ${appErr.message}` };
    }

    await access.supabase.from("audit_logs").insert({
      event_type: "PROJECT_APPROVED",
      details: `Client signed off and approved final deliverables for project ${projectId}`,
      actor_id: access.user.id,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve project";
    return { ok: false, error: message };
  }
}

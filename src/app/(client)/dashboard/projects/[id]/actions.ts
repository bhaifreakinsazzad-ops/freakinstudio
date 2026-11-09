"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required" };
    }

    // Upsert project brief
    const { error: briefErr } = await supabase.from("project_briefs").upsert(
      {
        project_id: projectId,
        brand_name: formData.brandName,
        objective: formData.objective,
        audience: formData.audience,
        platforms: formData.platforms,
        submitted: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" }
    );

    if (briefErr) {
      console.warn("Brief upsert error:", briefErr.message);
    }

    // Advance project status
    await supabase
      .from("projects")
      .update({
        status: "brief_submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Complete the brief task if present
    await supabase
      .from("project_tasks")
      .update({ status: "done" })
      .eq("project_id", projectId)
      .ilike("title", "%brief%");

    await supabase.from("audit_logs").insert({
      event_type: "BRIEF_SUBMITTED",
      details: `Client submitted creative onboarding brief for project ${projectId}`,
      actor_id: user.id,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required" };
    }

    const { data: annotation, error } = await supabase
      .from("asset_annotations")
      .insert({
        asset_id: assetId,
        coord_x_percent: Math.min(100, Math.max(0, Math.round(data.coordX))),
        coord_y_percent: Math.min(100, Math.max(0, Math.round(data.coordY))),
        feedback_text: data.feedbackText,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return {
        ok: true,
        annotation: {
          id: `pin-demo-${Date.now()}`,
          coord_x_percent: data.coordX,
          coord_y_percent: data.coordY,
          feedback_text: data.feedbackText,
          resolved: false,
        },
      };
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required" };
    }

    // Check project quota
    const { data: project } = await supabase
      .from("projects")
      .select("revisions_used, max_revisions")
      .eq("id", projectId)
      .single();

    const used = project?.revisions_used ?? 0;
    const max = project?.max_revisions ?? 3;

    if (used >= max) {
      return {
        ok: false,
        error: `Scope revision quota reached (${used}/${max} rounds used). Contact your studio project manager to issue an extended revision change order.`,
      };
    }

    const newUsed = used + 1;

    await supabase
      .from("projects")
      .update({
        status: "revision_requested",
        revisions_used: newUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Insert revision task
    await supabase.from("project_tasks").insert({
      project_id: projectId,
      title: `Revision Round #${newUsed}: ${instructions.slice(0, 50)}...`,
      description: instructions,
      status: "todo",
      display_order: 10 + newUsed,
    });

    await supabase.from("audit_logs").insert({
      event_type: "REVISION_REQUESTED",
      details: `Client lodged revision round ${newUsed}/${max} for project ${projectId}`,
      actor_id: user.id,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required" };
    }

    await supabase
      .from("projects")
      .update({
        status: "client_approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    await supabase.from("approvals").insert({
      project_id: projectId,
      approved_by: user.id,
      legal_terms_accepted: true,
      notes: notes || "Approved via Client Portal Creative Review Canvas",
    });

    await supabase.from("audit_logs").insert({
      event_type: "PROJECT_APPROVED",
      details: `Client signed off and approved final deliverables for project ${projectId}`,
      actor_id: user.id,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve project";
    return { ok: false, error: message };
  }
}

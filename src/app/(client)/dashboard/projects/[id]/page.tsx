import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/permissions/roles";
import {
  ProjectWorkspaceClient,
  type WorkspaceOrder,
  type WorkspaceBrief,
  type WorkspaceTask,
  type WorkspaceAsset,
} from "./project-workspace-client";

export const metadata: Metadata = {
  title: "Project Workspace — Freakin's Studio",
  description: "Secure project progress, briefs, proofs, revisions, and deliverables.",
};

export const instant = false;

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

interface ProjectRow {
  id: string;
  client_id: string;
  title: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  order_id: string | null;
}

/**
 * Phase 1 client portal: real, authorized project records only.
 *
 * Never synthesize a project when a database row is unavailable. The previous
 * fallback generated fake assets/tasks from any URL parameter; that made a
 * missing or unauthorized project look like genuine customer work.
 */
export default async function ProjectWorkspacePage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) notFound();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) notFound();

  const canViewOtherClients = isAdminRole(profile.role);
  let projectQuery = supabase
    .from("projects")
    .select("id, client_id, title, status, revisions_used, max_revisions, order_id")
    .eq("id", id);

  // Explicit ownership filter complements database RLS.
  if (!canViewOtherClients) {
    projectQuery = projectQuery.eq("client_id", user.id);
  }

  const { data: rawProject, error: projectError } = await projectQuery.maybeSingle();
  if (projectError) throw new Error("Project workspace is temporarily unavailable.");
  if (!rawProject) notFound();

  const project = rawProject as ProjectRow;
  if (project.client_id !== user.id && !canViewOtherClients) notFound();

  const [briefResult, tasksResult, assetsResult] = await Promise.all([
    supabase.from("project_briefs").select("*").eq("project_id", id).limit(1),
    supabase
      .from("project_tasks")
      .select("id, title, status, display_order")
      .eq("project_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("id, version_label, file_name, storage_path, file_type, is_approved")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // Fail visibly rather than showing fake progress or claiming the project has
  // no tasks when the underlying table is missing or access is denied.
  if (briefResult.error || tasksResult.error || assetsResult.error) {
    throw new Error("Project tracking data is temporarily unavailable.");
  }

  const briefs = (briefResult.data || []) as WorkspaceBrief[];
  const tasks = (tasksResult.data || []) as WorkspaceTask[];
  const assets = (assetsResult.data || []) as WorkspaceAsset[];

  const firstAsset = assets[0];
  let annotations: Array<{
    id: string;
    coord_x_percent: number;
    coord_y_percent: number;
    feedback_text: string;
    resolved: boolean;
    created_at: string;
  }> = [];

  if (firstAsset) {
    const { data, error } = await supabase
      .from("asset_annotations")
      .select("id, coord_x_percent, coord_y_percent, feedback_text, resolved, created_at")
      .eq("asset_id", firstAsset.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Project feedback is temporarily unavailable.");
    annotations = data || [];
  }

  let order: WorkspaceOrder | null = null;
  if (project.order_id) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_ref, amount, currency, payment_status")
      .eq("id", project.order_id)
      .maybeSingle();
    if (error) throw new Error("Project order data is temporarily unavailable.");
    order = (data || null) as WorkspaceOrder | null;
  }

  const formattedProject = {
    id: project.id,
    title: project.title,
    status: project.status,
    revisions_used: project.revisions_used,
    max_revisions: project.max_revisions,
    order,
    brief: briefs[0] || null,
    tasks,
    assets,
    annotations,
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-brand-muted" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-brand-light transition-colors">
          Workspace Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-brand-highlight">{project.title}</span>
      </nav>
      <ProjectWorkspaceClient project={formattedProject} />
    </div>
  );
}

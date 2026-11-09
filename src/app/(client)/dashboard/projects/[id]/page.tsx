import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ProjectWorkspaceClient,
  type WorkspaceOrder,
  type WorkspaceBrief,
  type WorkspaceTask,
  type WorkspaceAsset,
} from "./project-workspace-client";

interface FullProjectRecord {
  id: string;
  title: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  orders?: WorkspaceOrder | null;
  project_briefs?: WorkspaceBrief[];
  project_tasks?: WorkspaceTask[];
  project_assets?: WorkspaceAsset[];
}

export const metadata: Metadata = {
  title: "Project Workspace — Freakin's Studio",
  description: "Collaborative creative production, visual proofing, revision tracking and asset delivery.",
};

export const instant = false;

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectWorkspacePage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch project from Supabase
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  let projectData: FullProjectRecord | null = project as unknown as FullProjectRecord | null;

  if (!projectData) {
    // If table doesn't have this row yet in unmigrated or fresh dev DB, provide clean demo state
    projectData = {
      id,
      title: `Project ${id} — Creative Production Suite`,
      status: "awaiting_brief",
      revisions_used: 0,
      max_revisions: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_id: user.id,
      order_id: `ord-${id}`,
      project_briefs: [],
      project_tasks: [
        { id: "1", title: "Creative Onboarding Brief Submission", status: "todo", display_order: 1 },
        { id: "2", title: "Production Kickoff & Creative Direction", status: "todo", display_order: 2 },
        { id: "3", title: "Draft Deliverable Delivery & Review", status: "todo", display_order: 3 },
        { id: "4", title: "Final Asset Handover & Archiving", status: "todo", display_order: 4 },
      ],
      project_assets: [
        {
          id: "asset-1",
          version_label: "v1.0",
          file_name: "Master-Design-Draft.png",
          storage_path: "mock",
          file_type: "image",
          file_size_bytes: 4096000,
          is_approved: false,
          is_final_deliverable: false,
          created_at: new Date().toISOString(),
        },
      ],
    } as unknown as FullProjectRecord;
  }

  const proj = projectData as unknown as FullProjectRecord;

  // Fetch annotations
  const assetId = proj?.project_assets?.[0]?.id || "asset-1";
  const { data: annotations } = await supabase
    .from("asset_annotations")
    .select("*")
    .eq("asset_id", assetId);

  const formattedProject = {
    id: proj.id,
    title: proj.title,
    status: proj.status,
    revisions_used: proj.revisions_used,
    max_revisions: proj.max_revisions,
    order: proj.orders || null,
    brief: proj.project_briefs?.[0] || null,
    tasks: proj.project_tasks || [],
    assets: proj.project_assets || [],
    annotations: (annotations || []).map((a) => ({
      id: a.id,
      coord_x_percent: a.coord_x_percent,
      coord_y_percent: a.coord_y_percent,
      feedback_text: a.feedback_text,
      resolved: a.resolved,
      created_at: a.created_at,
    })),
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-brand-muted">
        <Link href="/dashboard" className="hover:text-brand-light transition-colors">
          Workspace Dashboard
        </Link>
        <span>/</span>
        <span className="text-brand-highlight">{formattedProject.id}</span>
      </nav>

      <ProjectWorkspaceClient project={formattedProject} />
    </div>
  );
}

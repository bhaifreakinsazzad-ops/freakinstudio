import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/permissions/roles";
import {
  ProjectWorkspaceClient,
  type WorkspaceAsset,
  type WorkspaceBrief,
  type WorkspaceTask,
} from "./project-workspace-client";

export const instant = false;

export interface WorkspaceProjectData {
  id: string;
  title: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  brief: WorkspaceBrief | null;
  tasks: WorkspaceTask[];
  assets: WorkspaceAsset[];
  annotations: {
    id: string;
    coord_x_percent: number;
    coord_y_percent: number;
    feedback_text: string;
    resolved: boolean;
  }[];
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let projectData: WorkspaceProjectData | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      const { data: prj } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (prj) {
        const [
          { data: briefRow },
          { data: taskRows },
          { data: assetRows },
        ] = await Promise.all([
          supabase
            .from("project_briefs")
            .select("*")
            .eq("project_id", id)
            .maybeSingle(),
          supabase
            .from("project_tasks")
            .select("*")
            .eq("project_id", id)
            .order("display_order", { ascending: true }),
          supabase
            .from("project_assets")
            .select("*, asset_annotations(*)")
            .eq("project_id", id)
            .order("version_number", { ascending: false }),
        ]);

        type RawAssetRow = {
          id: string;
          file_name: string;
          version_number: number;
          storage_path?: string | null;
          mime_type: string | null;
          asset_annotations?: {
            id: string;
            coord_x_percent: number;
            coord_y_percent: number;
            feedback_text: string;
            resolved: boolean;
          }[];
        };

        const rawAssets = (assetRows as unknown as RawAssetRow[] | null) ?? [];
        const mappedAssets: WorkspaceAsset[] = rawAssets.map((a) => ({
          id: a.id,
          version_label: `v${a.version_number || 1}`,
          file_name: a.file_name,
          storage_path: a.storage_path || `/images/portfolio/brand-identity.jpg`,
          file_type: a.mime_type || "image/svg+xml",
        }));

        const flattenedAnnotations = rawAssets.flatMap((a) =>
          (a.asset_annotations || []).map((ann) => ({
            id: ann.id,
            coord_x_percent: Number(ann.coord_x_percent),
            coord_y_percent: Number(ann.coord_y_percent),
            feedback_text: ann.feedback_text,
            resolved: Boolean(ann.resolved),
          }))
        );

        projectData = {
          id: prj.id,
          title: prj.title,
          status: prj.status,
          revisions_used: prj.revisions_used,
          max_revisions: prj.max_revisions ?? 2,
          brief: briefRow
            ? {
                brand_name: briefRow.brand_name || "",
                objective: briefRow.objective || "",
                audience: briefRow.audience || "",
                platforms: briefRow.platforms || "",
                submitted: Boolean(briefRow.submitted),
              }
            : null,
          tasks: (taskRows ?? []).map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status as "todo" | "in_progress" | "review" | "done",
          })),
          assets: mappedAssets,
          annotations: flattenedAnnotations,
        };
      }
    } catch {
      // Do not synthesize fake project data
    }
  }

  // Gate 0 Truthful Missing Record Guard: Never fabricate synthetic projects when not found
  if (!projectData) {
    notFound();
  }

  return <ProjectWorkspaceClient project={projectData} />;
}


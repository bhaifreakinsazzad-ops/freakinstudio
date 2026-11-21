import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/permissions/roles";
import {
  ProjectWorkspaceClient,
  type WorkspaceAsset,
  type WorkspaceBrief,
  type WorkspaceEvent,
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
  events: WorkspaceEvent[];
  annotations: {
    id: string;
    asset_id: string;
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
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=/dashboard/projects/${encodeURIComponent(id)}`);
  }

  let projectData: WorkspaceProjectData | null = null;
  let dbError: string | null = null;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    dbError = "Supabase database environment is not configured.";
  } else {
    try {
      const supabase = await createClient();
      const { data: prj, error: prjErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (prjErr) {
        dbError = prjErr.message;
      } else if (prj) {
        const isAdmin = isAdminRole(profile.role);
        const isParticipant =
          prj.client_id === profile.id ||
          prj.assigned_pm_id === profile.id ||
          prj.assigned_designer_id === profile.id ||
          prj.assigned_to === profile.id;

        if (!isAdmin && !isParticipant) {
          notFound();
        }

        const [
          { data: briefRow, error: briefErr },
          { data: taskRows, error: taskErr },
          { data: assetRows, error: assetErr },
          { data: eventRows, error: eventErr },
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
            .order("created_at", { ascending: false }),
          supabase
            .from("project_events")
            .select(
              "id, actor_kind, event_type, state_before, state_after, si_status, visibility, summary, created_at"
            )
            .eq("project_id", id)
            .order("created_at", { ascending: false })
            .limit(40),
        ]);

        if (briefErr || taskErr || assetErr) {
          dbError =
            briefErr?.message ||
            taskErr?.message ||
            assetErr?.message ||
            "Unable to load workspace sub-resources.";
        }

        type RawAssetRow = {
          id: string;
          file_name: string;
          version_label: string;
          storage_path: string;
          content_type: string;
          is_approved: boolean;
          asset_annotations?: {
            id: string;
            asset_id: string;
            coord_x_percent: number;
            coord_y_percent: number;
            feedback_text: string;
            resolved: boolean;
          }[];
        };

        const rawAssets = (assetRows as unknown as RawAssetRow[] | null) ?? [];
        const mappedAssets: WorkspaceAsset[] = await Promise.all(
          rawAssets.map(async (a) => {
            let signedUrl: string | undefined;
            if (a.storage_path) {
              const { data: signed } = await supabase.storage
                .from("project-assets")
                .createSignedUrl(a.storage_path, 3600);
              signedUrl = signed?.signedUrl;
            }
            return {
              id: a.id,
              version_label: a.version_label || "v1",
              file_name: a.file_name,
              storage_path: a.storage_path,
              signed_url: signedUrl,
              file_type: a.content_type || "application/octet-stream",
              is_approved: Boolean(a.is_approved),
            };
          })
        );

        const flattenedAnnotations = rawAssets.flatMap((a) =>
          (a.asset_annotations || []).map((ann) => ({
            id: ann.id,
            asset_id: ann.asset_id || a.id,
            coord_x_percent: Number(ann.coord_x_percent),
            coord_y_percent: Number(ann.coord_y_percent),
            feedback_text: ann.feedback_text,
            resolved: Boolean(ann.resolved),
          }))
        );

        const visibleEvents: WorkspaceEvent[] = (
          !eventErr && eventRows ? eventRows : []
        )
          .filter((ev) => isAdmin || ev.visibility === "client")
          .map((ev) => ({
            id: ev.id,
            actor_kind: ev.actor_kind,
            event_type: ev.event_type,
            state_before: ev.state_before,
            state_after: ev.state_after,
            si_status: ev.si_status,
            summary: ev.summary,
            created_at: ev.created_at,
          }));

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
          events: visibleEvents,
          annotations: flattenedAnnotations,
        };
      }
    } catch (err: unknown) {
      dbError =
        err instanceof Error
          ? err.message
          : "Unexpected error querying project workspace.";
    }
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/40 bg-[#121315] p-8 space-y-4 text-sm font-mono">
        <span className="text-xs uppercase text-amber-300 font-bold">
          503 &middot; Workspace Temporarily Unavailable
        </span>
        <h1 className="text-xl font-bold text-[#F6F4EF]">
          Unable to load live project workspace
        </h1>
        <p className="text-xs text-[#F6F4EF]/75">{dbError}</p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-[#D9BD81] px-4 py-2 text-xs font-bold text-[#090A0A]"
        >
          &larr; Return to Client Dashboard
        </Link>
      </div>
    );
  }

  if (!projectData) {
    notFound();
  }

  return <ProjectWorkspaceClient project={projectData} />;
}

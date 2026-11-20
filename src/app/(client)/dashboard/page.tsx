import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Projects — Freakin's Studio",
  description: "Track real creative production projects, progress, briefs and review tasks.",
};

export const instant = false;

const CLIENT_STATUS_LABELS: Record<string, string> = {
  awaiting_brief: "Brief required",
  brief_submitted: "Brief submitted",
  in_production: "In production",
  client_review: "Your review needed",
  revision_requested: "Revision requested",
  revision_in_progress: "Revision in progress",
  client_approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusLabel(value: string): string {
  return CLIENT_STATUS_LABELS[value] || value.replace(/_/g, " ");
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Only show customer-owned projects. RLS remains the primary DB boundary.
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, status, revisions_used, max_revisions, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (projectsError) throw new Error("Unable to load your projects right now.");

  const projectIds = (projects || []).map((project) => project.id);
  let tasks: Array<{ project_id: string; status: string }> = [];

  if (projectIds.length) {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("project_id, status")
      .in("project_id", projectIds);

    if (error) throw new Error("Unable to load project milestones right now.");
    tasks = data || [];
  }

  const tasksByProject = new Map<string, { total: number; completed: number }>();
  for (const task of tasks) {
    const counts = tasksByProject.get(task.project_id) || { total: 0, completed: 0 };
    counts.total += 1;
    if (task.status === "done") counts.completed += 1;
    tasksByProject.set(task.project_id, counts);
  }

  const allProjects = projects || [];
  const needsReview = allProjects.filter((p) =>
    p.status === "client_review" || p.status === "awaiting_brief",
  ).length;
  const completed = allProjects.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-9">
      <header className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-card px-6 py-9 sm:px-10">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-brand-highlight/10 blur-3xl" aria-hidden="true" />
        <span className="badge-mono text-brand-highlight">PRIVATE CLIENT WORKSPACE</span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-brand-light sm:text-4xl">
          Your creative work, <span className="text-brand-highlight">in one place.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
          View project progress, submit your brief, review new work and request revisions.
          Every project below comes from your studio account.
        </p>
        <p className="mt-5 text-xs text-brand-muted">
          Signed in as <span className="font-semibold text-brand-light">{profile.full_name || profile.email}</span>
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Project overview">
        {[
          { label: "Your projects", value: allProjects.length },
          { label: "Your attention needed", value: needsReview },
          { label: "Completed", value: completed },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-brand-border bg-brand-surface p-5">
            <p className="text-xs font-medium text-brand-muted">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-light">{metric.value}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="my-projects-heading" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="my-projects-heading" className="text-xl font-bold tracking-tight text-brand-light">
            My projects
          </h2>
          <span className="text-xs text-brand-muted">{allProjects.length} project{allProjects.length === 1 ? "" : "s"}</span>
        </div>

        {allProjects.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-brand-surface px-6 py-12 text-center">
            <p className="text-lg font-semibold text-brand-light">No projects yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-muted">
              When the studio creates your first project, it will appear here.
              There are no sample projects or fabricated progress.
            </p>
            <Link
              className="mt-6 inline-flex rounded-xl border border-brand-highlight/50 px-5 py-3 text-xs font-bold text-brand-highlight hover:bg-brand-highlight/10"
              href="/contact"
            >
              Contact the studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {allProjects.map((project) => {
              const milestones = tasksByProject.get(project.id);
              const percentage = milestones?.total
                ? Math.round((milestones.completed / milestones.total) * 100)
                : null;
              const actionNeeded =
                project.status === "awaiting_brief" || project.status === "client_review";

              return (
                <article key={project.id} className="rounded-2xl border border-brand-border bg-brand-card p-6 transition hover:border-brand-highlight/50">
                  <div className="flex items-start justify-between gap-3">
                    <span className="badge-mono text-brand-muted">PROJECT</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      actionNeeded
                        ? "border-brand-highlight/40 bg-brand-highlight/10 text-brand-highlight"
                        : "border-brand-border text-brand-muted"
                    }`}>
                      {statusLabel(project.status)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-6 text-brand-light">{project.title}</h3>

                  <div className="mt-6 space-y-3 border-t border-brand-border pt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-muted">Production milestones</span>
                      <strong className="text-brand-light">
                        {milestones?.total
                          ? `${milestones.completed} / ${milestones.total}`
                          : "Not scheduled"}
                      </strong>
                    </div>
                    {percentage !== null ? (
                      <div
                        className="h-1.5 overflow-hidden rounded-full bg-brand-surface"
                        role="progressbar"
                        aria-label="Milestones completed"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="h-full rounded-full bg-brand-highlight" style={{ width: `${percentage}%` }} />
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-xs text-brand-muted">
                      <span>Revision rounds used</span>
                      <span>{project.revisions_used} / {project.max_revisions}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-highlight px-4 py-3 text-xs font-bold text-brand-black hover:opacity-90"
                  >
                    {actionNeeded ? "Open & respond" : "View project"} <span className="ml-2" aria-hidden="true">↗</span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

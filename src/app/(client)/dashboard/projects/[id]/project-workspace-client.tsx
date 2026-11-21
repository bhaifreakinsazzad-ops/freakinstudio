"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitBriefAction,
  addPinAnnotationAction,
  requestRevisionAction,
  approveProjectAction,
} from "./actions";

interface PinItem {
  id: string;
  asset_id?: string;
  coord_x_percent: number;
  coord_y_percent: number;
  feedback_text: string;
  resolved: boolean;
  created_at?: string;
}

export interface WorkspaceOrder {
  id: string;
  order_ref: string;
  amount: number;
  currency: string;
  payment_status: string;
}

export interface WorkspaceBrief {
  brand_name?: string;
  objective?: string;
  audience?: string;
  platforms?: string;
  submitted?: boolean;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  display_order?: number;
}

export interface WorkspaceAsset {
  id: string;
  version_label: string;
  file_name: string;
  storage_path: string;
  signed_url?: string;
  file_type?: string;
  is_approved?: boolean;
}

export interface WorkspaceEvent {
  id: string;
  actor_kind: "human_expert" | "si_assistant" | "system" | "client";
  event_type: string;
  state_before: string | null;
  state_after: string | null;
  si_status: string | null;
  summary: string;
  created_at: string;
}

interface ProjectWorkspaceProps {
  project: {
    id: string;
    title: string;
    status: string;
    revisions_used: number;
    max_revisions: number;
    order?: WorkspaceOrder | null;
    brief?: WorkspaceBrief | null;
    tasks?: WorkspaceTask[];
    assets?: WorkspaceAsset[];
    events?: WorkspaceEvent[];
    annotations?: PinItem[];
  };
}

function getActorBadge(kind: WorkspaceEvent["actor_kind"], siStatus: string | null) {
  if (kind === "human_expert") {
    return {
      label: "Human Expert",
      className: "border-[#D9BD81]/40 bg-[#D9BD81]/10 text-[#D9BD81]",
    };
  }
  if (kind === "si_assistant") {
    return {
      label: siStatus === "human_approved" ? "SI Assist · Verified" : "SI Assist",
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    };
  }
  if (kind === "client") {
    return {
      label: "Client Action",
      className: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    };
  }
  return {
    label: "System Ledger",
    className: "border-[#232528] bg-[#090A0A] text-[#F6F4EF]/70",
  };
}

export function ProjectWorkspaceClient({ project }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "brief" | "proofing" | "revisions" | "delivery"
  >("overview");
  const [isPending, startTransition] = useTransition();

  const assets = project.assets || [];
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    assets[0]?.id ?? null
  );
  const activeAsset =
    assets.find((a) => a.id === selectedAssetId) || assets[0] || null;

  const [briefForm, setBriefForm] = useState({
    brandName: project.brief?.brand_name || "",
    objective: project.brief?.objective || "",
    audience: project.brief?.audience || "",
    platforms: project.brief?.platforms || "",
  });
  const [isBriefSubmitted, setIsBriefSubmitted] = useState(
    !!project.brief?.submitted
  );

  const [pins, setPins] = useState<PinItem[]>(() =>
    (project.annotations || []).map((a) => ({
      id: a.id,
      asset_id: a.asset_id,
      coord_x_percent: a.coord_x_percent,
      coord_y_percent: a.coord_y_percent,
      feedback_text: a.feedback_text,
      resolved: a.resolved,
      created_at: a.created_at,
    }))
  );
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(
    null
  );
  const [pinCommentInput, setPinCommentInput] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const [revisionsUsed, setRevisionsUsed] = useState(project.revisions_used);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [projectStatus, setProjectStatus] = useState(project.status);

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isApproved, setIsApproved] = useState(
    projectStatus === "client_approved" || projectStatus === "completed"
  );

  const activeAssetPins = activeAsset
    ? pins.filter((p) => !p.asset_id || p.asset_id === activeAsset.id)
    : [];

  const handleBriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefForm.brandName.trim() || !briefForm.objective.trim()) {
      toast.error("Please provide at least a brand name and campaign objective.");
      return;
    }

    startTransition(async () => {
      const res = await submitBriefAction(project.id, briefForm);
      if (res.ok) {
        setIsBriefSubmitted(true);
        setProjectStatus("brief_submitted");
        toast.success(
          "Creative onboarding brief submitted! Studio production queued."
        );
      } else {
        toast.error(res.error || "Failed to submit brief");
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive || !canvasRef.current || !activeAsset) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100))
    );
    const y = Math.max(
      0,
      Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100))
    );

    setPendingPin({ x, y });
    setPinCommentInput("");
  };

  const handleSavePendingPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset) {
      toast.error("Wait for a studio proof asset before saving a pin.");
      return;
    }
    if (!pendingPin || !pinCommentInput.trim()) {
      toast.error("Enter feedback notes before saving this coordinate pin.");
      return;
    }

    const { x, y } = pendingPin;
    const feedbackText = pinCommentInput.trim();

    startTransition(async () => {
      const res = await addPinAnnotationAction(project.id, activeAsset.id, {
        coordX: x,
        coordY: y,
        feedbackText,
      });

      if (res.ok && res.annotation) {
        setPins((prev) => [
          ...prev,
          { ...res.annotation, asset_id: activeAsset.id },
        ]);
        setPendingPin(null);
        setPinCommentInput("");
        setIsPinModeActive(false);
        toast.success(
          `Feedback Pin #${activeAssetPins.length + 1} added at (${x}%, ${y}%)`
        );
      } else {
        toast.error(res.error || "Failed to save pin annotation.");
      }
    });
  };

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) {
      toast.error("Please describe your revision instructions.");
      return;
    }

    startTransition(async () => {
      const res = await requestRevisionAction(project.id, revisionFeedback);
      if (res.ok) {
        setRevisionsUsed(res.revisionsUsed ?? revisionsUsed + 1);
        setProjectStatus("revision_requested");
        setRevisionFeedback("");
        toast.success("Revision request lodged! Studio team notified.");
      } else {
        toast.error(res.error || "Failed to request revision");
      }
    });
  };

  const handleApprove = () => {
    if (!activeAsset) {
      toast.error("A studio proof asset must be uploaded before final approval.");
      return;
    }
    if (!isTermsAccepted) {
      toast.error("Please confirm acceptance of commercial usage terms.");
      return;
    }

    startTransition(async () => {
      const res = await approveProjectAction(project.id, activeAsset.id);
      if (res.ok) {
        setIsApproved(true);
        setProjectStatus("client_approved");
        toast.success(
          "Project officially approved! Final delivery archive unlocked."
        );
        setActiveTab("delivery");
      } else {
        toast.error(res.error || "Failed to record approval");
      }
    });
  };

  const events = project.events || [];
  const tasks = project.tasks || [];

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge-mono text-brand-highlight font-bold">
                PROJECT WORKSPACE
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase border-brand-highlight/40 text-brand-highlight bg-brand-highlight/10"
              >
                {projectStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-light tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border text-right font-mono">
              <span className="block text-[10px] text-brand-muted uppercase">
                Revision Quota
              </span>
              <span className="text-sm font-bold text-brand-light">
                {revisionsUsed} / {project.max_revisions} Rounds
              </span>
            </div>
            {isApproved && assets.some((a) => a.is_approved) && (
              <Button
                render={
                  <a href={`/api/projects/${project.id}/download`} download>
                    Download ZIP
                  </a>
                }
                size="sm"
                className="cyber-glow bg-brand-success hover:bg-brand-success/90 text-brand-black font-semibold font-mono text-xs"
              />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-t border-brand-border pt-4 overflow-x-auto cyber-scrollbar">
          {[
            { id: "overview", label: "1. Activity & Tasks" },
            { id: "brief", label: "2. Creative Brief" },
            { id: "proofing", label: `3. Visual Proofing (${assets.length})` },
            { id: "revisions", label: "4. Revisions Quota" },
            { id: "delivery", label: "5. Sign-Off & Delivery" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "overview"
                    | "brief"
                    | "proofing"
                    | "revisions"
                    | "delivery"
                )
              }
              className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-brand-light text-brand-black font-bold shadow-md"
                  : "bg-brand-surface/60 border border-brand-border text-brand-muted hover:text-brand-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW, TASKS & VERIFIED PROJECT TIMELINE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Real Production Tasks */}
            <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
              <h2 className="text-base font-bold text-brand-light font-mono">
                Production Milestones &amp; Task Checklist
              </h2>
              <div className="space-y-2.5">
                {tasks.length === 0 ? (
                  <p className="text-xs font-mono text-brand-muted">
                    Milestones initialize automatically upon deposit confirmation.
                  </p>
                ) : (
                  tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-brand-light flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            task.status === "done"
                              ? "bg-brand-success text-brand-black border-brand-success font-bold"
                              : "border-brand-border text-brand-muted"
                          }`}
                        >
                          {task.status === "done" ? "✓" : idx + 1}
                        </span>
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          task.status === "done"
                            ? "text-emerald-400"
                            : task.status === "in_progress"
                            ? "text-[#D9BD81]"
                            : "text-brand-muted"
                        }`}
                      >
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verified Event-Sourced Timeline (Human + SI + Client) */}
            <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
              <h2 className="text-base font-bold text-brand-light font-mono">
                Verified Studio Activity Timeline ({events.length})
              </h2>
              {events.length === 0 ? (
                <p className="text-xs font-mono text-brand-muted">
                  No studio production events recorded yet. Submit your creative brief to notify the desk.
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((ev) => {
                    const badge = getActorBadge(ev.actor_kind, ev.si_status);
                    return (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-brand-border bg-brand-surface/60 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded border uppercase ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-brand-muted">
                            {new Date(ev.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-brand-light leading-relaxed">
                          {ev.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4 font-mono text-xs">
              <h3 className="font-bold text-brand-light uppercase text-[11px]">
                Commercial Scope Details
              </h3>
              <div className="divide-y divide-brand-border/60 space-y-2">
                <div className="flex justify-between pt-2">
                  <span className="text-brand-muted">Status:</span>
                  <span className="text-brand-light font-bold uppercase">
                    {projectStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-brand-muted">Revisions Allowed:</span>
                  <span className="text-brand-light font-bold">
                    {project.max_revisions} Rounds
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-brand-muted">Uploaded Proofs:</span>
                  <span className="text-brand-light font-bold">
                    {assets.length} File(s)
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab("brief")}
                className="w-full font-mono text-xs cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold mt-2"
              >
                {isBriefSubmitted ? "Review Brief" : "Complete Creative Brief"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATIVE BRIEF */}
      {activeTab === "brief" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
          <div>
            <h2 className="text-xl font-black text-brand-light tracking-tight">
              Creative Onboarding Brief
            </h2>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Provide campaign objectives, target audience insights and platform specs to guide studio production.
            </p>
          </div>

          <form
            onSubmit={handleBriefSubmit}
            className="space-y-4 text-xs font-mono"
          >
            <div>
              <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                Brand / Business Entity Name
              </label>
              <Input
                value={briefForm.brandName}
                onChange={(e) =>
                  setBriefForm({ ...briefForm, brandName: e.target.value })
                }
                placeholder="e.g. Sylhet Botanicals"
                disabled={isBriefSubmitted}
                className="bg-brand-surface border-brand-border text-brand-light h-10"
                required
              />
            </div>

            <div>
              <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                Campaign &amp; Creative Objective
              </label>
              <textarea
                rows={3}
                value={briefForm.objective}
                onChange={(e) =>
                  setBriefForm({ ...briefForm, objective: e.target.value })
                }
                placeholder="Detail what outcome you expect from this creative deliverable..."
                disabled={isBriefSubmitted}
                className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-xs font-mono text-brand-light focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                  Target Demographics / Audience
                </label>
                <Input
                  value={briefForm.audience}
                  onChange={(e) =>
                    setBriefForm({ ...briefForm, audience: e.target.value })
                  }
                  placeholder="e.g. D2C shoppers in Dhaka"
                  disabled={isBriefSubmitted}
                  className="bg-brand-surface border-brand-border text-brand-light h-10"
                />
              </div>

              <div>
                <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                  Primary Platforms &amp; Media Channels
                </label>
                <Input
                  value={briefForm.platforms}
                  onChange={(e) =>
                    setBriefForm({ ...briefForm, platforms: e.target.value })
                  }
                  placeholder="e.g. Instagram Reels, Facebook Ads, Print"
                  disabled={isBriefSubmitted}
                  className="bg-brand-surface border-brand-border text-brand-light h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border">
              {isBriefSubmitted ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓ Brief Verified &amp; Locked in Production</span>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs px-6 py-5"
                >
                  {isPending
                    ? "Submitting..."
                    : "Submit Creative Brief & Queue Production"}
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: VISUAL PROOFING & PIN ANNOTATION */}
      {activeTab === "proofing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-brand-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-brand-muted">
                {activeAsset
                  ? `Proof Canvas (${activeAsset.version_label}): ${
                      isPinModeActive
                        ? "Click canvas to place feedback pin"
                        : "Inspection Mode"
                    }`
                  : "Awaiting first studio proof upload"}
              </span>
              <Button
                variant={isPinModeActive ? "primary" : "outline"}
                size="sm"
                disabled={!activeAsset}
                onClick={() => {
                  const next = !isPinModeActive;
                  setIsPinModeActive(next);
                  if (!next) {
                    setPendingPin(null);
                    setPinCommentInput("");
                  }
                }}
                className={`font-mono text-xs ${
                  isPinModeActive
                    ? "bg-brand-highlight text-brand-black font-semibold cyber-glow"
                    : "border-brand-border"
                }`}
              >
                {isPinModeActive ? "Cancel Pin Mode" : "+ Drop Feedback Pin"}
              </Button>
            </div>

            {assets.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {assets.map((asset) => (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${
                      activeAsset?.id === asset.id
                        ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF] font-bold"
                        : "border-[#232528] bg-[#121315] text-[#F6F4EF]/70"
                    }`}
                  >
                    {asset.version_label} &middot; {asset.file_name}
                  </button>
                ))}
              </div>
            )}

            {/* Real Proofing Canvas or Honest Empty State */}
            {!activeAsset ? (
              <div className="w-full aspect-[4/3] rounded-2xl border border-dashed border-[#232528] bg-[#121315] p-8 flex flex-col items-center justify-center text-center space-y-2">
                <p className="font-mono text-sm font-bold text-[#D9BD81]">
                  No Studio Proof Uploaded Yet
                </p>
                <p className="text-xs text-[#F6F4EF]/65 max-w-md">
                  Your assigned studio specialist will upload watermarked or review-ready proof assets to private Supabase Storage once production reaches client review.
                </p>
              </div>
            ) : (
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`relative w-full aspect-[4/3] rounded-2xl border border-brand-border bg-brand-surface overflow-hidden flex items-center justify-center select-none ${
                  isPinModeActive
                    ? "cursor-crosshair ring-2 ring-brand-highlight"
                    : "cursor-default"
                }`}
              >
                {activeAsset.signed_url &&
                (activeAsset.file_type?.startsWith("image/") ||
                  /\.(png|jpe?g|webp|svg)$/i.test(activeAsset.file_name)) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeAsset.signed_url}
                    alt={activeAsset.file_name}
                    className="w-full h-full object-contain bg-[#090A0A]"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <p className="font-mono text-sm font-bold text-[#F6F4EF]">
                      {activeAsset.file_name}
                    </p>
                    <p className="font-mono text-xs text-[#F6F4EF]/60">
                      {activeAsset.file_type} &bull; {activeAsset.version_label}
                    </p>
                    {activeAsset.signed_url && (
                      <a
                        href={activeAsset.signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg border border-[#D9BD81]/40 px-3 py-1.5 font-mono text-xs text-[#D9BD81]"
                      >
                        Open Signed Proof File &rarr;
                      </a>
                    )}
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5">
                  <p className="font-mono text-xs font-bold text-brand-light">
                    {activeAsset.file_name}
                  </p>
                  <p className="font-mono text-[11px] text-brand-muted">
                    Studio Proof &middot; {activeAsset.version_label}
                  </p>
                </div>

                {activeAssetPins.map((pin, index) => (
                  <div
                    key={pin.id}
                    style={{
                      left: `${pin.coord_x_percent}%`,
                      top: `${pin.coord_y_percent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-highlight text-brand-black font-mono text-xs font-bold flex items-center justify-center shadow-lg cyber-glow ring-2 ring-brand-black"
                    title={pin.feedback_text}
                  >
                    {index + 1}
                  </div>
                ))}

                {pendingPin && (
                  <div
                    style={{
                      left: `${pendingPin.x}%`,
                      top: `${pendingPin.y}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-brand-highlight bg-brand-black/80 text-brand-highlight font-mono text-xs font-bold flex items-center justify-center shadow-lg"
                  >
                    +
                  </div>
                )}
              </div>
            )}

            {pendingPin && activeAsset && (
              <form
                onSubmit={handleSavePendingPin}
                className="p-4 rounded-2xl border border-brand-highlight/50 bg-brand-surface space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-brand-highlight">
                    New Pin at ({pendingPin.x}%, {pendingPin.y}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingPin(null);
                      setPinCommentInput("");
                    }}
                    className="text-brand-muted hover:text-brand-light"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    value={pinCommentInput}
                    onChange={(e) => setPinCommentInput(e.target.value)}
                    placeholder="Describe your exact adjustment at this coordinate..."
                    className="bg-brand-black border-brand-border text-brand-light text-xs font-mono h-10 flex-1"
                    autoFocus
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs h-10 px-5"
                  >
                    {isPending ? "Saving..." : "Save Pin"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Feedback Thread */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="font-bold text-xs font-mono text-brand-light uppercase">
                  Pinned Feedback ({activeAssetPins.length})
                </h3>
              </div>

              {activeAssetPins.length === 0 ? (
                <p className="text-xs font-mono text-brand-muted py-6 text-center">
                  {activeAsset
                    ? 'No feedback pins yet. Click "+ Drop Feedback Pin" to inspect coordinates.'
                    : "Pinning activates after Proof v1 is uploaded."}
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto cyber-scrollbar pr-1">
                  {activeAssetPins.map((pin, idx) => (
                    <div
                      key={pin.id}
                      className="p-3 rounded-xl bg-brand-surface border border-brand-border space-y-1 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-highlight">
                          Pin #{idx + 1}
                        </span>
                        <span className="text-[10px] text-brand-muted">
                          ({pin.coord_x_percent}%, {pin.coord_y_percent}%)
                        </span>
                      </div>
                      <p className="text-brand-light font-sans text-xs">
                        {pin.feedback_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVISIONS */}
      {activeTab === "revisions" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-xl font-black text-brand-light tracking-tight">
                Revision Management &amp; Quota Bounds
              </h2>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Each service scope includes 2 consolidated revision rounds to preserve production velocity.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-brand-muted block uppercase">
                Remaining Rounds
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.max(0, project.max_revisions - revisionsUsed)}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleRevisionSubmit}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                Consolidated Revision Instructions
              </label>
              <textarea
                rows={4}
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="List your specific design adjustments, copy revisions or color tweaks in detail..."
                disabled={revisionsUsed >= project.max_revisions}
                className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-xs font-mono text-brand-light focus:outline-none"
              />
            </div>

            {revisionsUsed >= project.max_revisions ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                All {project.max_revisions} included revision rounds have been utilized for this project scope. Contact studio operations if an additional round is required.
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs px-6 py-5"
              >
                {isPending
                  ? "Lodging Revision..."
                  : `Submit Revision Round #${revisionsUsed + 1}`}
              </Button>
            )}
          </form>
        </div>
      )}

      {/* TAB 5: SIGN-OFF & DELIVERABLE DOWNLOAD */}
      {activeTab === "delivery" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
          <div>
            <h2 className="text-xl font-black text-brand-light tracking-tight">
              Final Approval Sign-Off &amp; Deliverable Handover
            </h2>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Verify completion, record final sign-off, and download verified master asset archives.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-brand-light uppercase">
              Legal Clearances &amp; Commercial Terms
            </h3>
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-brand-border bg-brand-black/40 cursor-pointer">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-brand-border text-brand-highlight"
              />
              <span className="text-brand-light text-xs font-sans">
                I hereby accept and approve the completed production deliverables for{" "}
                <strong>{project.title}</strong>, confirming all contractual terms and commercial rights transfers.
              </span>
            </label>

            {!isApproved ? (
              <div className="space-y-2">
                {!activeAsset && (
                  <p className="text-[11px] text-amber-300">
                    Sign-off is disabled until the studio uploads your proof/final deliverable asset.
                  </p>
                )}
                <Button
                  onClick={handleApprove}
                  disabled={!isTermsAccepted || !activeAsset || isPending}
                  className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs py-5"
                >
                  {isPending
                    ? "Processing Sign-off..."
                    : "Approve Deliverables & Unlock Master ZIP Archive"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-between">
                  <span>✓ Deliverables Officially Signed Off &amp; Approved</span>
                  <span className="text-[11px] text-brand-muted uppercase">
                    Verified
                  </span>
                </div>

                <div className="p-6 rounded-2xl border border-brand-highlight/40 bg-brand-highlight/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-brand-light">
                      Master Creative Production Archive (.ZIP)
                    </h4>
                    <p className="text-xs text-brand-muted">
                      Includes verified master deliverables from private storage and Commercial Buyout Certificate.
                    </p>
                  </div>
                  <Button
                    render={
                      <a href={`/api/projects/${project.id}/download`} download>
                        Download Master Archive (.ZIP)
                      </a>
                    }
                    size="lg"
                    className="cyber-glow bg-brand-success hover:bg-brand-success/90 text-brand-black font-semibold font-mono text-xs whitespace-nowrap"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

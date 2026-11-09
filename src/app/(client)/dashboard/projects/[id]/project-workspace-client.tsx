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
  file_type?: string;
  is_approved?: boolean;
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
    annotations?: PinItem[];
  };
}

export function ProjectWorkspaceClient({ project }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "brief" | "proofing" | "revisions" | "delivery">("overview");
  const [isPending, startTransition] = useTransition();

  // Brief Form State
  const [briefForm, setBriefForm] = useState({
    brandName: project.brief?.brand_name || "",
    objective: project.brief?.objective || "",
    audience: project.brief?.audience || "",
    platforms: project.brief?.platforms || "",
  });
  const [isBriefSubmitted, setIsBriefSubmitted] = useState(!!project.brief?.submitted);

  // Proofing & Pin State
  const [pins, setPins] = useState<PinItem[]>(() => {
    return (project.annotations || []).map((a) => ({
      id: a.id,
      coord_x_percent: a.coord_x_percent,
      coord_y_percent: a.coord_y_percent,
      feedback_text: a.feedback_text,
      resolved: a.resolved,
      created_at: a.created_at,
    }));
  });
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Revision State
  const [revisionsUsed, setRevisionsUsed] = useState(project.revisions_used);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [projectStatus, setProjectStatus] = useState(project.status);

  // Approval state
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isApproved, setIsApproved] = useState(projectStatus === "client_approved" || projectStatus === "completed");

  // Handle Brief Submit
  const handleBriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefForm.brandName || !briefForm.objective) {
      toast.error("Please provide at least a brand name and campaign objective.");
      return;
    }

    startTransition(async () => {
      const res = await submitBriefAction(project.id, briefForm);
      if (res.ok) {
        setIsBriefSubmitted(true);
        setProjectStatus("brief_submitted");
        toast.success("Creative onboarding brief submitted! Studio production queued.");
      } else {
        toast.error(res.error || "Failed to submit brief");
      }
    });
  };

  // Handle Click on Proofing Canvas to Drop Pin
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const comment = prompt("Enter specific design feedback for this coordinate:");
    if (!comment || !comment.trim()) return;

    startTransition(async () => {
      const res = await addPinAnnotationAction(project.id, project.assets?.[0]?.id || "asset-master", {
        coordX: x,
        coordY: y,
        feedbackText: comment.trim(),
      });

      if (res.ok && res.annotation) {
        setPins((prev) => [...prev, res.annotation]);
        toast.success(`Feedback Pin #${pins.length + 1} added at (${x}%, ${y}%)`);
      }
    });
  };

  // Handle Revision Request
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
        toast.success("Revision request lodged! Production team assigned.");
      } else {
        toast.error(res.error || "Failed to request revision");
      }
    });
  };

  // Handle Final Approval
  const handleApprove = () => {
    if (!isTermsAccepted) {
      toast.error("Please confirm acceptance of commercial usage terms.");
      return;
    }

    startTransition(async () => {
      const res = await approveProjectAction(project.id);
      if (res.ok) {
        setIsApproved(true);
        setProjectStatus("client_approved");
        toast.success("Project officially approved! Final delivery archive unlocked.");
        setActiveTab("delivery");
      } else {
        toast.error(res.error || "Failed to record approval");
      }
    });
  };

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
              <span className="block text-[10px] text-brand-muted uppercase">Revision Quota</span>
              <span className="text-sm font-bold text-brand-light">
                {revisionsUsed} / {project.max_revisions} Rounds
              </span>
            </div>
            {isApproved && (
              <Button
                render={
                  <a
                    href={`/api/projects/${project.id}/download`}
                    download
                  >
                    Download ZIP
                  </a>
                }
                size="sm"
                className="cyber-glow bg-brand-success hover:bg-brand-success/90 text-white font-mono text-xs"
              />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-t border-brand-border pt-4 overflow-x-auto cyber-scrollbar">
          {[
            { id: "overview", label: "1. Scope & Tasks" },
            { id: "brief", label: "2. Creative Brief" },
            { id: "proofing", label: "3. Visual Proofing" },
            { id: "revisions", label: "4. Revisions Quota" },
            { id: "delivery", label: "5. Sign-Off & Delivery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "brief" | "proofing" | "revisions" | "delivery")}
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

      {/* TAB 1: OVERVIEW & TASKS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
              <h2 className="text-base font-bold text-brand-light font-mono">
                Production Milestones & Task Checklist
              </h2>
              <div className="space-y-2.5">
                {[
                  { title: "Creative Onboarding Brief Submission", done: isBriefSubmitted },
                  { title: "Production Kickoff & Creative Direction", done: projectStatus !== "awaiting_brief" },
                  { title: "Draft Asset Delivery & Visual Proofing", done: pins.length > 0 || isApproved },
                  { title: "Final Deliverable Archiving & Handover", done: isApproved },
                ].map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-brand-light flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          task.done
                            ? "bg-brand-success text-white border-brand-success font-bold"
                            : "border-brand-border text-brand-muted"
                        }`}
                      >
                        {task.done ? "✓" : idx + 1}
                      </span>
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        task.done ? "text-emerald-400" : "text-brand-muted"
                      }`}
                    >
                      {task.done ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
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
                  <span className="text-brand-light font-bold uppercase">{projectStatus}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-brand-muted">Revisions Allowed:</span>
                  <span className="text-brand-light font-bold">{project.max_revisions} Rounds</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-brand-muted">Licensing:</span>
                  <span className="text-emerald-400 font-bold">Full Buyout</span>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab("brief")}
                className="w-full font-mono text-xs cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white mt-2"
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
              Provide campaign objectives, target audience insights and platform specs to guide production.
            </p>
          </div>

          <form onSubmit={handleBriefSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                Brand / Business Entity Name
              </label>
              <Input
                value={briefForm.brandName}
                onChange={(e) => setBriefForm({ ...briefForm, brandName: e.target.value })}
                placeholder="e.g. Acme Tech Studio"
                disabled={isBriefSubmitted}
                className="bg-brand-surface border-brand-border text-brand-light h-10"
                required
              />
            </div>

            <div>
              <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                Campaign & Creative Objective
              </label>
              <textarea
                rows={3}
                value={briefForm.objective}
                onChange={(e) => setBriefForm({ ...briefForm, objective: e.target.value })}
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
                  onChange={(e) => setBriefForm({ ...briefForm, audience: e.target.value })}
                  placeholder="e.g. Gen-Z Bangladesh / US Tech Founders"
                  disabled={isBriefSubmitted}
                  className="bg-brand-surface border-brand-border text-brand-light h-10"
                />
              </div>

              <div>
                <label className="block text-brand-muted uppercase text-[11px] mb-1.5">
                  Primary Platforms & Media Channels
                </label>
                <Input
                  value={briefForm.platforms}
                  onChange={(e) => setBriefForm({ ...briefForm, platforms: e.target.value })}
                  placeholder="e.g. Instagram Reels, Facebook Ads, YouTube"
                  disabled={isBriefSubmitted}
                  className="bg-brand-surface border-brand-border text-brand-light h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border">
              {isBriefSubmitted ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓ Brief Verified & Locked in Production</span>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6 py-5"
                >
                  {isPending ? "Submitting..." : "Submit Creative Brief & Queue Production"}
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
            <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono text-brand-muted">
                Interactive Canvas: {isPinModeActive ? "Click canvas to place feedback pin" : "Inspection Mode"}
              </span>
              <Button
                variant={isPinModeActive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPinModeActive(!isPinModeActive)}
                className={`font-mono text-xs ${
                  isPinModeActive ? "bg-brand-highlight text-white cyber-glow" : "border-brand-border"
                }`}
              >
                {isPinModeActive ? "Cancel Pin Mode" : "+ Drop Feedback Pin"}
              </Button>
            </div>

            {/* Proofing Canvas */}
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`relative w-full aspect-[4/3] rounded-2xl border border-brand-border bg-brand-surface overflow-hidden flex items-center justify-center select-none ${
                isPinModeActive ? "cursor-crosshair ring-2 ring-brand-highlight" : "cursor-default"
              }`}
            >
              {/* Graphic Master Representation */}
              <div className="text-center space-y-3 pointer-events-none p-6">
                <div className="w-20 h-20 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-center mx-auto cyber-glow">
                  <span className="font-mono text-2xl font-black text-brand-highlight">FS</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-brand-light font-mono">
                    {project.title}
                  </h3>
                  <p className="text-xs text-brand-muted font-mono mt-1">
                    Master Draft Preview • Version 1.0
                  </p>
                </div>
              </div>

              {/* Rendered Pins */}
              {pins.map((pin, index) => (
                <div
                  key={pin.id}
                  style={{
                    left: `${pin.coord_x_percent}%`,
                    top: `${pin.coord_y_percent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-highlight text-white font-mono text-xs font-bold flex items-center justify-center shadow-lg cyber-glow ring-2 ring-white"
                  title={pin.feedback_text}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Thread */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="font-bold text-xs font-mono text-brand-light uppercase">
                  Pinned Feedback ({pins.length})
                </h3>
              </div>

              {pins.length === 0 ? (
                <p className="text-xs font-mono text-brand-muted py-6 text-center">
                  No visual feedback pins dropped yet. Click &ldquo;+ Drop Feedback Pin&rdquo; to click on the canvas.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto cyber-scrollbar pr-1">
                  {pins.map((pin, idx) => (
                    <div
                      key={pin.id}
                      className="p-3 rounded-xl bg-brand-surface border border-brand-border space-y-1 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-highlight">Pin #{idx + 1}</span>
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
                Revision Management & Quota Bounds
              </h2>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Each service scope includes contractually bounded revision rounds to preserve production velocity.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-brand-muted block uppercase">Remaining Rounds</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.max(0, project.max_revisions - revisionsUsed)}
              </span>
            </div>
          </div>

          <form onSubmit={handleRevisionSubmit} className="space-y-4 font-mono text-xs">
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
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6 py-5"
              >
                {isPending ? "Lodging Revision..." : `Submit Revision Round #${revisionsUsed + 1}`}
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
              Final Approval Sign-Off & Deliverable Handover
            </h2>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Verify completion, record final sign-off, and download verified high-resolution master asset archives.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-brand-light uppercase">
              Legal Clearances & Commercial Terms
            </h3>
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-brand-border bg-brand-black/40 cursor-pointer">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-brand-border text-brand-highlight"
              />
              <span className="text-brand-light text-xs font-sans">
                I hereby accept and approve the completed production deliverables for <strong>{project.title}</strong>, confirming all contractual terms and commercial rights transfers.
              </span>
            </label>

            {!isApproved ? (
              <Button
                onClick={handleApprove}
                disabled={!isTermsAccepted || isPending}
                className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs py-5"
              >
                {isPending ? "Processing Sign-off..." : "Approve Deliverables & Unlock Master ZIP Archive"}
              </Button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-between">
                  <span>✓ Deliverables Officially Signed Off & Approved</span>
                  <span className="text-[11px] text-brand-muted uppercase">Verified</span>
                </div>

                <div className="p-6 rounded-2xl border border-brand-highlight/40 bg-brand-highlight/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-brand-light">
                      Master Creative Production Archive (.ZIP)
                    </h4>
                    <p className="text-xs text-brand-muted">
                      Includes AI, PSD, SVG, PNG master vector assets and Certificate of Commercial Buyout.
                    </p>
                  </div>
                  <Button
                    render={
                      <a
                        href={`/api/projects/${project.id}/download`}
                        download
                      >
                        Download Master Archive (.ZIP)
                      </a>
                    }
                    size="lg"
                    className="cyber-glow bg-brand-success hover:bg-brand-success/90 text-white font-mono text-xs whitespace-nowrap"
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

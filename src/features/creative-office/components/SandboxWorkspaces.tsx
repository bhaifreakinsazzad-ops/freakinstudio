"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  ExternalLink,
  History,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";
import { useCreativeOffice } from "../context";
import { runKinetic } from "../utils/motion";

export function ClientWorkspaceDemo({
  initialProjectId,
  reducedMotion,
  onSwitchToStudio,
}: {
  initialProjectId: string;
  reducedMotion: boolean;
  onSwitchToStudio: () => void;
}) {
  const {
    projects,
    clientAcceptQuote,
    clientAddAnnotation,
    clientRequestRevision,
    clientApproveFinalVersion,
    resetDemoState,
  } = useCreativeOffice();

  const [userSelectedProjectId, setUserSelectedProjectId] = useState<
    string | null
  >(null);
  const selectedProjectId =
    userSelectedProjectId &&
    projects.some((p) => p.id === userSelectedProjectId)
      ? userSelectedProjectId
      : initialProjectId || projects[0]?.id;
  const setSelectedProjectId = (id: string) => setUserSelectedProjectId(id);

  const [annotationText, setAnnotationText] = useState("");
  const [revisionNote, setRevisionNote] = useState(
    "Round 2 consolidation: shift logo 8px higher and export CMYK proof."
  );
  const [clickCoords, setClickCoords] = useState({ x: 52, y: 46 });
  const workspaceCardRef = useRef<HTMLDivElement | null>(null);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    if (reducedMotion || !workspaceCardRef.current) return;
    runKinetic(workspaceCardRef.current, {
      opacity: [0.85, 1],
      y: [6, 0],
      duration: 280,
      ease: "outQuad",
    });
  }, [selectedProjectId, reducedMotion]);

  if (!activeProject) return null;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 p-6 sm:p-8 text-[#F6F4EF] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
            DEMO SANDBOX &bull; SIMULATED CLIENT WORKSPACE (NOT LIVE DATABASE)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            Client Office Sandbox — Pinned Proofing &amp; Event Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#F6F4EF]/80 mt-1">
            Interactive browser simulation showing brief → quote → production →
            pinned proofing → 2 consolidated revisions → approval.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold min-h-[44px]"
          >
            <span>Open Live Client Office (/dashboard)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onSwitchToStudio}
            className="px-4 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-white/15 text-xs font-bold min-h-[44px]"
          >
            Inspect Studio Pulse Demo
          </button>
          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#232528] text-[#D9BD81] text-xs font-bold min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          {projects.map((p) => {
            const active = p.id === activeProject.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left p-4 rounded-2xl border transition min-h-[68px] ${
                  active
                    ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81]"
                    : "bg-[#F6F4EF] text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={active ? "text-[#D9BD81]" : "text-[#232528]"}>
                    {p.id}
                  </span>
                  <span className="uppercase font-bold">{p.status}</span>
                </div>
                <div className="font-bold text-sm mt-1">{p.title}</div>
                <div
                  className={`text-xs mt-1 ${
                    active ? "text-[#F6F4EF]/75" : "text-[#232528]"
                  }`}
                >
                  {p.assignedExpert}
                </div>
              </button>
            );
          })}
        </div>

        <div ref={workspaceCardRef} className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 text-[#090A0A] space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#232528]/15 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#232528]">
                  {activeProject.id} &bull; {activeProject.serviceId}
                </span>
                <h3 className="text-xl font-bold mt-1">{activeProject.title}</h3>
                <p className="text-xs text-[#232528]">
                  Assigned Expert: <strong>{activeProject.assignedExpert}</strong>{" "}
                  &bull; Revisions Used: {activeProject.revisionsUsed} /{" "}
                  {activeProject.revisionsIncluded}
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-mono font-bold">
                STATUS: {activeProject.status}
              </span>
            </div>

            {activeProject.status === "quote_issued" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-amber-950">
                    Formal Quote Issued ({activeProject.scopedHours}h Scoped)
                  </strong>
                  <p className="text-amber-900">
                    Accept quote in sandbox to advance timeline toward active
                    production.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => clientAcceptQuote(activeProject.id)}
                  className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold min-h-[44px]"
                >
                  Accept Formal Quote (Demo)
                </button>
              </div>
            )}

            {/* Pinned Annotation Board */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase text-[#232528]">
                Click Artboard Specimen to Drop Pin Annotation (
                {activeProject.proofVersion})
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(
                    ((e.clientX - rect.left) / rect.width) * 100
                  );
                  const y = Math.round(
                    ((e.clientY - rect.top) / rect.height) * 100
                  );
                  setClickCoords({ x, y });
                }}
                className="relative h-56 rounded-2xl bg-[#090A0A] border-2 border-[#D9BD81]/40 overflow-hidden cursor-crosshair flex flex-col items-center justify-center p-4 text-center"
              >
                <div className="text-xs font-mono text-[#D9BD81]">
                  PROOF SPECIMEN ({activeProject.proofVersion})
                </div>
                <div className="text-sm font-bold text-[#F6F4EF] mt-1 max-w-md">
                  {activeProject.proofNotes}
                </div>
                <div className="text-[11px] text-[#F6F4EF]/60 mt-2">
                  Selected pin coordinates: ({clickCoords.x}%, {clickCoords.y}%)
                </div>

                {activeProject.annotations.map((ann, idx) => (
                  <div
                    key={ann.id}
                    style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                    title={`${ann.author}: ${ann.text}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#D9BD81] text-[#090A0A] font-mono font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder={`Pin feedback at (${clickCoords.x}%, ${clickCoords.y}%)...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#232528]/25 bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!annotationText.trim()) return;
                    clientAddAnnotation(
                      activeProject.id,
                      clickCoords.x,
                      clickCoords.y,
                      annotationText.trim()
                    );
                    setAnnotationText("");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Drop Pin Note</span>
                </button>
              </div>
            </div>

            {/* Revision / Final Approval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-2.5">
                <div className="text-xs font-bold uppercase text-[#232528]">
                  Request Consolidated Revision
                </div>
                <input
                  type="text"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#232528]/20 text-xs"
                />
                <button
                  type="button"
                  disabled={
                    activeProject.revisionsUsed >=
                    activeProject.revisionsIncluded
                  }
                  onClick={() =>
                    clientRequestRevision(activeProject.id, revisionNote)
                  }
                  className="w-full py-2.5 rounded-xl border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[44px] disabled:opacity-50"
                >
                  Submit Revision ({activeProject.revisionsUsed}/
                  {activeProject.revisionsIncluded})
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#090A0A] text-[#F6F4EF] flex flex-col justify-between space-y-2.5">
                <div className="text-xs font-bold uppercase text-[#D9BD81]">
                  Client Sign-Off Gate
                </div>
                <p className="text-xs text-[#F6F4EF]/75">
                  Approving unlocks final asset handover dispatch by Studio Desk.
                </p>
                <button
                  type="button"
                  onClick={() => clientApproveFinalVersion(activeProject.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Proof Version</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Event Timeline */}
          <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 text-[#F6F4EF] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D9BD81]">
              <History className="w-4 h-4" />
              <span>PERSISTENT EVENT TIMELINE ({activeProject.events.length})</span>
            </div>
            <div className="space-y-2">
              {activeProject.events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-[#232528] text-xs flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-[#D9BD81]">
                      [{evt.actorKind.toUpperCase()}] {evt.actorName}:
                    </span>{" "}
                    <span>{evt.summary}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#F6F4EF]/65">
                    {evt.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudioAdminDemo({
  onSwitchToClient,
}: {
  onSwitchToClient: (projectId?: string) => void;
}) {
  const {
    projects,
    aiEnabled,
    setAiEnabled,
    dailyBudgetBdt,
    setDailyBudgetBdt,
    adminLogs,
    adminIssueQuote,
    adminAssignExpert,
    adminAdvanceStage,
    adminGenerateSiProposal,
    adminDecideSiProposal,
  } = useCreativeOffice();

  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || ""
  );
  const [expertChoice, setExpertChoice] = useState(
    "Arafat Rahman — Lead Brand Designer"
  );
  const [proofMessage, setProofMessage] = useState(
    "Uploaded high-resolution proof v2.0 with CMYK bleed margins verified."
  );

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (!activeProject) return null;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 p-6 sm:p-8 text-[#F6F4EF] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
            DEMO SANDBOX &bull; SIMULATED STUDIO OPS CONSOLE (NOT LIVE DATABASE)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            Studio Pulse Sandbox — Human Control + Gated SI Assistant
          </h2>
          <p className="text-xs sm:text-sm text-[#F6F4EF]/80 mt-1">
            Demonstrates manual quoting, designer assignment, gated SI
            proposals, and AI Gateway cost guardrails before touching Supabase.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold min-h-[44px]"
          >
            <span>Open Live Studio Admin (/admin)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onSwitchToClient(activeProject.id)}
            className="px-4 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-white/15 text-xs font-bold min-h-[44px]"
          >
            View in Client Sandbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          {projects.map((p) => {
            const active = p.id === activeProject.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left p-4 rounded-2xl border transition min-h-[68px] ${
                  active
                    ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81]"
                    : "bg-[#F6F4EF] text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={active ? "text-[#D9BD81]" : "text-[#232528]"}>
                    {p.id}
                  </span>
                  <span className="uppercase font-bold">{p.status}</span>
                </div>
                <div className="font-bold text-sm mt-1">{p.title}</div>
                <div
                  className={`text-xs mt-1 ${
                    active ? "text-[#F6F4EF]/70" : "text-[#232528]"
                  }`}
                >
                  {p.clientName} &bull; {p.scopedHours}h
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 text-[#090A0A] space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#232528]/15 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#232528]">
                  MANUAL PRODUCTION CONTROLS &bull; {activeProject.id}
                </span>
                <h3 className="text-xl font-bold mt-1">{activeProject.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-mono font-bold">
                STAGE: {activeProject.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
                <div className="text-xs font-bold uppercase text-[#232528]">
                  1. Quote &amp; Scope Authority
                </div>
                <button
                  type="button"
                  onClick={() => adminIssueQuote(activeProject.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                >
                  Issue Formal Quote ({activeProject.scopedHours}h)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
                <div className="text-xs font-bold uppercase text-[#232528]">
                  2. Assign Human Expert
                </div>
                <select
                  aria-label="Select Human Expert"
                  value={expertChoice}
                  onChange={(e) => setExpertChoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#232528]/25 text-xs font-semibold"
                >
                  <option>Arafat Rahman — Lead Brand Designer</option>
                  <option>Nusrat Jahan — Senior Visual Designer</option>
                  <option>Tanvir Ahmed — Motion &amp; Edit Specialist</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    adminAssignExpert(activeProject.id, expertChoice)
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                >
                  Assign Expert &amp; Start Production
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
              <div className="text-xs font-bold uppercase text-[#232528]">
                3. Proof Dispatch &amp; Delivery Gate
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={proofMessage}
                  onChange={(e) => setProofMessage(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#232528]/25 text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    adminAdvanceStage(
                      activeProject.id,
                      "proof_ready",
                      proofMessage
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                >
                  Publish Proof
                </button>
                <button
                  type="button"
                  onClick={() =>
                    adminAdvanceStage(
                      activeProject.id,
                      "completed",
                      "Human QA passed. Final deliverable package unlocked."
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold min-h-[44px]"
                >
                  Mark Completed
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0A] text-[#F6F4EF] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#D9BD81]">
                  <Bot className="w-4 h-4" />
                  <span>SI ASSISTANT HUMAN APPROVAL GATE</span>
                </div>
                <button
                  type="button"
                  onClick={() => adminGenerateSiProposal(activeProject.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40 text-xs font-bold min-h-[40px]"
                >
                  + Run Scoped SI Draft
                </button>
              </div>

              <div className="space-y-2">
                {activeProject.siProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-3 rounded-xl bg-[#232528] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="font-bold text-[#D9BD81]">
                        {prop.task} ({prop.status})
                      </div>
                      <p className="text-[#F6F4EF]/85">{prop.summary}</p>
                    </div>
                    {prop.status === "suggested" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            adminDecideSiProposal(
                              activeProject.id,
                              prop.id,
                              "approved"
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-[#D9BD81] text-[#090A0A] font-bold min-h-[40px]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            adminDecideSiProposal(
                              activeProject.id,
                              prop.id,
                              "rejected"
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-rose-900/60 text-rose-200 font-bold min-h-[40px]"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 text-[#F6F4EF] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#D9BD81]" />
                <div>
                  <div className="text-xs font-mono text-[#D9BD81]">
                    SANDBOX AI GUARDRAILS PREVIEW
                  </div>
                  <div className="text-base font-bold">
                    Live kill switch is enforced server-side in /admin
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold min-h-[44px] ${
                  aiEnabled
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {aiEnabled ? "Sandbox AI: ACTIVE" : "Sandbox AI: PAUSED"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#232528]">
                <div className="text-[#F6F4EF]/70">Daily Budget Simulation</div>
                <input
                  type="number"
                  value={dailyBudgetBdt}
                  onChange={(e) => setDailyBudgetBdt(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 rounded bg-[#090A0A] text-[#D9BD81] font-mono font-bold border border-[#D9BD81]/30"
                />
              </div>
              <div className="p-3 rounded-xl bg-[#232528] flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Latest Log: {adminLogs[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileUp,
  Power,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProjectStatusAction,
  assignProjectStaffAction,
  addProjectEventAction,
  reviewSiProposalAction,
  registerProjectProofAssetAction,
  updateInquiryStatusAction,
  updateAiGatewayConfigAction,
  updateServicePricingAction,
  issueQuoteAction,
} from "./actions";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";
import type {
  AdminProjectRow,
  AdminQuoteRow,
  AdminOrderRow,
  AdminInquiryRow,
  AdminProjectEventRow,
  AdminAiGatewayConfig,
  AdminAiUsageRow,
  AdminStaffCandidate,
  AdminAuditLogRow,
  AdminCatalogServiceRow,
} from "./page";
import type { PricingStatus } from "@/types/domain";

interface AdminConsoleClientProps {
  initialProjects: AdminProjectRow[];
  initialQuotes: AdminQuoteRow[];
  initialOrders: AdminOrderRow[];
  initialInquiries: AdminInquiryRow[];
  initialProjectEvents: AdminProjectEventRow[];
  initialAiConfig: AdminAiGatewayConfig;
  initialAiUsage: AdminAiUsageRow[];
  aiSpendTodayBdt: number;
  staffCandidates: AdminStaffCandidate[];
  initialAuditLogs: AdminAuditLogRow[];
  services: AdminCatalogServiceRow[];
  dbLoadError: string | null;
}

const VALID_DB_PROJECT_STATUSES = [
  "awaiting_brief",
  "brief_submitted",
  "in_production",
  "client_review",
  "revision_requested",
  "revision_in_progress",
  "client_approved",
  "completed",
  "cancelled",
] as const;

const INQUIRY_STATUSES: AdminInquiryRow["status"][] = [
  "new",
  "reviewing",
  "quoted",
  "converted",
  "archived",
];

type AdminTab =
  | "projects"
  | "human_si"
  | "quotes"
  | "orders"
  | "inquiries"
  | "ai_gateway"
  | "catalog"
  | "audit"
  | "studio_pulse_demo";

export function AdminConsoleClient({
  initialProjects,
  initialQuotes,
  initialOrders,
  initialInquiries,
  initialProjectEvents,
  initialAiConfig,
  initialAiUsage,
  aiSpendTodayBdt,
  staffCandidates,
  initialAuditLogs,
  services,
  dbLoadError,
}: AdminConsoleClientProps) {
  const [tab, setTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [orders] = useState(initialOrders);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [projectEvents, setProjectEvents] = useState(initialProjectEvents);
  const [aiConfig, setAiConfig] = useState(initialAiConfig);
  const [aiUsage] = useState(initialAiUsage);
  const [auditLogs] = useState(initialAuditLogs);
  const [catalogList, setCatalogList] = useState(services);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Quote editing state
  const [quoteAmounts, setQuoteAmounts] = useState<
    Record<string, { bdt: string; usd: string; notes: string }>
  >({});

  // Catalog row editing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceValues, setEditServiceValues] = useState<{
    bdt: string;
    usd: string;
    status: PricingStatus;
    ratebookApproved: boolean;
  }>({ bdt: "", usd: "", status: "quote_required", ratebookApproved: false });

  // Proof upload state
  const [uploadProjectId, setUploadProjectId] = useState<string>(
    initialProjects[0]?.id || ""
  );
  const [proofVersionLabel, setProofVersionLabel] = useState("Proof v1");
  const [proofRevisionRound, setProofRevisionRound] = useState("0");
  const [proofIsSource, setProofIsSource] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Human + SI Event form state
  const [eventProjectId, setEventProjectId] = useState<string>(
    initialProjects[0]?.id || ""
  );
  const [eventActorKind, setEventActorKind] = useState<
    "human_expert" | "si_assistant"
  >("human_expert");
  const [eventVisibility, setEventVisibility] = useState<
    "client" | "studio_internal"
  >("client");
  const [eventSummary, setEventSummary] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  // AI Gateway settings form
  const [savingAiCfg, setSavingAiCfg] = useState(false);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const prevProjects = projects;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
    const res = await updateProjectStatusAction(projectId, newStatus);
    if (res.ok) {
      toast.success(`Project status updated to ${newStatus}`);
    } else {
      setProjects(prevProjects);
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleAssignStaff = async (
    projectId: string,
    updates: {
      assignedPmId?: string | null;
      assignedDesignerId?: string | null;
      expressSlotConfirmed?: boolean;
    }
  ) => {
    const res = await assignProjectStaffAction(projectId, updates);
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                ...(updates.assignedPmId !== undefined
                  ? { assigned_pm_id: updates.assignedPmId }
                  : {}),
                ...(updates.assignedDesignerId !== undefined
                  ? { assigned_designer_id: updates.assignedDesignerId }
                  : {}),
                ...(updates.expressSlotConfirmed !== undefined
                  ? { express_slot_confirmed: updates.expressSlotConfirmed }
                  : {}),
              }
            : p
        )
      );
      toast.success("Project assignment & slot status updated.");
    } else {
      toast.error(res.error || "Assignment update failed");
    }
  };

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProjectId || !proofFile) {
      toast.error("Select a project and a proof file to upload.");
      return;
    }

    setUploadingProof(true);
    try {
      const fd = new FormData();
      fd.set("projectId", uploadProjectId);
      fd.set("versionLabel", proofVersionLabel);
      fd.set("revisionRound", proofRevisionRound);
      fd.set("isSourceFile", String(proofIsSource));
      fd.set("file", proofFile);

      const res = await registerProjectProofAssetAction(fd);
      if (res.ok) {
        toast.success(
          `Uploaded ${proofVersionLabel} (SHA-256 ${res.sha256?.slice(0, 10)}…). Project moved to client_review.`
        );
        setProofFile(null);
        setProjects((prev) =>
          prev.map((p) =>
            p.id === uploadProjectId ? { ...p, status: "client_review" } : p
          )
        );
      } else {
        toast.error(res.error || "Failed to upload proof asset.");
      }
    } finally {
      setUploadingProof(false);
    }
  };

  const handleLogProjectEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventProjectId || !eventSummary.trim()) {
      toast.error("Select a project and enter an update summary.");
      return;
    }
    setSavingEvent(true);
    try {
      const res = await addProjectEventAction(eventProjectId, {
        actorKind: eventActorKind,
        eventType:
          eventActorKind === "si_assistant"
            ? "SI_DRAFT_NOTE"
            : "HUMAN_PRODUCTION_UPDATE",
        summary: eventSummary.trim(),
        visibility: eventVisibility,
      });
      if (res.ok && res.event) {
        setProjectEvents((prev) => [
          res.event as AdminProjectEventRow,
          ...prev,
        ]);
        setEventSummary("");
        toast.success(
          eventActorKind === "si_assistant"
            ? "SI Assistant draft recorded for human approval."
            : "Human production event logged."
        );
      } else {
        toast.error(res.error || "Failed to log project event.");
      }
    } finally {
      setSavingEvent(false);
    }
  };

  const handleReviewSi = async (
    eventId: string,
    decision: "human_approved" | "rejected"
  ) => {
    const res = await reviewSiProposalAction(eventId, decision);
    if (res.ok) {
      setProjectEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                si_status: decision,
                visibility:
                  decision === "human_approved" ? "client" : "studio_internal",
              }
            : ev
        )
      );
      toast.success(
        decision === "human_approved"
          ? "SI proposal approved by human lead and shared with client timeline."
          : "SI proposal rejected and kept internal."
      );
    } else {
      toast.error(res.error || "Failed to update SI proposal");
    }
  };

  const handleIssueQuote = async (quoteId: string) => {
    const entry = quoteAmounts[quoteId];
    const existing = quotes.find((q) => q.id === quoteId);
    const bdt = Number(entry?.bdt || existing?.amount_bdt || 15000);
    const usd = Number(entry?.usd || existing?.amount_usd || 150);
    const notes =
      entry?.notes || "Approved hourly scope quotation issued by Studio Lead";

    const res = await issueQuoteAction(quoteId, bdt, usd, notes);
    if (res.ok) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? {
                ...q,
                status: "issued",
                amount_bdt: bdt,
                amount_usd: usd,
                admin_notes: notes,
              }
            : q
        )
      );
      toast.success(`Formal quote ${existing?.quote_ref || quoteId.slice(0, 8)} issued`);
    } else {
      toast.error(res.error || "Failed to issue quotation");
    }
  };

  const handleInquiryStatus = async (
    inquiryId: string,
    status: AdminInquiryRow["status"]
  ) => {
    const res = await updateInquiryStatusAction(inquiryId, status);
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq))
      );
      toast.success(`Inquiry status updated to ${status}`);
    } else {
      toast.error(res.error || "Failed to update inquiry");
    }
  };

  const handleSaveAiConfig = async () => {
    setSavingAiCfg(true);
    try {
      const res = await updateAiGatewayConfigAction({
        killSwitchActive: aiConfig.kill_switch_active,
        dailyBudgetCapBdt: Number(aiConfig.daily_budget_cap_bdt),
        guestDailyQuota: Number(aiConfig.guest_daily_quota),
      });
      if (res.ok) {
        toast.success("Server AI Gateway configuration saved.");
      } else {
        toast.error(res.error || "Failed to update AI Gateway config");
      }
    } finally {
      setSavingAiCfg(false);
    }
  };

  const startEditService = (srv: AdminCatalogServiceRow) => {
    setEditingServiceId(srv.id);
    setEditServiceValues({
      bdt: String(srv.base_bdt),
      usd: String(srv.base_usd),
      status: srv.pricing_status,
      ratebookApproved: srv.ratebook_approved,
    });
  };

  const saveEditService = async (serviceId: string) => {
    const bdt = Number(editServiceValues.bdt);
    const usd = Number(editServiceValues.usd);
    if (!Number.isFinite(bdt) || bdt <= 0 || !Number.isFinite(usd) || usd <= 0) {
      toast.error("Please enter valid positive numbers for BDT and USD rates.");
      return;
    }

    const res = await updateServicePricingAction(serviceId, {
      base_bdt: bdt,
      base_usd: usd,
      pricing_status: editServiceValues.status,
      ratebook_approved: editServiceValues.ratebookApproved,
    });

    if (res.ok) {
      setCatalogList((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                base_bdt: bdt,
                base_usd: usd,
                pricing_status: editServiceValues.status,
                ratebook_approved: editServiceValues.ratebookApproved,
              }
            : s
        )
      );
      setEditingServiceId(null);
      toast.success(`Updated ratebook entry for ${serviceId}`);
    } else {
      toast.error(res.error || "Failed to update service pricing");
    }
  };

  const filteredCatalog = catalogList.filter((s) => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    );
  });

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenueBDT = paidOrders.reduce(
    (sum, o) => sum + Number(o.amount_bdt || 0),
    0
  );
  const pendingQuotesCount = quotes.filter((q) =>
    ["pending", "under_review"].includes(q.status)
  ).length;
  const openInquiriesCount = inquiries.filter((i) =>
    ["new", "reviewing"].includes(i.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Database Load Warning */}
      {dbLoadError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3 text-xs font-mono text-amber-200"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-wider text-amber-300">
              Live Database Connection Warning
            </p>
            <p className="mt-1 text-amber-200/85">{dbLoadError}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232528] pb-6">
        <div>
          <span className="badge-mono text-[#D9BD81]">
            Studio Pulse Operations Console &bull; Real Database State
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF] mt-1">
            Studio Pulse &amp; Production Administration
          </h1>
          <p className="text-xs text-[#F6F4EF]/70 mt-1">
            Manage real client quotations, inquiries, Human + SI project timelines,
            proof uploads, ratebook approval, and AI budget controls.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Projects
            </span>
            <span className="text-lg font-bold text-[#F6F4EF]">
              {projects.length}
            </span>
          </div>
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Pending Quotes
            </span>
            <span className="text-lg font-bold text-[#D9BD81]">
              {pendingQuotesCount}
            </span>
          </div>
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Open Inquiries
            </span>
            <span className="text-lg font-bold text-[#D9BD81]">
              {openInquiriesCount}
            </span>
          </div>
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Settled BDT
            </span>
            <span className="text-lg font-bold text-emerald-400">
              ৳{totalRevenueBDT.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#232528] pb-3">
        {(
          [
            ["projects", `Live Projects (${projects.length})`],
            ["human_si", `Human + SI Office (${projectEvents.length})`],
            ["quotes", `Quotes (${quotes.length})`],
            ["orders", `Orders (${orders.length})`],
            ["inquiries", `Inquiries (${inquiries.length})`],
            ["ai_gateway", "AI Gateway & Kill Switch"],
            ["catalog", `Ratebook (${catalogList.length})`],
            ["audit", `Audit Log (${auditLogs.length})`],
            ["studio_pulse_demo", "DEMO DATA • Studio Pulse Sandbox"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-colors border ${
              tab === key
                ? "bg-[#D9BD81] text-[#090A0A] border-[#D9BD81] font-bold"
                : key === "studio_pulse_demo"
                  ? "bg-[#121315] text-[#D9BD81] border-[#D9BD81]/40 hover:bg-[#D9BD81]/10"
                  : "bg-[#121315] text-[#F6F4EF]/75 border-[#232528] hover:text-[#F6F4EF]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB: Live DB Projects */}
      {tab === "projects" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
            {projects.length === 0 ? (
              <div className="p-10 text-center space-y-3 font-mono text-xs text-[#F6F4EF]/65">
                <p>
                  0 live projects in database. (Truthful empty state — no
                  fabricated fallback projects).
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setTab("studio_pulse_demo")}
                  className="border-[#D9BD81]/40 text-[#D9BD81] font-mono text-xs"
                >
                  Open DEMO DATA &bull; Studio Pulse Sandbox
                </Button>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Project</th>
                    <th className="p-4">Revisions</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Assign PM / Designer</th>
                    <th className="p-4">Express Slot</th>
                    <th className="p-4 text-right">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232528]">
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td className="p-4">
                        <div className="font-bold text-[#F6F4EF]">{p.title}</div>
                        <div className="text-[10px] text-[#F6F4EF]/55">
                          ID: {p.id.slice(0, 12)}
                        </div>
                      </td>
                      <td className="p-4 text-[#F6F4EF]/80">
                        {p.revisions_used} / {p.max_revisions}
                      </td>
                      <td className="p-4">
                        <select
                          aria-label={`Transition stage for ${p.title}`}
                          value={p.status}
                          onChange={(e) =>
                            handleStatusChange(p.id, e.target.value)
                          }
                          className="rounded border border-[#232528] bg-[#090A0A] px-2.5 py-1.5 text-xs text-[#F6F4EF]"
                        >
                          {VALID_DB_PROJECT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 space-y-1.5">
                        <select
                          aria-label={`Assign PM for ${p.title}`}
                          value={p.assigned_pm_id || ""}
                          onChange={(e) =>
                            handleAssignStaff(p.id, {
                              assignedPmId: e.target.value || null,
                            })
                          }
                          className="block w-full rounded border border-[#232528] bg-[#090A0A] px-2 py-1 text-[11px] text-[#F6F4EF]"
                        >
                          <option value="">PM: Unassigned</option>
                          {staffCandidates.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              PM: {staff.full_name || staff.email} ({staff.role})
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label={`Assign Designer for ${p.title}`}
                          value={p.assigned_designer_id || ""}
                          onChange={(e) =>
                            handleAssignStaff(p.id, {
                              assignedDesignerId: e.target.value || null,
                            })
                          }
                          className="block w-full rounded border border-[#232528] bg-[#090A0A] px-2 py-1 text-[11px] text-[#F6F4EF]"
                        >
                          <option value="">Creator: Unassigned</option>
                          {staffCandidates.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              Creator: {staff.full_name || staff.email} (
                              {staff.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignStaff(p.id, {
                              expressSlotConfirmed: !p.express_slot_confirmed,
                            })
                          }
                          className={`px-2.5 py-1 rounded text-[10px] border ${
                            p.express_slot_confirmed
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65"
                          }`}
                        >
                          {p.express_slot_confirmed
                            ? "10m Slot Confirmed"
                            : "Standard Queue"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/projects/${p.id}`}
                          className="text-[#D9BD81] hover:underline whitespace-nowrap"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Proof Asset Storage Upload Panel */}
          {projects.length > 0 && (
            <form
              onSubmit={handleProofUpload}
              className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-4 font-mono text-xs"
            >
              <div className="flex items-center gap-2 text-[#D9BD81] font-bold uppercase tracking-wider">
                <FileUp className="h-4 w-4" />
                Upload Studio Proof Deliverable (Private Storage + SHA-256)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Target Project
                  </label>
                  <select
                    value={uploadProjectId}
                    onChange={(e) => setUploadProjectId(e.target.value)}
                    className="w-full rounded border border-[#232528] bg-[#090A0A] px-2.5 py-2 text-xs text-[#F6F4EF]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Version Label
                  </label>
                  <Input
                    value={proofVersionLabel}
                    onChange={(e) => setProofVersionLabel(e.target.value)}
                    placeholder="Proof v1"
                    className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Revision Round
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={proofRevisionRound}
                    onChange={(e) => setProofRevisionRound(e.target.value)}
                    className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Deliverable File (Max 25MB)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="block w-full text-[11px] text-[#F6F4EF]/80"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-[#F6F4EF]/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proofIsSource}
                    onChange={(e) => setProofIsSource(e.target.checked)}
                    className="rounded border-[#232528]"
                  />
                  Mark as editable source deliverable (unlocks post-approval ZIP)
                </label>
                <Button
                  type="submit"
                  disabled={uploadingProof}
                  className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs h-9"
                >
                  {uploadingProof
                    ? "Hashing & Uploading..."
                    : "Upload Proof & Notify Client"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB: Human + SI Production Office */}
      {tab === "human_si" && (
        <div className="space-y-6 font-mono text-xs">
          {projects.length > 0 && (
            <form
              onSubmit={handleLogProjectEvent}
              className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#D9BD81] font-bold uppercase tracking-wider">
                <UserCheck className="h-4 w-4" />
                Record Human Production Milestone or SI Assistant Draft
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Project
                  </label>
                  <select
                    value={eventProjectId}
                    onChange={(e) => setEventProjectId(e.target.value)}
                    className="w-full rounded border border-[#232528] bg-[#090A0A] px-2.5 py-2 text-xs text-[#F6F4EF]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Actor Role
                  </label>
                  <select
                    value={eventActorKind}
                    onChange={(e) =>
                      setEventActorKind(
                        e.target.value as "human_expert" | "si_assistant"
                      )
                    }
                    className="w-full rounded border border-[#232528] bg-[#090A0A] px-2.5 py-2 text-xs text-[#F6F4EF]"
                  >
                    <option value="human_expert">Human Studio Expert</option>
                    <option value="si_assistant">
                      SI Assistant Draft (Requires Human Approval)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                    Visibility
                  </label>
                  <select
                    value={eventVisibility}
                    onChange={(e) =>
                      setEventVisibility(
                        e.target.value as "client" | "studio_internal"
                      )
                    }
                    className="w-full rounded border border-[#232528] bg-[#090A0A] px-2.5 py-2 text-xs text-[#F6F4EF]"
                  >
                    <option value="client">Visible to Client</option>
                    <option value="studio_internal">Studio Internal Only</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={eventSummary}
                  onChange={(e) => setEventSummary(e.target.value)}
                  placeholder="Describe verified milestone, QC check, or SI layout suggestion..."
                  className="bg-[#090A0A] border-[#232528] h-10 text-xs text-[#F6F4EF]"
                />
                <Button
                  type="submit"
                  disabled={savingEvent}
                  className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold h-10 px-6 shrink-0"
                >
                  {savingEvent ? "Saving..." : "Append Event"}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
            {projectEvents.length === 0 ? (
              <div className="p-10 text-center text-[#F6F4EF]/60">
                No project_events recorded yet. Actions in Client Workspace or
                Admin Console append real persistent events here.
              </div>
            ) : (
              <div className="divide-y divide-[#232528]">
                {projectEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-[#D9BD81]/10 text-[#D9BD81] border border-[#D9BD81]/30">
                          {ev.actor_kind}
                        </span>
                        <span className="text-[#F6F4EF] font-bold">
                          {ev.event_type}
                        </span>
                        <span className="text-[10px] text-[#F6F4EF]/55">
                          ({ev.visibility})
                        </span>
                        {ev.si_status && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/40 text-amber-300">
                            SI: {ev.si_status}
                          </span>
                        )}
                      </div>
                      <p className="text-[#F6F4EF]/85">{ev.summary}</p>
                      <p className="text-[10px] text-[#F6F4EF]/50">
                        Project {ev.project_id.slice(0, 8)} &bull;{" "}
                        {new Date(ev.created_at).toLocaleString()}
                      </p>
                    </div>
                    {ev.actor_kind === "si_assistant" &&
                      ev.si_status === "suggested" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleReviewSi(ev.id, "human_approved")
                            }
                            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve for Client
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewSi(ev.id, "rejected")}
                            className="h-8 border-red-500/40 text-red-300 text-[11px]"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Live DB Quotes */}
      {tab === "quotes" && (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="rounded-xl border border-[#232528] bg-[#121315] p-10 text-center text-xs font-mono text-[#F6F4EF]/65">
              0 live quotes in database. (Truthful empty state — no fabricated
              quotes).
            </div>
          ) : (
            quotes.map((q) => {
              const draft = quoteAmounts[q.id] || {
                bdt: String(q.amount_bdt || 15000),
                usd: String(q.amount_usd || 150),
                notes:
                  q.admin_notes ||
                  "Formal hourly scope quotation issued by Studio Operations",
              };
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-4 font-mono text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232528] pb-3">
                    <div>
                      <span className="font-bold text-[#F6F4EF] text-sm">
                        {q.quote_ref || `Quote #${q.id.slice(0, 12)}`}
                      </span>
                      <span className="ml-3 text-[#F6F4EF]/60">
                        Client: {q.client_id.slice(0, 12)}
                      </span>
                      <span className="ml-3 text-[#F6F4EF]/55">
                        Ratebook: {q.ratebook_version}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded uppercase text-[10px] border border-[#D9BD81]/40 text-[#D9BD81]">
                      {q.status}
                    </span>
                  </div>

                  {q.scope_snapshot?.brief?.brandName && (
                    <p className="text-[#F6F4EF]/80">
                      Brand: <strong>{q.scope_snapshot.brief.brandName}</strong>{" "}
                      &mdash; {q.scope_snapshot.brief.objective}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[10px] uppercase text-[#F6F4EF]/60 block mb-1">
                        Approved BDT (৳)
                      </label>
                      <Input
                        type="number"
                        value={draft.bdt}
                        onChange={(e) =>
                          setQuoteAmounts({
                            ...quoteAmounts,
                            [q.id]: { ...draft, bdt: e.target.value },
                          })
                        }
                        className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#F6F4EF]/60 block mb-1">
                        Approved USD ($)
                      </label>
                      <Input
                        type="number"
                        value={draft.usd}
                        onChange={(e) =>
                          setQuoteAmounts({
                            ...quoteAmounts,
                            [q.id]: { ...draft, usd: e.target.value },
                          })
                        }
                        className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#F6F4EF]/60 block mb-1">
                        Studio Lead Notes
                      </label>
                      <Input
                        value={draft.notes}
                        onChange={(e) =>
                          setQuoteAmounts({
                            ...quoteAmounts,
                            [q.id]: { ...draft, notes: e.target.value },
                          })
                        }
                        className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleIssueQuote(q.id)}
                      disabled={
                        !["pending", "under_review", "issued"].includes(q.status)
                      }
                      className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs h-9"
                    >
                      Issue Formal Quotation &rarr;
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: Live DB Orders */}
      {tab === "orders" && (
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-[#F6F4EF]/65">
              0 live payment orders in database. (Truthful empty state — no fake
              paid orders).
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Amount (BDT / USD)</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      {ord.order_ref || ord.id.slice(0, 12)}
                      {ord.is_test && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] rounded border border-amber-500/40 text-amber-300">
                          TEST
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded uppercase text-[10px] border border-[#D9BD81]/30 text-[#D9BD81]">
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[#F6F4EF]/75">
                      {ord.gateway || "PENDING"}
                    </td>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      ৳{Number(ord.amount_bdt).toLocaleString()} / $
                      {Number(ord.amount_usd).toLocaleString()}
                    </td>
                    <td className="p-4 text-[#F6F4EF]/60">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: Inquiries */}
      {tab === "inquiries" && (
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
          {inquiries.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-[#F6F4EF]/65">
              0 inquiries logged in database. Consultation submissions from
              /contact appear here persistently.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Ref</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Discipline &amp; Timeline</th>
                  <th className="p-4">Brief</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="p-4 font-bold text-[#D9BD81] whitespace-nowrap">
                      {inq.reference_id}
                    </td>
                    <td className="p-4">
                      <div className="text-[#F6F4EF] font-semibold">
                        {inq.full_name}
                      </div>
                      <div className="text-[11px] text-[#F6F4EF]/65">
                        {inq.work_email}
                      </div>
                    </td>
                    <td className="p-4 text-[#F6F4EF]/80">
                      <div>{inq.discipline}</div>
                      <div className="text-[10px] text-[#F6F4EF]/55">
                        {inq.timeline}
                      </div>
                    </td>
                    <td className="p-4 text-[#F6F4EF]/80 max-w-sm">
                      {inq.brief}
                    </td>
                    <td className="p-4">
                      <select
                        aria-label={`Status for inquiry ${inq.reference_id}`}
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatus(
                            inq.id,
                            e.target.value as AdminInquiryRow["status"]
                          )
                        }
                        className="rounded border border-[#232528] bg-[#090A0A] px-2 py-1 text-xs text-[#F6F4EF]"
                      >
                        {INQUIRY_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: AI Gateway & Kill Switch */}
      {tab === "ai_gateway" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232528] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#F6F4EF] flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#D9BD81]" />
                  Studio-Sponsored AI Gateway &amp; Budget Guard
                </h2>
                <p className="text-[#F6F4EF]/65 mt-1">
                  Server-enforced protection for Puter Sponsored AI (zero visitor
                  login). Spend Today:{" "}
                  <strong className="text-[#D9BD81]">
                    ৳{aiSpendTodayBdt.toFixed(2)}
                  </strong>{" "}
                  / ৳{aiConfig.daily_budget_cap_bdt}
                </p>
              </div>
              <Button
                type="button"
                variant={aiConfig.kill_switch_active ? "destructive" : "outline"}
                onClick={() =>
                  setAiConfig((prev) => ({
                    ...prev,
                    kill_switch_active: !prev.kill_switch_active,
                  }))
                }
                className="font-mono text-xs h-10"
              >
                <Power className="h-4 w-4 mr-2" />
                {aiConfig.kill_switch_active
                  ? "KILL SWITCH ACTIVE (AI PAUSED)"
                  : "AI Gateway Active — Click to Pause"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                  Daily Studio Budget Cap (BDT)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={aiConfig.daily_budget_cap_bdt}
                  onChange={(e) =>
                    setAiConfig({
                      ...aiConfig,
                      daily_budget_cap_bdt: Number(e.target.value),
                    })
                  }
                  className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#F6F4EF]/60 mb-1">
                  Guest Daily Trial Quota
                </label>
                <Input
                  type="number"
                  min={0}
                  value={aiConfig.guest_daily_quota}
                  onChange={(e) =>
                    setAiConfig({
                      ...aiConfig,
                      guest_daily_quota: Number(e.target.value),
                    })
                  }
                  className="bg-[#090A0A] border-[#232528] h-9 text-xs text-[#F6F4EF]"
                />
              </div>
              <Button
                type="button"
                disabled={savingAiCfg}
                onClick={handleSaveAiConfig}
                className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold h-9"
              >
                {savingAiCfg ? "Saving..." : "Save AI Gateway Policy"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
            {aiUsage.length === 0 ? (
              <div className="p-8 text-center text-[#F6F4EF]/60">
                No AI metering events logged in database yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Time</th>
                    <th className="p-3.5">Assistant</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232528]">
                  {aiUsage.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3.5 text-[#F6F4EF]/65 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-[#F6F4EF]">
                        {row.assistant_id}
                      </td>
                      <td className="p-3.5 text-[#D9BD81]">{row.provider}</td>
                      <td className="p-3.5 text-[#F6F4EF]/80">{row.status}</td>
                      <td className="p-3.5 text-[#F6F4EF]">
                        ৳{Number(row.estimated_cost_bdt).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: Canonical 13-Service Ratebook */}
      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#F6F4EF]/75 font-mono">
              Canonical 13-Service Ratebook &bull; Checkout unlocks ONLY when
              pricing_status = &apos;approved&apos; AND ratebook_approved = true.
            </p>
            <Input
              type="search"
              placeholder="Filter 13 services by ID or title..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full sm:w-72 bg-[#121315] border-[#232528] h-9 text-xs font-mono text-[#F6F4EF]"
            />
          </div>

          <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Hours</th>
                  <th className="p-3.5">Base BDT</th>
                  <th className="p-3.5">Base USD</th>
                  <th className="p-3.5">Approval Gate</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {filteredCatalog.map((s) => {
                  const isEditing = editingServiceId === s.id;
                  return (
                    <tr key={s.id}>
                      <td className="p-3.5 font-bold text-[#D9BD81]">{s.id}</td>
                      <td className="p-3.5 text-[#F6F4EF]">{s.title}</td>
                      <td className="p-3.5 text-[#D9BD81]">
                        {s.estimated_hours}h
                      </td>
                      <td className="p-3.5 text-[#F6F4EF]">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editServiceValues.bdt}
                            onChange={(e) =>
                              setEditServiceValues({
                                ...editServiceValues,
                                bdt: e.target.value,
                              })
                            }
                            className="h-8 w-24 bg-[#090A0A] border-[#232528] text-xs"
                          />
                        ) : (
                          `৳${s.base_bdt.toLocaleString()}`
                        )}
                      </td>
                      <td className="p-3.5 text-[#F6F4EF]">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editServiceValues.usd}
                            onChange={(e) =>
                              setEditServiceValues({
                                ...editServiceValues,
                                usd: e.target.value,
                              })
                            }
                            className="h-8 w-20 bg-[#090A0A] border-[#232528] text-xs"
                          />
                        ) : (
                          `$${s.base_usd.toLocaleString()}`
                        )}
                      </td>
                      <td className="p-3.5">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={editServiceValues.status}
                              onChange={(e) =>
                                setEditServiceValues({
                                  ...editServiceValues,
                                  status: e.target.value as PricingStatus,
                                })
                              }
                              className="rounded border border-[#232528] bg-[#090A0A] px-2 py-1 text-[11px] text-[#F6F4EF]"
                            >
                              <option value="quote_required">
                                quote_required
                              </option>
                              <option value="approved">approved</option>
                            </select>
                            <label className="flex items-center gap-1.5 text-[10px] text-[#F6F4EF]/80">
                              <input
                                type="checkbox"
                                checked={editServiceValues.ratebookApproved}
                                onChange={(e) =>
                                  setEditServiceValues({
                                    ...editServiceValues,
                                    ratebookApproved: e.target.checked,
                                  })
                                }
                              />
                              ratebook_approved
                            </label>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
                              s.pricing_status === "approved" &&
                              s.ratebook_approved
                                ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {s.pricing_status === "approved" &&
                            s.ratebook_approved
                              ? "APPROVED"
                              : "QUOTE_REQUIRED"}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveEditService(s.id)}
                              className="h-7 px-2.5 text-[10px] bg-emerald-600 text-white"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingServiceId(null)}
                              className="h-7 px-2 text-[10px]"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEditService(s)}
                            className="h-7 px-2.5 text-[10px] border-[#232528] text-[#F6F4EF]"
                          >
                            Edit Rate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Audit Log */}
      {tab === "audit" && (
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-x-auto">
          {auditLogs.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-[#F6F4EF]/60">
              No live database audit events logged yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-4 text-[#F6F4EF]/60 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-[#D9BD81]/10 text-[#D9BD81] border border-[#D9BD81]/30 text-[10px]">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="p-4 text-[#F6F4EF]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: DEMO DATA Studio Pulse Sandbox */}
      {tab === "studio_pulse_demo" && (
        <div className="rounded-2xl border border-[#D9BD81]/40 overflow-hidden">
          <CreativeOfficeOS initialRoute="studio" />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProjectStatusAction,
  updateServicePricingAction,
  issueQuoteAction,
} from "./actions";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";
import type {
  AdminProjectRow,
  AdminQuoteRow,
  AdminOrderRow,
  AdminAuditLogRow,
} from "./page";
import type { Service, ProjectStatus } from "@/types/domain";

interface AdminConsoleClientProps {
  initialProjects: AdminProjectRow[];
  initialQuotes: AdminQuoteRow[];
  initialOrders: AdminOrderRow[];
  initialAuditLogs: AdminAuditLogRow[];
  services: Service[];
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "onboarding",
  "brief_submitted",
  "in_production",
  "internal_qa",
  "client_review",
  "revision_requested",
  "client_approved",
  "delivered",
  "archived",
];

export function AdminConsoleClient({
  initialProjects,
  initialQuotes,
  initialOrders,
  initialAuditLogs,
  services,
}: AdminConsoleClientProps) {
  const [tab, setTab] = useState<
    "studio_pulse_demo" | "projects" | "quotes" | "orders" | "catalog" | "audit"
  >(initialProjects.length > 0 ? "projects" : "studio_pulse_demo");
  const [projects, setProjects] = useState(initialProjects);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [orders] = useState(initialOrders);
  const [auditLogs] = useState(initialAuditLogs);
  const [catalogList, setCatalogList] = useState(services);
  const [catalogSearch, setCatalogSearch] = useState("");

  const [quoteAmounts, setQuoteAmounts] = useState<
    Record<string, { bdt: string; usd: string; notes: string }>
  >({});

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceValues, setEditServiceValues] = useState<{
    bdt: string;
    usd: string;
    status: "approved" | "quote_required";
  }>({ bdt: "", usd: "", status: "approved" });

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
    const res = await updateProjectStatusAction(projectId, newStatus);
    if (res.ok) {
      toast.success(`Project status updated to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleIssueQuote = async (quoteId: string) => {
    const entry = quoteAmounts[quoteId];
    const bdt = Number(entry?.bdt || 15000);
    const usd = Number(entry?.usd || 150);
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
      toast.success(`Formal quote ${quoteId.slice(0, 8)} issued`);
    } else {
      toast.error(res.error || "Failed to issue quotation");
    }
  };

  const startEditService = (srv: Service) => {
    setEditingServiceId(srv.id);
    setEditServiceValues({
      bdt: String(srv.base_bdt),
      usd: String(srv.base_usd),
      status: srv.pricing_status as "approved" | "quote_required",
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

  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalRevenueBDT = paidOrders.reduce(
    (sum, o) => sum + Number(o.total_bdt || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232528] pb-6">
        <div>
          <span className="badge-mono text-[#D9BD81]">
            Studio Pulse Operations Console &bull; Zero Fabricated State
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF] mt-1">
            Studio Pulse &amp; Production Administration
          </h1>
          <p className="text-xs text-[#F6F4EF]/65 mt-1">
            Live database queues show strictly verified records. Use the labeled{" "}
            <strong className="text-[#D9BD81]">
              DEMO DATA &bull; Studio Pulse Sandbox
            </strong>{" "}
            tab to test the connected Human + SI workflow with Client Office.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Live DB Projects
            </span>
            <span className="text-lg font-bold text-[#F6F4EF]">
              {projects.length}
            </span>
          </div>
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Live DB Quotes
            </span>
            <span className="text-lg font-bold text-[#D9BD81]">
              {quotes.filter((q) => q.status === "requested").length}
            </span>
          </div>
          <div className="rounded-lg border border-[#232528] bg-[#121315] px-4 py-2.5">
            <span className="text-[#F6F4EF]/55 block text-[10px] uppercase">
              Verified Settled BDT
            </span>
            <span className="text-lg font-bold text-emerald-400">
              ৳{totalRevenueBDT.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#232528] pb-3">
        <button
          type="button"
          onClick={() => setTab("studio_pulse_demo")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors border ${
            tab === "studio_pulse_demo"
              ? "bg-[#D9BD81] text-[#090A0A] border-[#D9BD81] font-bold"
              : "bg-[#121315] text-[#D9BD81] border-[#D9BD81]/40 hover:bg-[#D9BD81]/10"
          }`}
        >
          DEMO DATA &bull; Studio Pulse Command Center (Connected to Client
          Office)
        </button>
        <button
          type="button"
          onClick={() => setTab("projects")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            tab === "projects"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Live DB Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("quotes")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            tab === "quotes"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Live DB Quotes ({quotes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            tab === "orders"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Live DB Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("catalog")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            tab === "catalog"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Canonical 13-Service Ratebook ({catalogList.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("audit")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            tab === "audit"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB: DEMO DATA Studio Pulse Command Center */}
      {tab === "studio_pulse_demo" && (
        <div className="rounded-2xl border border-[#D9BD81]/40 overflow-hidden">
          <CreativeOfficeOS initialRoute="studio" />
        </div>
      )}

      {/* TAB: Live DB Projects */}
      {tab === "projects" && (
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
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
                Switch to DEMO DATA &bull; Studio Pulse Command Center
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Project ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Revisions</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Transition Stage</th>
                  <th className="p-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      {p.id.slice(0, 12)}
                    </td>
                    <td className="p-4 text-[#F6F4EF]">{p.title}</td>
                    <td className="p-4 text-[#F6F4EF]/70">
                      {p.revisions_used} / {p.max_revisions}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded uppercase text-[10px] bg-[#D9BD81]/10 text-[#D9BD81] border border-[#D9BD81]/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          handleStatusChange(p.id, e.target.value)
                        }
                        className="rounded border border-[#232528] bg-[#090A0A] px-2.5 py-1 text-xs text-[#F6F4EF]"
                      >
                        {PROJECT_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="text-[#D9BD81] hover:underline"
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
                  <div className="flex items-center justify-between border-b border-[#232528] pb-3">
                    <div>
                      <span className="font-bold text-[#F6F4EF] text-sm">
                        Quote #{q.id.slice(0, 12)}
                      </span>
                      <span className="ml-3 text-[#F6F4EF]/60">
                        Client: {q.client_id}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded uppercase text-[10px] border border-[#D9BD81]/40 text-[#D9BD81]">
                      {q.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
                    <Button
                      type="button"
                      onClick={() => handleIssueQuote(q.id)}
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
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-[#F6F4EF]/65">
              0 live payment orders in database. (Truthful empty state — fake
              paid fallback orders removed per Gate 0 audit).
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Amount (BDT / USD)</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      {ord.id.slice(0, 12)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded uppercase text-[10px] border border-[#D9BD81]/30 text-[#D9BD81]">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[#F6F4EF]/70">
                      {ord.payment_gateway || "N/A"}
                    </td>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      ৳{Number(ord.total_bdt).toLocaleString()} / $
                      {Number(ord.total_usd).toLocaleString()}
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

      {/* TAB: Canonical 13-Service Ratebook */}
      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#F6F4EF]/70 font-mono">
              Canonical 13-Service Hourly Ratebook (4 Disciplines &bull; 2
              Consolidated Revisions)
            </p>
            <Input
              type="search"
              placeholder="Filter 13 services by ID or title..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full sm:w-72 bg-[#121315] border-[#232528] h-9 text-xs font-mono text-[#F6F4EF]"
            />
          </div>

          <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Discipline</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Base Hours</th>
                  <th className="p-3.5">Base BDT</th>
                  <th className="p-3.5">Base USD</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {filteredCatalog.map((s) => {
                  const isEditing = editingServiceId === s.id;
                  return (
                    <tr key={s.id}>
                      <td className="p-3.5 font-bold text-[#D9BD81]">{s.id}</td>
                      <td className="p-3.5 text-[#F6F4EF]/70">
                        {s.category_id}
                      </td>
                      <td className="p-3.5 text-[#F6F4EF]">{s.title}</td>
                      <td className="p-3.5 text-[#D9BD81]">
                        {s.estimated_hours || 4}h
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
                            className="h-7 w-24 bg-[#090A0A] border-[#232528] text-xs"
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
                            className="h-7 w-20 bg-[#090A0A] border-[#232528] text-xs"
                          />
                        ) : (
                          `$${s.base_usd.toLocaleString()}`
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
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
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
    </div>
  );
}

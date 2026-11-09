"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import type { Service, ServiceCategory, PricingStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProjectStatusAction,
  updateServicePricingAction,
  issueQuoteAction,
} from "./actions";

export interface AdminProject {
  id: string;
  title: string;
  client_name?: string;
  client_email?: string;
  status: string;
  current_round?: number;
  max_rounds?: number;
  revisions_used?: number;
  max_revisions?: number;
  package_name?: string;
  total_amount?: number;
  currency?: string;
  due_date?: string;
  brief?: {
    brand_name?: string;
    deliverable_format?: string;
    color_palette?: string;
    notes?: string;
  };
  tasks?: { id: string; title: string; status: string }[];
  assets?: {
    id: string;
    title: string;
    version: string;
    file_url: string;
    asset_type: string;
    annotations_count?: number;
  }[];
  created_at: string;
}

export interface AdminQuote {
  id: string;
  quote_ref?: string;
  customer_name?: string;
  customer_email?: string;
  service_names?: string[];
  scope_summary?: string;
  total_amount?: number;
  currency?: string;
  rush_delivery?: boolean;
  status: string;
  notes?: string | null;
  amount_bdt?: number;
  amount_usd?: number;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  order_number?: string;
  order_ref?: string;
  customer_name?: string;
  total_amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status: string;
  project_status?: string;
  amount_bdt?: number;
  amount_usd?: number;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  action?: string;
  event_type?: string;
  resource_type?: string;
  resource_id?: string;
  actor_email?: string;
  actor_id?: string | null;
  details?: string | Record<string, unknown> | null;
  created_at: string;
}

interface AdminConsoleClientProps {
  initialServices: Service[];
  categories: ServiceCategory[];
  initialProjects: AdminProject[];
  initialQuotes: AdminQuote[];
  initialOrders: AdminOrder[];
  initialAuditLogs: AdminAuditLog[];
}

const KANBAN_COLUMNS = [
  { id: "awaiting_brief", label: "Awaiting Brief" },
  { id: "brief_submitted", label: "Brief Submitted" },
  { id: "in_production", label: "In Production" },
  { id: "client_review", label: "Client Review" },
  { id: "revision_requested", label: "Revision Queued" },
  { id: "client_approved", label: "Client Approved" },
  { id: "completed", label: "Delivered / Done" },
];

export function AdminConsoleClient({
  initialServices,
  categories,
  initialProjects,
  initialQuotes,
  initialOrders,
  initialAuditLogs,
}: AdminConsoleClientProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "catalog" | "quotes" | "orders" | "audit">("kanban");
  const [isPending, startTransition] = useTransition();

  // Local state for live mutations
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [quotes, setQuotes] = useState<AdminQuote[]>(initialQuotes);

  // Catalog manager filters
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("ALL");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceBdt, setEditPriceBdt] = useState<number>(0);
  const [editPriceUsd, setEditPriceUsd] = useState<number>(0);

  // Quote desk state
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [quoteBdt, setQuoteBdt] = useState<number>(0);
  const [quoteUsd, setQuoteUsd] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>("");

  // Filtered services for catalog management
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = catalogCategory === "ALL" || s.category_id === catalogCategory;
      const q = catalogSearch.toLowerCase().trim();
      const matchQ =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.title_bn && s.title_bn.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [services, catalogCategory, catalogSearch]);

  // Handle Project Status Transition in Kanban
  const handleMoveProject = (projectId: string, nextStatus: string) => {
    startTransition(async () => {
      const res = await updateProjectStatusAction(projectId, nextStatus);
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: nextStatus } : p))
        );
        toast.success(`Project moved to ${nextStatus.replace(/_/g, " ")}`);
      } else {
        toast.error(res.error || "Failed to update project status");
      }
    });
  };

  // Handle Service Price / Status update
  const handleSaveServicePricing = (serviceId: string) => {
    startTransition(async () => {
      const res = await updateServicePricingAction(serviceId, {
        base_bdt: editPriceBdt,
        base_usd: editPriceUsd,
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId
              ? { ...s, base_bdt: editPriceBdt, base_usd: editPriceUsd }
              : s
          )
        );
        setEditingServiceId(null);
        toast.success(`Updated pricing for ${serviceId}`);
      } else {
        toast.error(res.error || "Failed to update pricing");
      }
    });
  };

  // Toggle Service Pricing Status (approved <-> quote_required)
  const handleTogglePricingStatus = (service: Service) => {
    const nextStatus: PricingStatus =
      service.pricing_status === "approved" ? "quote_required" : "approved";

    startTransition(async () => {
      const res = await updateServicePricingAction(service.id, {
        pricing_status: nextStatus,
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, pricing_status: nextStatus } : s
          )
        );
        toast.success(`Service ${service.id} marked as ${nextStatus}`);
      } else {
        toast.error(res.error || "Failed to toggle status");
      }
    });
  };

  // Issue formal quote
  const handleIssueQuote = (quoteId: string) => {
    startTransition(async () => {
      const res = await issueQuoteAction(quoteId, quoteBdt, quoteUsd, quoteNotes);
      if (res.ok) {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === quoteId
              ? {
                  ...q,
                  status: "issued",
                  amount_bdt: quoteBdt,
                  amount_usd: quoteUsd,
                  admin_notes: quoteNotes,
                }
              : q
          )
        );
        setSelectedQuoteId(null);
        toast.success("Formal approved quotation issued to client portal!");
      } else {
        toast.error(res.error || "Failed to issue quote");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Executive KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <span className="text-[10px] text-brand-muted uppercase">Production Projects</span>
          <span className="text-2xl font-black text-brand-light block">{projects.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <span className="text-[10px] text-brand-muted uppercase">Pending Quotes</span>
          <span className="text-2xl font-black text-amber-400 block">{quotes.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <span className="text-[10px] text-brand-muted uppercase">Verified Orders</span>
          <span className="text-2xl font-black text-emerald-400 block">{initialOrders.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <span className="text-[10px] text-brand-muted uppercase">Canonical Services</span>
          <span className="text-2xl font-black text-brand-highlight block">{services.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-brand-border pb-3 overflow-x-auto cyber-scrollbar">
        {[
          { id: "kanban", label: "Operations Kanban" },
          { id: "catalog", label: "Canonical Catalog (60)" },
          { id: "quotes", label: "Quote Desk" },
          { id: "orders", label: "Orders & Transactions" },
          { id: "audit", label: "Audit Log Trail" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "kanban" | "catalog" | "quotes" | "orders" | "audit")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-brand-light text-brand-black shadow-md"
                : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MODULE 1: OPERATIONS KANBAN BOARD */}
      {activeTab === "kanban" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-light font-mono uppercase">
              Production Lifecycle Kanban ({projects.length} Projects)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4 cyber-scrollbar">
            {KANBAN_COLUMNS.map((col) => {
              const colProjects = projects.filter((p) => p.status === col.id);
              return (
                <div
                  key={col.id}
                  className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col min-w-[220px] max-h-[600px] overflow-y-auto cyber-scrollbar space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-xs font-mono font-bold text-brand-light">
                      {col.label}
                    </span>
                    <span className="badge-mono text-[10px] text-brand-muted px-1.5 py-0.5 rounded bg-brand-black">
                      {colProjects.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colProjects.length === 0 ? (
                      <span className="text-[11px] font-mono text-brand-muted/60 block text-center py-4">
                        Empty column
                      </span>
                    ) : (
                      colProjects.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-xl bg-brand-card border border-brand-border space-y-2 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-brand-highlight">
                              {p.id.slice(0, 8)}...
                            </span>
                            <span className="text-[10px] text-brand-muted">
                              Rev: {p.revisions_used}/{p.max_revisions}
                            </span>
                          </div>
                          <h4 className="font-sans font-semibold text-brand-light text-xs line-clamp-2">
                            {p.title}
                          </h4>

                          {/* Quick Stage Controls */}
                          <div className="flex gap-1 pt-1 border-t border-brand-border/40">
                            {col.id !== "completed" && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  const curIdx = KANBAN_COLUMNS.findIndex((c) => c.id === col.id);
                                  if (curIdx < KANBAN_COLUMNS.length - 1) {
                                    handleMoveProject(p.id, KANBAN_COLUMNS[curIdx + 1].id);
                                  }
                                }}
                                className="w-full py-1 text-[10px] font-mono bg-brand-surface hover:bg-brand-highlight hover:text-white rounded text-brand-muted border border-brand-border transition-colors"
                              >
                                Advance &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 2: CATALOG MANAGER */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-brand-light font-mono uppercase">
              Canonical 60-Service Commercial Catalog
            </h2>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Filter services by code, title..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="bg-brand-surface border-brand-border text-brand-light text-xs font-mono h-9 w-64"
              />
              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="bg-brand-surface border border-brand-border text-brand-light rounded-lg px-3 py-1.5 text-xs font-mono"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cat {c.id}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-brand-border rounded-2xl overflow-hidden glass-panel">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Service Title</th>
                  <th className="p-3">Base BDT</th>
                  <th className="p-3">Base USD</th>
                  <th className="p-3">Turnaround</th>
                  <th className="p-3">Revisions</th>
                  <th className="p-3">Pricing Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredServices.map((s) => {
                  const isEditing = editingServiceId === s.id;
                  const isQuoteReq = s.pricing_status === "quote_required";
                  return (
                    <tr key={s.id} className="hover:bg-brand-surface/40">
                      <td className="p-3 font-bold text-brand-highlight">{s.id}</td>
                      <td className="p-3 font-sans font-medium text-brand-light max-w-xs truncate">
                        {s.title}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPriceBdt}
                            onChange={(e) => setEditPriceBdt(Number(e.target.value))}
                            className="w-24 bg-brand-surface border border-brand-border rounded px-2 py-1 text-xs font-mono text-brand-light"
                          />
                        ) : (
                          <span className="font-bold text-brand-light">
                            ৳ {Number(s.base_bdt).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPriceUsd}
                            onChange={(e) => setEditPriceUsd(Number(e.target.value))}
                            className="w-20 bg-brand-surface border border-brand-border rounded px-2 py-1 text-xs font-mono text-brand-light"
                          />
                        ) : (
                          <span className="text-brand-muted">${Number(s.base_usd)}</span>
                        )}
                      </td>
                      <td className="p-3 text-brand-light">{s.days}d</td>
                      <td className="p-3 text-brand-light">{s.revisions}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePricingStatus(s)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            isQuoteReq
                              ? "border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                              : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                          }`}
                        >
                          {s.pricing_status}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleSaveServicePricing(s.id)}
                              className="text-[10px] h-6 px-2 bg-brand-highlight text-white"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingServiceId(null)}
                              className="text-[10px] h-6 px-2 text-brand-muted"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingServiceId(s.id);
                              setEditPriceBdt(Number(s.base_bdt));
                              setEditPriceUsd(Number(s.base_usd));
                            }}
                            className="text-[10px] h-6 px-2 border-brand-border"
                          >
                            Edit
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

      {/* MODULE 3: QUOTE DESK */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-light font-mono uppercase">
              Quotation Desk ({quotes.length} Requests)
            </h2>
          </div>

          {quotes.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-brand-border font-mono text-xs text-brand-muted">
              No formal quotation requests pending review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="glass-card p-5 rounded-2xl border border-brand-border space-y-4 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="badge-mono text-brand-highlight font-bold text-sm">
                      {q.quote_ref}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase border-amber-500/40 text-amber-400">
                      {q.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-muted uppercase">Client / Request Scope:</span>
                    <p className="text-brand-light font-sans text-xs">
                      {q.notes || "Standard 7-Step Package Builder configuration"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border/60">
                    <div>
                      <span className="text-[10px] text-brand-muted uppercase block">Amount (BDT):</span>
                      <span className="font-bold text-brand-light text-sm">
                        ৳ {Number(q.amount_bdt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-muted uppercase block">Amount (USD):</span>
                      <span className="font-bold text-brand-light text-sm">
                        ${Number(q.amount_usd)}
                      </span>
                    </div>
                  </div>

                  {q.status !== "issued" && (
                    <div className="pt-2">
                      {selectedQuoteId === q.id ? (
                        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border space-y-3">
                          <span className="font-bold text-brand-light text-[11px] uppercase block">
                            Configure Approved Commercial Quotation
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-brand-muted">Approved BDT:</label>
                              <Input
                                type="number"
                                value={quoteBdt}
                                onChange={(e) => setQuoteBdt(Number(e.target.value))}
                                className="bg-brand-black border-brand-border text-brand-light h-8 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-brand-muted">Approved USD:</label>
                              <Input
                                type="number"
                                value={quoteUsd}
                                onChange={(e) => setQuoteUsd(Number(e.target.value))}
                                className="bg-brand-black border-brand-border text-brand-light h-8 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <Input
                            placeholder="Optional operational or licensing notes..."
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="bg-brand-black border-brand-border text-brand-light h-8 text-xs font-mono"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleIssueQuote(q.id)}
                              disabled={isPending}
                              className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs w-full"
                            >
                              Issue Approved Quote
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedQuoteId(null)}
                              className="font-mono text-xs border-brand-border"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedQuoteId(q.id);
                            setQuoteBdt(Number(q.amount_bdt));
                            setQuoteUsd(Number(q.amount_usd));
                          }}
                          className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs"
                        >
                          Review & Issue Quote
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: ORDERS & TRANSACTIONS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-light font-mono uppercase">
              Settled Orders & Transactions ({initialOrders.length})
            </h2>
          </div>

          <div className="border border-brand-border rounded-2xl overflow-hidden glass-panel">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Payment Status</th>
                  <th className="p-3.5">Project Status</th>
                  <th className="p-3.5">Amount BDT</th>
                  <th className="p-3.5">Amount USD</th>
                  <th className="p-3.5">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {initialOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-brand-muted font-mono">
                      No order records found in database.
                    </td>
                  </tr>
                ) : (
                  initialOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-brand-surface/40">
                      <td className="p-3.5 font-bold text-brand-highlight">{ord.order_ref}</td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px] uppercase border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                          {ord.payment_status}
                        </Badge>
                      </td>
                      <td className="p-3.5 uppercase text-brand-light">{ord.project_status}</td>
                      <td className="p-3.5 text-brand-light font-bold">
                        ৳ {Number(ord.amount_bdt).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-brand-muted">${Number(ord.amount_usd)}</td>
                      <td className="p-3.5 text-brand-muted">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 5: AUDIT LOG INSPECTOR */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-light font-mono uppercase">
              System Audit Event Trail ({initialAuditLogs.length} Events)
            </h2>
          </div>

          <div className="border border-brand-border rounded-2xl overflow-hidden glass-panel">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Event Details</th>
                  <th className="p-3.5">Actor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {initialAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-brand-muted font-mono">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  initialAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-surface/40">
                      <td className="p-3.5 text-brand-muted text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-brand-highlight">
                        {log.event_type}
                      </td>
                      <td className="p-3.5 text-brand-light font-sans text-xs">
                        {typeof log.details === "object"
                          ? JSON.stringify(log.details)
                          : String(log.details || "")}
                      </td>
                      <td className="p-3.5 text-brand-muted text-[10px]">
                        {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : "SYSTEM"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Profile } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ClientProject {
  id: string;
  title: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  created_at: string;
}

export interface ClientQuote {
  id: string;
  quote_ref: string;
  status: string;
  currency: string;
  amount_bdt: number;
  amount_usd: number;
  expires_at: string;
  created_at: string;
}

export interface ClientOrder {
  id: string;
  order_ref: string;
  payment_status: string;
  currency: string;
  amount_bdt: number;
  amount_usd: number;
  created_at: string;
  scope_snapshot?: unknown;
}

interface DashboardClientProps {
  profile: Profile | null;
  projects: ClientProject[];
  quotes: ClientQuote[];
  orders: ClientOrder[];
}

export function DashboardClient({
  profile,
  projects,
  quotes,
  orders,
}: DashboardClientProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<ClientOrder | null>(null);

  return (
    <div className="space-y-10">
      {/* Top Banner & Quick Metrics */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="badge-mono text-brand-highlight">
              Client Operating Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-light tracking-tight">
              Welcome back, {profile?.full_name || profile?.email}
            </h1>
            <p className="text-xs font-mono text-brand-muted">
              Role: <strong className="text-brand-light uppercase">{profile?.role}</strong> • Organization: Freakin&apos;s Studio Client
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/builder">Launch Package Builder</Link>}
              className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-5"
            />
            {profile?.role && (profile.role === "studio_admin" || profile.role === "super_admin") && (
              <Button
                render={<Link href="/admin">Studio Admin OS</Link>}
                variant="outline"
                className="font-mono text-xs border-brand-border text-brand-light"
              />
            )}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-brand-border/60 font-mono">
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
            <span className="text-[11px] text-brand-muted uppercase">Active Production Projects</span>
            <span className="text-2xl font-bold text-brand-light block">{projects.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
            <span className="text-[11px] text-brand-muted uppercase">Pending Quotations</span>
            <span className="text-2xl font-bold text-amber-400 block">{quotes.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
            <span className="text-[11px] text-brand-muted uppercase">Settled Orders & Invoices</span>
            <span className="text-2xl font-bold text-emerald-400 block">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE PRODUCTION PROJECTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-light font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-highlight" />
            Active Creative Production Projects ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-brand-border space-y-3">
            <p className="text-brand-muted font-mono text-xs">
              No active production projects found. Build and launch a creative package to start.
            </p>
            <Button
              render={<Link href="/builder">Configure Package in Builder</Link>}
              variant="outline"
              size="sm"
              className="font-mono text-xs border-brand-border"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-card p-5 rounded-2xl border border-brand-border hover:border-brand-highlight/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge-mono text-brand-highlight text-xs font-bold">
                      {proj.id}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase border-brand-border text-brand-light bg-brand-surface"
                    >
                      {proj.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-brand-light">
                    {proj.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-brand-muted pt-1">
                    <span>Revisions: {proj.revisions_used} / {proj.max_revisions}</span>
                    <span>•</span>
                    <span>Licensing: Full Buyout</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <Button
                    render={<Link href={`/dashboard/projects/${proj.id}`}>Enter Workspace</Link>}
                    size="sm"
                    className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: FORMAL QUOTATIONS DESK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-light font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Commercial Quotations Desk ({quotes.length})
          </h2>
        </div>

        {quotes.length === 0 ? (
          <div className="glass-panel p-6 text-center rounded-2xl border border-brand-border">
            <p className="text-brand-muted font-mono text-xs">
              No pending formal quotations. Packages requiring custom enterprise scoping will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-brand-border rounded-2xl overflow-hidden glass-panel">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Quote Reference</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Amount (BDT)</th>
                  <th className="p-3.5">Amount (USD)</th>
                  <th className="p-3.5">Expiry</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-brand-surface/40">
                    <td className="p-3.5 font-bold text-brand-highlight">{q.quote_ref}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] uppercase border-amber-500/40 text-amber-400 bg-amber-500/10">
                        {q.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-brand-light font-bold">
                      ৳ {Number(q.amount_bdt).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-brand-muted">${Number(q.amount_usd)}</td>
                    <td className="p-3.5 text-brand-muted">
                      {new Date(q.expires_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        render={<Link href="/builder">Review Scope</Link>}
                        size="sm"
                        variant="outline"
                        className="text-[11px] font-mono h-7 border-brand-border"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT ORDERS & INVOICES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-light font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Settled Orders & Branded Invoices ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="glass-panel p-6 text-center rounded-2xl border border-brand-border">
            <p className="text-brand-muted font-mono text-xs">
              No orders settled yet.
            </p>
          </div>
        ) : (
          <div className="border border-brand-border rounded-2xl overflow-hidden glass-panel">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Settlement Status</th>
                  <th className="p-3.5">Total Paid</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-surface/40">
                    <td className="p-3.5 font-bold text-brand-light">{ord.order_ref}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] uppercase border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                        {ord.payment_status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-emerald-400 font-bold">
                      {ord.currency === "BDT" ? `৳ ${Number(ord.amount_bdt).toLocaleString()}` : `$ ${ord.amount_usd}`}
                    </td>
                    <td className="p-3.5 text-brand-muted">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(ord)}
                        className="text-[11px] font-mono h-7 border-brand-border hover:bg-brand-surface text-brand-light"
                      >
                        View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Branded Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl p-8 rounded-3xl border border-brand-border shadow-2xl space-y-6 cyber-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-black flex items-center justify-center font-mono font-black text-xs">
                  FS
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-light font-mono">
                    Freakin&apos;s Studio Creative OS
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    [OFFICIAL SETTLED COMMERCIAL INVOICE]
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-brand-muted hover:text-brand-light text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-xs font-mono text-brand-light">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-brand-muted text-[10px] uppercase block">Billed To</span>
                  <span className="font-bold text-sm block mt-0.5">{profile?.full_name || "Authorized Corporate Account"}</span>
                  <span className="text-brand-muted block">{profile?.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-brand-muted text-[10px] uppercase block">Invoice Reference</span>
                  <span className="font-bold text-sm block">INV-{selectedInvoice.order_ref}</span>
                  <span className="text-brand-muted block">{new Date(selectedInvoice.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border border-brand-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Deliverable Item Scope</th>
                      <th className="p-3">Commercial Rights</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-medium text-brand-light">
                        {selectedInvoice.order_ref} — Creative Production Suite
                      </td>
                      <td className="p-3 text-brand-muted">Full Commercial Buyout</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Settled</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-brand-border pt-3 flex justify-between items-baseline text-sm">
                <span className="text-brand-muted text-xs">Total Settled in Full:</span>
                <span className="text-xl font-bold text-emerald-400">
                  {selectedInvoice.currency === "BDT"
                    ? `৳ ${Number(selectedInvoice.amount_bdt).toLocaleString()}`
                    : `$ ${Number(selectedInvoice.amount_usd).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="font-mono text-xs border-brand-border"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

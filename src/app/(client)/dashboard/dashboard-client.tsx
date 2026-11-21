"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptQuoteAndCheckoutAction } from "../actions";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";
import type {
  ClientProjectSummary,
  ClientOrderSummary,
  ClientQuoteSummary,
} from "./page";
import type { PaymentGateway } from "@/types/domain";

interface DashboardClientProps {
  userEmail: string;
  projects: ClientProjectSummary[];
  orders: ClientOrderSummary[];
  quotes: ClientQuoteSummary[];
}

export function DashboardClient({
  userEmail,
  projects,
  orders,
  quotes,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "projects" | "orders" | "quotes" | "demo_office"
  >(projects.length > 0 ? "projects" : "demo_office");
  const [processingQuoteId, setProcessingQuoteId] = useState<string | null>(
    null
  );
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGateway>("sslcommerz");

  const handleAcceptQuote = async (quoteId: string) => {
    setProcessingQuoteId(quoteId);
    try {
      const res = await acceptQuoteAndCheckoutAction(quoteId, selectedGateway);
      if (!res.ok) {
        toast.error(res.error || "Unable to accept quotation");
        return;
      }
      toast.success("Quotation accepted! Redirecting to payment checkout...");
      if (res.redirectUrl) {
        router.push(res.redirectUrl);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to initiate quote payment");
    } finally {
      setProcessingQuoteId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#232528] bg-[#121315] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="badge-mono text-[#D9BD81]">
            Client Creative Office &bull; Creative Office OS 2.0
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F6F4EF]">
            Welcome, {userEmail}
          </h1>
          <p className="text-xs text-[#F6F4EF]/65">
            Track live creative production milestones, coordinate pin proofs, 2
            consolidated revision rounds, and commercial buyout handovers.
          </p>
        </div>

        <Button
          render={<Link href="/builder">+ New Smart Brief</Link>}
          className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono shrink-0"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#232528] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "projects"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Live Account Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "orders"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Orders &amp; Invoices ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quotes")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "quotes"
              ? "bg-[#D9BD81] text-[#090A0A] font-bold"
              : "bg-[#121315] text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
          }`}
        >
          Formal Quotations ({quotes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("demo_office")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors border ${
            activeTab === "demo_office"
              ? "bg-[#D9BD81] text-[#090A0A] border-[#D9BD81] font-bold"
              : "bg-[#121315] text-[#D9BD81] border-[#D9BD81]/40 hover:bg-[#D9BD81]/10"
          }`}
        >
          DEMO DATA &bull; Interactive Client Office &amp; Proofing Sandbox
        </button>
      </div>

      {/* Tab Content: Projects */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-[#232528] bg-[#121315] p-12 text-center space-y-4">
              <p className="text-sm text-[#F6F4EF]/75 font-mono">
                No live database projects found for this account yet.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  render={<Link href="/builder">Configure First Smart Brief</Link>}
                  size="sm"
                  className="bg-[#D9BD81] text-[#090A0A] font-mono text-xs font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("demo_office")}
                  className="border-[#D9BD81]/40 text-[#D9BD81] font-mono text-xs"
                >
                  Open Interactive Client Office Demo (DEMO DATA)
                </Button>
              </div>
            </div>
          ) : (
            projects.map((prj) => (
              <div
                key={prj.id}
                className="rounded-xl border border-[#232528] bg-[#121315] p-6 flex flex-col justify-between space-y-5 hover:border-[#D9BD81]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[#F6F4EF]/65">
                      #{prj.id.slice(0, 12)}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#D9BD81]/10 text-[#D9BD81] border border-[#D9BD81]/30">
                      {prj.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F6F4EF]">
                    {prj.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-[#F6F4EF]/65">
                    <div>
                      <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                        Revision Quota
                      </span>
                      <span className="text-[#F6F4EF]">
                        {prj.revisions_used} / {prj.max_revisions} Rounds Used
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                        Initialized
                      </span>
                      <span className="text-[#F6F4EF]">
                        {new Date(prj.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#232528] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#F6F4EF]/60">
                    Brief, Tasks &amp; Visual Proofing
                  </span>
                  <Button
                    render={
                      <Link href={`/dashboard/projects/${prj.id}`}>
                        Open Workspace &rarr;
                      </Link>
                    }
                    size="sm"
                    className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs h-8"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Orders */}
      {activeTab === "orders" && (
        <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-[#F6F4EF]/60">
              No verified payment transactions recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528]">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="p-4 font-bold text-[#F6F4EF]">
                      {ord.id.slice(0, 12)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                          ord.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[#F6F4EF]/70">
                      {ord.payment_gateway || "N/A"}
                    </td>
                    <td className="p-4 font-bold text-[#D9BD81]">
                      {ord.currency === "BDT"
                        ? `৳${ord.total_bdt.toLocaleString()}`
                        : `$${ord.total_usd.toLocaleString()}`}
                    </td>
                    <td className="p-4 text-[#F6F4EF]/65">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Quotes */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="rounded-xl border border-[#232528] bg-[#121315] p-10 text-center text-xs font-mono text-[#F6F4EF]/60">
              No formal quotations requested yet.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#232528] bg-[#121315] p-4 text-xs font-mono">
                <span className="text-[#F6F4EF]/70">
                  Preferred Payment Gateway for Issued Quotes:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("sslcommerz")}
                    className={`px-3 py-1.5 rounded border transition-colors ${
                      selectedGateway === "sslcommerz"
                        ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF] font-bold"
                        : "border-[#232528] text-[#F6F4EF]/65"
                    }`}
                  >
                    SSLCommerz (BDT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("stripe")}
                    className={`px-3 py-1.5 rounded border transition-colors ${
                      selectedGateway === "stripe"
                        ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF] font-bold"
                        : "border-[#232528] text-[#F6F4EF]/65"
                    }`}
                  >
                    Stripe (USD)
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#232528] bg-[#121315] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-[#232528] bg-[#090A0A] text-[#F6F4EF]/65 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Quote ID</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Approved Investment</th>
                      <th className="p-4">Notes</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232528]">
                    {quotes.map((q) => (
                      <tr key={q.id}>
                        <td className="p-4 font-bold text-[#F6F4EF]">
                          {q.id.slice(0, 12)}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded uppercase text-[10px] border border-[#D9BD81]/30 bg-[#D9BD81]/10 text-[#D9BD81]">
                            {q.status}
                          </span>
                        </td>
                        <td className="p-4 text-[#F6F4EF]">
                          {q.amount_bdt
                            ? `৳${q.amount_bdt.toLocaleString()} / $${(
                                q.amount_usd || 0
                              ).toLocaleString()}`
                            : "Under Studio Review"}
                        </td>
                        <td className="p-4 text-[#F6F4EF]/70 max-w-xs truncate">
                          {q.admin_notes || "Awaiting studio scoping."}
                        </td>
                        <td className="p-4 text-right">
                          {q.status === "issued" && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={processingQuoteId === q.id}
                              onClick={() => handleAcceptQuote(q.id)}
                              className="bg-[#D9BD81] text-[#090A0A] text-xs font-mono h-8 font-semibold"
                            >
                              {processingQuoteId === q.id
                                ? "Processing..."
                                : "Accept & Pay →"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Content: Interactive Demo Client Office */}
      {activeTab === "demo_office" && (
        <div className="rounded-2xl border border-[#D9BD81]/40 overflow-hidden">
          <CreativeOfficeOS initialRoute="office" />
        </div>
      )}
    </div>
  );
}

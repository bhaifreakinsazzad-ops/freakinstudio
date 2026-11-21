"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { CANONICAL_ADDONS, CANONICAL_SERVICES } from "../data/catalog-bridge";
import { useCreativeOffice } from "../context";
import type { BriefPrefill } from "../types";

export function SmartBriefBuilder({
  prefill,
  onSubmitted,
}: {
  prefill: BriefPrefill | null;
  onSubmitted: (newProjectId: string) => void;
}) {
  const { createProjectFromBrief } = useCreativeOffice();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(prefill?.serviceId || "SRV-05");
  const [variantLabel] = useState(
    prefill?.variantLabel || "Standard Scoped Deliverable"
  );
  const [scopedHours, setScopedHours] = useState(prefill?.scopedHours || 4);
  const [addons, setAddons] = useState<string[]>(prefill?.addons || []);
  const [projectTitle, setProjectTitle] = useState(
    prefill?.topic || "Artisan Coffee Eid Launch Campaign"
  );
  const [clientName, setClientName] = useState("Nabila Chowdhury");
  const [notes, setNotes] = useState(
    "Needs Bilingual EN+BN headline adaptation in Champagne Gold (#D9BD81) & Obsidian (#090A0A)."
  );
  const [expressRequested, setExpressRequested] = useState(false);
  const [sourceFilesReady, setSourceFilesReady] = useState(false);

  const activeService =
    CANONICAL_SERVICES.find((s) => s.id === serviceId) || CANONICAL_SERVICES[0];
  const expressEligible = Boolean(
    activeService.express_eligible && sourceFilesReady
  );

  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmitSandbox = () => {
    const newId = createProjectFromBrief({
      title: projectTitle.trim() || `${activeService.title} Request`,
      clientName: clientName.trim() || "Guest Demo Client",
      serviceId: activeService.id,
      serviceName: activeService.title,
      variantLabel,
      scopedHours,
      addons,
      expressRequested,
      expressEligible,
      notes,
    });
    onSubmitted(newId);
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            PROGRESSIVE 3-STEP SMART PROJECT BRIEF
          </span>
          <Link
            href={`/builder?service=${serviceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9BD81] hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Full Authenticated DB Builder (/builder)</span>
          </Link>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-3">
          Launch Your Creative Brief in Under 60 Seconds
        </h2>
        <p className="text-sm text-[#F6F4EF]/80 mt-1 max-w-3xl">
          Test the interactive Creative Office OS 2.0 workflow below in sandbox
          mode, or switch to <code className="text-[#D9BD81]">/builder</code>{" "}
          to persist a formal Studio Quote to your Supabase Client Office.
        </p>

        {/* Stepper */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "1. Service & Scope" },
            { num: 2, label: "2. Brief & Add-ons" },
            { num: 3, label: "3. Preflight & Submit" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold min-h-[44px] transition ${
                step === s.num
                  ? "bg-[#D9BD81] text-[#090A0A]"
                  : "bg-[#232528] text-[#F6F4EF]/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 sm:p-8 text-[#090A0A] space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="sb-service"
                className="block text-xs font-bold uppercase tracking-wider text-[#232528] mb-2"
              >
                Select Canonical Service (13 Services)
              </label>
              <select
                id="sb-service"
                value={serviceId}
                onChange={(e) => {
                  const chosen = CANONICAL_SERVICES.find(
                    (s) => s.id === e.target.value
                  );
                  setServiceId(e.target.value);
                  if (chosen?.estimated_hours) {
                    setScopedHours(chosen.estimated_hours);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#232528]/25 bg-white text-sm font-semibold min-h-[46px]"
              >
                {CANONICAL_SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.title} ({s.estimated_hours}h base)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sb-title"
                  className="block text-xs font-bold uppercase text-[#232528] mb-1.5"
                >
                  Project / Campaign Title
                </label>
                <input
                  id="sb-title"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#232528]/25 bg-white text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="sb-client"
                  className="block text-xs font-bold uppercase text-[#232528] mb-1.5"
                >
                  Client / Brand Contact
                </label>
                <input
                  id="sb-client"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#232528]/25 bg-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
              >
                <span>Next: Brief &amp; Add-ons</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="sb-notes"
                className="block text-xs font-bold uppercase tracking-wider text-[#232528] mb-2"
              >
                Creative Direction &amp; Specification Notes
              </label>
              <textarea
                id="sb-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#232528]/25 bg-white text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#232528] mb-2">
                Optional Compatible Add-ons
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CANONICAL_ADDONS.filter((a) =>
                  a.compatible_services?.includes(activeService.id)
                ).map((a) => {
                  const active = addons.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between gap-2 min-h-[48px] ${
                        active
                          ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81]"
                          : "bg-white border-[#232528]/20"
                      }`}
                    >
                      <span>
                        <strong className="font-mono text-[#D9BD81] mr-1">
                          {a.id}
                        </strong>
                        {a.label}
                      </span>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-[#D9BD81]" : "text-[#232528]/25"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-[#232528]/30 text-xs font-bold min-h-[44px]"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
              >
                <span>Next: Express Preflight &amp; Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white border border-[#232528]/20 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#090A0A]">
                <Clock className="w-4 h-4 text-[#D9BD81]" />
                <span>Express Delivery From 10 Min Preflight Check</span>
              </div>
              <p className="text-[#232528]">
                Express 10-minute delivery applies strictly to eligible{" "}
                <strong>SRV-02 / SRV-05</strong> single-file micro-edits when
                open source files are attached AND a Studio Desk slot is
                explicitly confirmed.
              </p>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={expressRequested}
                    onChange={(e) => setExpressRequested(e.target.checked)}
                    className="accent-[#090A0A]"
                  />
                  <span>Request 10-Min Express Slot Evaluation</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={sourceFilesReady}
                    onChange={(e) => setSourceFilesReady(e.target.checked)}
                    className="accent-[#090A0A]"
                  />
                  <span>Clean open source file (.AI / .PSD / .FIG) ready</span>
                </label>
              </div>

              {expressRequested && (
                <div
                  className={`p-3 rounded-lg font-mono ${
                    expressEligible
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                      : "bg-amber-50 text-amber-900 border border-amber-300"
                  }`}
                >
                  {expressEligible
                    ? "PREFLIGHT PASSED — Eligible for Studio Desk Express Slot Confirmation."
                    : "STANDARD QUEUE — Selected service or missing source file disqualifies automatic 10-min express delivery."}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#090A0A] text-[#F6F4EF] text-xs font-mono space-y-1.5">
              <div>
                Service: <strong className="text-[#D9BD81]">{serviceId}</strong>{" "}
                ({activeService.title})
              </div>
              <div>
                Scoped Base Estimate:{" "}
                <strong className="text-[#D9BD81]">{scopedHours}h</strong>{" "}
                &bull; 2 Consolidated Revisions
              </div>
              <div>
                Billing Gate:{" "}
                <strong className="text-amber-300">
                  Formal Quote Required Before Payment
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-[#232528]/30 text-xs font-bold min-h-[44px]"
              >
                ← Back
              </button>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/builder?service=${serviceId}`}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[44px]"
                >
                  <span>Persist to Real Supabase DB (/builder)</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSubmitSandbox}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-extrabold min-h-[44px]"
                >
                  <span>Submit to Interactive Sandbox Office</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

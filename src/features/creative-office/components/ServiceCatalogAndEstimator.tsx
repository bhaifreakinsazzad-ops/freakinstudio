"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Lock } from "lucide-react";
import {
  CANONICAL_ADDONS,
  CANONICAL_BUNDLES,
  CANONICAL_SERVICES,
  CANONICAL_SERVICE_VARIANTS,
  DISCIPLINES,
  RATEBOOK_APPROVED,
  RATEBOOK_VERSION,
} from "../data/catalog-bridge";
import { AnimatedNumber, getStagger, runKinetic } from "../utils/motion";
import type { BriefPrefill, LangCode } from "../types";

export function ServiceCatalogAndEstimator({
  lang,
  reducedMotion,
  initialDiscipline,
  onConfigureBrief,
}: {
  lang: LangCode;
  reducedMotion: boolean;
  initialDiscipline: string;
  onConfigureBrief: (prefill: BriefPrefill) => void;
}) {
  const [selectedDiscipline, setSelectedDiscipline] = useState(
    initialDiscipline || "ALL"
  );
  const [selectedServiceId, setSelectedServiceId] = useState("SRV-05");
  const [selectedVariantId, setSelectedVariantId] = useState("VAR-05");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "ADD-02",
    "ADD-03",
  ]);
  const [promoDate, setPromoDate] = useState("2026-11-25");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const filteredServices = useMemo(() => {
    if (selectedDiscipline === "ALL") return CANONICAL_SERVICES;
    return CANONICAL_SERVICES.filter(
      (s) =>
        s.category_id === selectedDiscipline ||
        s.discipline_id === selectedDiscipline
    );
  }, [selectedDiscipline]);

  useEffect(() => {
    if (reducedMotion || !gridRef.current) return;
    runKinetic(gridRef.current.querySelectorAll(".service-card-stagger"), {
      opacity: [0, 1],
      y: [12, 0],
      delay: getStagger(40),
      duration: 380,
      ease: "outCubic",
    });
  }, [selectedDiscipline, reducedMotion]);

  const activeService =
    CANONICAL_SERVICES.find((s) => s.id === selectedServiceId) ||
    CANONICAL_SERVICES[0];

  const availableVariants = useMemo(
    () =>
      CANONICAL_SERVICE_VARIANTS.filter(
        (v) => v.serviceId === activeService.id
      ),
    [activeService.id]
  );

  const activeVariant =
    availableVariants.find((v) => v.id === selectedVariantId) ||
    availableVariants[0] ||
    null;

  const compatibleAddons = useMemo(
    () =>
      CANONICAL_ADDONS.filter((a) =>
        a.compatible_services?.includes(activeService.id)
      ),
    [activeService.id]
  );

  const isPromoActive = useMemo(() => {
    if (!promoDate) return false;
    return promoDate >= "2026-11-20" && promoDate <= "2026-12-15";
  }, [promoDate]);

  const scopedHours = useMemo(() => {
    const baseHours =
      activeVariant?.estimatedHours || activeService.estimated_hours || 2;
    const addonHours = selectedAddons.reduce((sum, addId) => {
      const a = CANONICAL_ADDONS.find((x) => x.id === addId);
      return sum + (a?.extra_hours || 0);
    }, 0);
    return Number((baseHours + addonHours).toFixed(1));
  }, [activeVariant, activeService.estimated_hours, selectedAddons]);

  const effectiveHours = isPromoActive
    ? Number((scopedHours * 0.95).toFixed(2))
    : scopedHours;

  const toggleAddon = (addId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addId) ? prev.filter((x) => x !== addId) : [...prev, addId]
    );
  };

  return (
    <section className="space-y-10">
      {/* Banner */}
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            CANONICAL ARCHITECTURE &bull; 4 DISCIPLINES / 13 SERVICES / 15
            VARIANTS / 5 BUNDLES / 14 ADD-ONS
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            {RATEBOOK_APPROVED
              ? `RATEBOOK ${RATEBOOK_VERSION} APPROVED`
              : `${RATEBOOK_VERSION} — QUOTATION REQUIRED BEFORE PAYMENT`}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-4">
          13 Core Creative Services &amp; Hourly Scope Estimator
        </h2>
        <p className="text-sm text-[#F6F4EF]/80 mt-2 max-w-3xl">
          Every engagement runs on transparent billable hours and{" "}
          <strong className="text-[#D9BD81]">
            2 consolidated revision rounds
          </strong>
          . Final BDT/USD billing stays locked until Owner Ratebook v8/v8.1
          confirmation or a signed formal Studio Desk quotation.
        </p>

        {/* Discipline Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDiscipline("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition min-h-[44px] ${
              selectedDiscipline === "ALL"
                ? "bg-[#D9BD81] text-[#090A0A]"
                : "bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80"
            }`}
          >
            All Disciplines (13)
          </button>
          {DISCIPLINES.map((disc) => (
            <button
              key={disc.id}
              type="button"
              onClick={() => setSelectedDiscipline(disc.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition min-h-[44px] ${
                selectedDiscipline === disc.id
                  ? "bg-[#D9BD81] text-[#090A0A]"
                  : "bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80"
              }`}
            >
              {disc.code} &bull; {lang === "bn" ? disc.nameBn : disc.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 13 Services Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredServices.map((srv) => {
          const isSelected = activeService.id === srv.id;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                setSelectedServiceId(srv.id);
                const firstVar = CANONICAL_SERVICE_VARIANTS.find(
                  (v) => v.serviceId === srv.id
                );
                if (firstVar) setSelectedVariantId(firstVar.id);
                setSelectedAddons([]);
              }}
              className={`service-card-stagger text-left rounded-2xl p-5 border transition flex flex-col justify-between min-h-[195px] ${
                isSelected
                  ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81] ring-2 ring-[#D9BD81]/40"
                  : "bg-[#F6F4EF] text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-[#D9BD81] text-[#090A0A]"
                        : "bg-[#090A0A] text-[#D9BD81]"
                    }`}
                  >
                    {srv.id}
                  </span>
                  {srv.express_eligible ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                      10-Min Eligible*
                    </span>
                  ) : (
                    <span
                      className={`text-[11px] font-mono ${
                        isSelected ? "text-[#F6F4EF]/70" : "text-[#232528]"
                      }`}
                    >
                      {srv.days}d &bull; {srv.estimated_hours}h base
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold mt-3">{srv.title}</h3>
                {srv.title_bn && (
                  <div
                    className={`text-xs mt-0.5 ${
                      isSelected ? "text-[#D9BD81]" : "text-[#232528]"
                    }`}
                  >
                    {srv.title_bn}
                  </div>
                )}
                <p
                  className={`text-xs mt-2 leading-relaxed ${
                    isSelected ? "text-[#F6F4EF]/80" : "text-[#232528]"
                  }`}
                >
                  {srv.summary}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
                  isSelected
                    ? "border-white/10 text-[#D9BD81]"
                    : "border-[#232528]/15 text-[#090A0A]"
                }`}
              >
                <span>2 Revisions Included</span>
                <span>Quote on Verified Hours →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Scope, Variant & Add-on Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 text-[#090A0A] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232528]/15 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#232528]">
                ACTIVE ESTIMATOR &bull; {activeService.id}
              </span>
              <h3 className="text-xl font-bold mt-0.5">{activeService.title}</h3>
            </div>
            <Link
              href={`/services/${activeService.id}`}
              className="text-xs font-bold underline text-[#090A0A]"
            >
              Full Service Spec →
            </Link>
          </div>

          {activeService.express_eligible && activeService.express_rule && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <span>
                <strong>Express 10-Min Rule:</strong>{" "}
                {activeService.express_rule} Requires confirmed open studio
                slot.
              </span>
            </div>
          )}

          {/* Variants */}
          {availableVariants.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#232528]">
                Select Scoped Variant ({availableVariants.length} Available)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableVariants.map((variant) => {
                  const active = activeVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`text-left p-3.5 rounded-xl border transition min-h-[76px] ${
                        active
                          ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81]"
                          : "bg-white text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span
                          className={
                            active ? "text-[#D9BD81] font-bold" : "font-bold"
                          }
                        >
                          {variant.id}
                        </span>
                        <span>{variant.estimatedHours}h</span>
                      </div>
                      <div className="font-bold text-sm mt-1">
                        {variant.title}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          active ? "text-[#F6F4EF]/75" : "text-[#232528]"
                        }`}
                      >
                        {variant.scopeSummary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compatible Add-ons */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#232528]">
              Compatible Add-ons ({compatibleAddons.length} of 14 Canonical)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {compatibleAddons.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`text-left p-3 rounded-xl border flex items-start justify-between gap-2 text-xs transition min-h-[56px] ${
                      checked
                        ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81]"
                        : "bg-white text-[#090A0A] border-[#232528]/20"
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-[#D9BD81]">
                        {addon.id} (+{addon.extra_hours}h)
                      </div>
                      <div className="font-semibold mt-0.5">{addon.label}</div>
                    </div>
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        checked ? "text-[#D9BD81]" : "text-[#232528]/25"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-5 rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 p-6 text-[#F6F4EF] space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono text-[#D9BD81]">
              TRANSPARENT SCOPE LEDGER
            </span>
            <span className="text-xs font-mono text-amber-300">
              Quote Gate Active
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[#F6F4EF]/80">Total Scope Hours</span>
            <span className="text-4xl font-extrabold text-[#D9BD81] font-mono">
              <AnimatedNumber
                value={effectiveHours}
                decimals={isPromoActive ? 2 : 1}
                suffix="h"
                reducedMotion={reducedMotion}
              />
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#232528] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D9BD81]">
                5% Launch Window Check (20 Nov–15 Dec 2026)
              </span>
              <span
                className={
                  isPromoActive ? "text-emerald-300 font-bold" : "text-amber-300"
                }
              >
                {isPromoActive ? "5% Promo Eligible" : "Outside Window"}
              </span>
            </div>
            <input
              type="date"
              aria-label="Test promo booking date"
              value={promoDate}
              onChange={(e) => setPromoDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#090A0A] border border-white/15 font-mono text-xs text-[#F6F4EF]"
            />
          </div>

          <div className="space-y-1.5 text-xs text-[#F6F4EF]/80">
            <div>
              <strong>Included:</strong>{" "}
              {(activeService.included || []).slice(0, 2).join(" • ")}
            </div>
            <div>
              <strong>Revisions:</strong> 2 consolidated revision rounds included
            </div>
            <div>
              <strong>Rate Authority:</strong> Official BDT &amp; USD hourly
              totals confirmed in formal Studio Desk quote (Ratebook v8/v8.1).
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() =>
                onConfigureBrief({
                  topic: `${activeService.id}: ${activeService.title}${
                    activeVariant ? ` (${activeVariant.title})` : ""
                  }`,
                  serviceId: activeService.id,
                  variantLabel: activeVariant?.title || "Standard Scope",
                  addons: selectedAddons,
                  scopedHours: effectiveHours,
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-extrabold text-sm hover:brightness-105 transition min-h-[48px]"
            >
              <span>Load Into Interactive Smart Brief</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href={`/builder?service=${activeService.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#232528] text-[#F6F4EF] border border-white/15 font-bold text-xs hover:border-[#D9BD81] transition min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#D9BD81]" />
              <span>Open Full Multi-Service Package Builder (/builder)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Commercial Bundles */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-[#090A0A]">
          5 Pre-Scoped Commercial Bundles (BND-01 to BND-05)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANONICAL_BUNDLES.map((bundle) => (
            <article
              key={bundle.id}
              className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-5 flex flex-col justify-between text-[#090A0A]"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#090A0A] text-[#D9BD81] font-bold">
                    {bundle.id}
                  </span>
                  <span className="text-[#232528]">
                    {bundle.estimatedHours}h &bull; {bundle.turnaroundDays}
                  </span>
                </div>
                <h4 className="text-lg font-bold mt-2.5">{bundle.title}</h4>
                <p className="text-xs text-[#232528] mt-1">{bundle.summary}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {bundle.includedServiceIds.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded bg-white border border-[#232528]/15 text-[11px] font-mono font-bold"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#232528]/15 flex items-center justify-between">
                <span className="text-xs font-mono text-[#232528]">
                  Quote Required
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onConfigureBrief({
                      topic: `${bundle.id}: ${bundle.title}`,
                      serviceId: bundle.includedServiceIds[0],
                      variantLabel: `${bundle.id} Bundle`,
                      scopedHours: bundle.estimatedHours,
                    })
                  }
                  className="text-xs font-extrabold text-[#090A0A] hover:underline inline-flex items-center gap-1"
                >
                  <span>Request Bundle Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

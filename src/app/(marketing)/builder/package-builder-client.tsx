"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculatePricingSummary,
  evaluateExpress10MinEligibility,
} from "@/lib/pricing/engine";
import { getServiceConfigSchema } from "@/lib/catalog";
import { saveBuilderDraft, clearBuilderDraft } from "@/lib/builder/draft-storage";
import { submitPackageAction } from "./actions";
import type {
  AddOn,
  CommercialBundle,
  Currency,
  PaymentGateway,
  Service,
  ServiceCategory,
  ServiceConfig,
  ServiceVariant,
} from "@/types/domain";

interface PackageBuilderClientProps {
  categories: ServiceCategory[];
  services: Service[];
  variants: ServiceVariant[];
  bundles: CommercialBundle[];
  addOns: AddOn[];
  serviceAddOnsMap: Record<string, string[]>;
  initialServiceId?: string;
  initialBundleId?: string | null;
  isAuthenticated: boolean;
}

const STEPS = [
  "1. Core Service & Bundle",
  "2. Variant & Add-ons",
  "3. Smart Brief & Timeline",
  "4. Review & Submit",
];

export function PackageBuilderClient({
  categories,
  services,
  variants,
  bundles,
  addOns,
  serviceAddOnsMap,
  initialServiceId,
  initialBundleId,
  isAuthenticated,
}: PackageBuilderClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<Currency>("BDT");

  const validInitialId = useMemo(() => {
    if (
      initialServiceId &&
      services.some((s) => s.id === initialServiceId)
    ) {
      return initialServiceId;
    }
    return services[0]?.id || "SRV-01";
  }, [initialServiceId, services]);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    validInitialId,
  ]);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(
    initialBundleId || null
  );
  const [serviceConfigs, setServiceConfigs] = useState<
    Record<string, ServiceConfig>
  >({});
  const [selectedAddOns, setSelectedAddOns] = useState<
    Record<string, string[]>
  >({});
  const [promoEvaluationDate, setPromoEvaluationDate] =
    useState<string>("2026-11-25");

  const [brief, setBrief] = useState({
    brandName: "",
    objective: "",
    audience: "",
    platforms: "Instagram, Facebook, LinkedIn, Print",
  });
  const [gateway, setGateway] = useState<PaymentGateway>("sslcommerz");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync draft to localStorage
  useEffect(() => {
    saveBuilderDraft({
      selectedCategoryIds: [],
      selectedServiceIds,
      serviceConfigs,
      selectedAddOns,
      bundleId: selectedBundleId,
      brief,
      currency,
    });
  }, [
    selectedServiceIds,
    serviceConfigs,
    selectedAddOns,
    selectedBundleId,
    brief,
    currency,
  ]);

  const pricing = useMemo(
    () =>
      calculatePricingSummary({
        serviceIds: selectedServiceIds,
        serviceConfigs,
        selectedAddOns,
        currency,
        catalogServices: services,
        catalogAddOns: addOns,
        bundleId: selectedBundleId,
        evaluationDate: promoEvaluationDate,
      }),
    [
      selectedServiceIds,
      serviceConfigs,
      selectedAddOns,
      currency,
      services,
      addOns,
      selectedBundleId,
      promoEvaluationDate,
    ]
  );

  const toggleService = (id: string) => {
    setSelectedBundleId(null);
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const applyBundle = (bundle: CommercialBundle) => {
    setSelectedBundleId(bundle.id);
    setSelectedServiceIds(bundle.includedServiceIds);
    toast.success(`Loaded ${bundle.id}: ${bundle.title}`);
  };

  const updateConfig = (serviceId: string, patch: Partial<ServiceConfig>) => {
    setServiceConfigs((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || { quantity: 1, rush: false }),
        ...patch,
      },
    }));
  };

  const toggleAddOn = (serviceId: string, addOnId: string) => {
    setSelectedAddOns((prev) => {
      const current = prev[serviceId] || [];
      const updated = current.includes(addOnId)
        ? current.filter((a) => a !== addOnId)
        : [...current, addOnId];
      return { ...prev, [serviceId]: updated };
    });
  };

  const handleComplete = async (intent: "checkout" | "quote") => {
    if (selectedServiceIds.length === 0) {
      toast.error("Please select at least one creative service.");
      return;
    }

    if (!brief.brandName.trim() || !brief.objective.trim()) {
      toast.error(
        "Please enter your brand name and project objective in Step 3."
      );
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPackageAction({
        serviceIds: selectedServiceIds,
        serviceConfigs,
        selectedAddOns,
        brief,
        currency,
        gateway,
        intent,
      });

      if (res.requiresAuth) {
        toast.info(
          "Your Smart Brief draft is saved! Sign in or create an account to finalize."
        );
        router.push("/login?next=/builder");
        return;
      }

      if (!res.ok) {
        toast.error(res.error || "Failed to process package.");
        return;
      }

      clearBuilderDraft();
      toast.success(
        intent === "quote"
          ? "Smart Brief & Studio Quotation request submitted!"
          : "Project workspace initialized!"
      );

      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const symbol = currency === "BDT" ? "৳" : "$";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232528] pb-6">
        <div>
          <span className="badge-mono text-[#D9BD81]">
            Progressive Smart Project Brief &bull; 13 Canonical Services
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF] mt-1">
            Smart Project Brief &amp; Hourly Scope Estimator
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center rounded-md border border-[#232528] bg-[#121315] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCurrency("BDT")}
              className={`px-3 py-1 rounded ${
                currency === "BDT"
                  ? "bg-[#D9BD81] text-[#090A0A] font-bold"
                  : "text-[#F6F4EF]/65"
              }`}
            >
              ৳ BDT
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 rounded ${
                currency === "USD"
                  ? "bg-[#D9BD81] text-[#090A0A] font-bold"
                  : "text-[#F6F4EF]/65"
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {STEPS.map((label, idx) => (
          <button
            type="button"
            key={label}
            onClick={() => setStep(idx)}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              step === idx
                ? "bg-[#D9BD81] text-[#090A0A] font-bold"
                : idx < step
                ? "bg-[#121315] text-[#F6F4EF] border border-[#D9BD81]/40"
                : "bg-[#121315]/50 text-[#F6F4EF]/60 border border-[#232528]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content + Live Ledger Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-[#232528] bg-[#121315] p-6 sm:p-8 space-y-6">
          {/* STEP 0: Select Core Services (13) or Commercial Bundle (5) */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#F6F4EF]">
                  1. Select Core Creative Services (13) or Commercial Bundle (5)
                </h2>
                <p className="text-xs text-[#F6F4EF]/65 mt-1">
                  Choose individual services across our 4 disciplines or quick-load one of the 5 commercial bundles.
                </p>
              </div>

              {/* Quick Load 5 Bundles */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D9BD81] block">
                  Optional: Load a Commercial Bundle (BND-01 to BND-05)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {bundles.map((b) => {
                    const active = selectedBundleId === b.id;
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => applyBundle(b)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          active
                            ? "border-[#D9BD81] bg-[#D9BD81]/15"
                            : "border-[#232528] bg-[#090A0A]/60 hover:border-[#D9BD81]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-[#D9BD81]">{b.id}</span>
                          <span className="text-[10px] text-[#F6F4EF]/65">
                            {b.estimatedHours}h &bull; {b.includedServiceIds.join(" + ")}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#F6F4EF] mt-1">
                          {b.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 13 Services Grouped by 4 Disciplines */}
              <div className="space-y-5">
                {categories.map((cat) => {
                  const catServices = services.filter(
                    (s) => s.category_id === cat.id
                  );
                  return (
                    <div key={cat.id} className="space-y-2.5">
                      <h3 className="font-mono text-xs uppercase tracking-wider text-[#D9BD81] border-b border-[#232528] pb-1.5">
                        {cat.id} &middot; {cat.name} ({catServices.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catServices.map((srv) => {
                          const active = selectedServiceIds.includes(srv.id);
                          const price =
                            currency === "BDT" ? srv.base_bdt : srv.base_usd;
                          return (
                            <button
                              type="button"
                              key={srv.id}
                              onClick={() => toggleService(srv.id)}
                              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                                active
                                  ? "border-[#D9BD81] bg-[#D9BD81]/15"
                                  : "border-[#232528] bg-[#090A0A]/60 hover:border-[#D9BD81]/40"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-xs font-bold text-[#D9BD81]">
                                    {srv.id}
                                  </span>
                                  <span className="font-mono text-[10px] text-[#F6F4EF]/65">
                                    {srv.estimated_hours || 4}h &bull;{" "}
                                    {srv.days}d
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-[#F6F4EF] mt-1">
                                  {srv.title}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-[#232528] flex items-center justify-between text-xs font-mono">
                                <span className="text-[#F6F4EF]/55">
                                  {srv.revisions} Revisions
                                </span>
                                <span className="font-bold text-[#D9BD81]">
                                  {symbol}
                                  {price.toLocaleString()}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: Configure Variants (15), Add-ons (14), and 10-Min Express Preflight */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#F6F4EF]">
                  2. Configure Scoped Variants (15) &amp; Compatible Add-ons (14)
                </h2>
                <p className="text-xs text-[#F6F4EF]/65 mt-1">
                  Select a scoped variant, deliverable quantity, and optional add-ons for each selected service.
                </p>
              </div>

              {selectedServiceIds.map((id) => {
                const srv = services.find((s) => s.id === id);
                if (!srv) return null;
                const cfg = serviceConfigs[id] || {
                  quantity: 1,
                  rush: false,
                };
                const schema = getServiceConfigSchema(srv.id);
                const srvVariants = variants.filter(
                  (v) => v.serviceId === srv.id
                );
                const compatibleAddonIds = serviceAddOnsMap[id] || [];
                const compatibleAddons = addOns.filter((a) =>
                  compatibleAddonIds.includes(a.id)
                );
                const chosenAddons = selectedAddOns[id] || [];

                const expressPreflight = evaluateExpress10MinEligibility({
                  serviceId: srv.id,
                  sourceFilesReady: cfg.sourceFilesReady,
                  singleMicroEditConfirmed: cfg.singleMicroEditConfirmed,
                });

                return (
                  <div
                    key={id}
                    className="p-5 rounded-xl border border-[#232528] bg-[#090A0A]/80 space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-[#232528] pb-3">
                      <span className="font-semibold text-base text-[#F6F4EF]">
                        <span className="font-mono text-[#D9BD81] mr-2">
                          {srv.id}
                        </span>
                        {srv.title}
                      </span>
                      <span className="text-xs font-mono text-[#D9BD81]">
                        Base: {srv.estimated_hours || 4}h ({symbol}
                        {(currency === "BDT"
                          ? srv.base_bdt
                          : srv.base_usd
                        ).toLocaleString()}
                        )
                      </span>
                    </div>

                    {/* Scoped Variant Selection */}
                    {srvVariants.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase text-[#D9BD81] block">
                          Scoped Service Variant
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateConfig(id, { variantId: undefined })
                            }
                            className={`text-left p-2.5 rounded-lg border text-xs ${
                              !cfg.variantId
                                ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                                : "border-[#232528] bg-[#121315] text-[#F6F4EF]/70"
                            }`}
                          >
                            <div className="font-mono font-bold">
                              Standard Base Scope ({srv.estimated_hours}h)
                            </div>
                          </button>
                          {srvVariants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() =>
                                updateConfig(id, { variantId: v.id })
                              }
                              className={`text-left p-2.5 rounded-lg border text-xs ${
                                cfg.variantId === v.id
                                  ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                                  : "border-[#232528] bg-[#121315] text-[#F6F4EF]/70"
                              }`}
                            >
                              <div className="flex justify-between font-mono">
                                <span className="text-[#D9BD81] font-bold">
                                  {v.id}
                                </span>
                                <span>{v.estimatedHours}h</span>
                              </div>
                              <div className="font-medium mt-0.5">
                                {v.title}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Format & Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-[#F6F4EF]/65 block mb-1.5">
                          {schema.quantityLabel}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={cfg.quantity || 1}
                          onChange={(e) =>
                            updateConfig(id, {
                              quantity: Math.max(
                                1,
                                parseInt(e.target.value, 10) || 1
                              ),
                            })
                          }
                          className="bg-[#121315] border-[#232528] h-9 text-xs font-mono text-[#F6F4EF]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-[#F6F4EF]/65 block mb-1.5">
                          Deliverable Format
                        </label>
                        <select
                          value={cfg.format || schema.formatOptions[0]}
                          onChange={(e) =>
                            updateConfig(id, { format: e.target.value })
                          }
                          className="w-full h-9 rounded-md border border-[#232528] bg-[#121315] px-3 text-xs font-mono text-[#F6F4EF]"
                        >
                          {schema.formatOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 10-Min Express Delivery Preflight Guard */}
                    {schema.express10MinEligible && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5 text-xs">
                        <div className="font-mono text-[11px] font-bold text-emerald-300 uppercase">
                          10-Minute Express Micro-Edit Preflight ({srv.id})
                        </div>
                        <p className="text-[#F6F4EF]/70 text-[11px]">
                          {schema.expressRule}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                            <input
                              type="checkbox"
                              checked={Boolean(cfg.sourceFilesReady)}
                              onChange={(e) =>
                                updateConfig(id, {
                                  sourceFilesReady: e.target.checked,
                                })
                              }
                              className="accent-[#D9BD81]"
                            />
                            <span>Open source file ready</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                            <input
                              type="checkbox"
                              checked={Boolean(cfg.singleMicroEditConfirmed)}
                              onChange={(e) =>
                                updateConfig(id, {
                                  singleMicroEditConfirmed: e.target.checked,
                                })
                              }
                              className="accent-[#D9BD81]"
                            />
                            <span>Single micro-edit confirmed</span>
                          </label>
                        </div>
                        <div className="font-mono text-[11px] pt-1">
                          Status:{" "}
                          {expressPreflight.serviceEligible &&
                          cfg.sourceFilesReady &&
                          cfg.singleMicroEditConfirmed ? (
                            <span className="text-emerald-400 font-bold">
                              CLIENT PREFLIGHT READY — Awaits Studio Desk Slot Confirmation
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              Standard Queue ({expressPreflight.reasons[0]})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Compatible Add-ons (from the 14 Canonical Add-ons) */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-[#D9BD81] block">
                        Compatible Add-ons ({compatibleAddons.length})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {compatibleAddons.map((addon) => {
                          const checked = chosenAddons.includes(addon.id);
                          const price =
                            currency === "BDT"
                              ? addon.unit_price_bdt
                              : addon.unit_price_usd;
                          return (
                            <button
                              type="button"
                              key={addon.id}
                              onClick={() => toggleAddOn(id, addon.id)}
                              className={`text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                checked
                                  ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                                  : "border-[#232528] bg-[#121315] text-[#F6F4EF]/70"
                              }`}
                            >
                              <span className="truncate">
                                <strong className="font-mono text-[#D9BD81] mr-1">
                                  {addon.id}
                                </strong>
                                {addon.label}
                              </span>
                              <span className="font-mono text-[#D9BD81] shrink-0">
                                +{symbol}
                                {price.toLocaleString()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: Smart Project Brief & Launch Promo Date */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#F6F4EF]">
                  3. Smart Creative Brief &amp; Launch Window Check
                </h2>
                <p className="text-xs text-[#F6F4EF]/65 mt-1">
                  Provide your brand context and deliverable objective so our Human Creative Lead and SI Assistant can scope accurately.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="brief-brand-name"
                    className="text-xs font-mono text-[#F6F4EF] block mb-1.5"
                  >
                    Brand / Company Name *
                  </label>
                  <Input
                    id="brief-brand-name"
                    placeholder="e.g., Sylhet Botanicals or Veloce Audio"
                    value={brief.brandName}
                    onChange={(e) =>
                      setBrief({ ...brief, brandName: e.target.value })
                    }
                    className="bg-[#090A0A] border-[#232528] text-[#F6F4EF]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brief-objective"
                    className="text-xs font-mono text-[#F6F4EF] block mb-1.5"
                  >
                    Project Objective &amp; Deliverable Goals *
                  </label>
                  <textarea
                    id="brief-objective"
                    rows={4}
                    placeholder="Describe your product, visual direction, required dimensions, and commercial goals..."
                    value={brief.objective}
                    onChange={(e) =>
                      setBrief({ ...brief, objective: e.target.value })
                    }
                    className="w-full rounded-md border border-[#232528] bg-[#090A0A] p-3 text-xs text-[#F6F4EF] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="brief-audience"
                      className="text-xs font-mono text-[#F6F4EF] block mb-1.5"
                    >
                      Target Audience &amp; Market
                    </label>
                    <Input
                      id="brief-audience"
                      placeholder="e.g., D2C consumers in Dhaka & global diaspora"
                      value={brief.audience}
                      onChange={(e) =>
                        setBrief({ ...brief, audience: e.target.value })
                      }
                      className="bg-[#090A0A] border-[#232528] text-[#F6F4EF]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="brief-platforms"
                      className="text-xs font-mono text-[#F6F4EF] block mb-1.5"
                    >
                      Target Channels &amp; Formats
                    </label>
                    <Input
                      id="brief-platforms"
                      value={brief.platforms}
                      onChange={(e) =>
                        setBrief({ ...brief, platforms: e.target.value })
                      }
                      className="bg-[#090A0A] border-[#232528] text-[#F6F4EF]"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#232528] bg-[#090A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D9BD81] block">
                      5% Launch Promotion Window (20 Nov &ndash; 15 Dec 2026
                      Asia/Dhaka)
                    </span>
                    <span className="text-[11px] text-[#F6F4EF]/65">
                      Verify how the 5% launch discount applies based on booking date:
                    </span>
                  </div>
                  <input
                    type="date"
                    value={promoEvaluationDate}
                    onChange={(e) => setPromoEvaluationDate(e.target.value)}
                    className="rounded border border-[#232528] bg-[#121315] px-3 py-1.5 font-mono text-xs text-[#F6F4EF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Final Review & Submission */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#F6F4EF]">
                  4. Review Scoped Hourly Summary &amp; Submit
                </h2>
                <p className="text-xs text-[#F6F4EF]/65 mt-1">
                  All monetary totals are verified server-side from our canonical 13-service hourly ratebook.
                </p>
              </div>

              <div className="rounded-xl border border-[#232528] bg-[#090A0A] p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">Brand Name:</span>
                  <span className="text-[#F6F4EF]">
                    {brief.brandName || "Not entered"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">Total Scoped Hours:</span>
                  <span className="text-[#D9BD81] font-bold">
                    {pricing.totalScopedHours} Hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">Revision Policy:</span>
                  <span className="text-[#F6F4EF]">
                    2 Consolidated Revision Rounds Included
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono uppercase text-[#F6F4EF]/65 block">
                  Select Settlement Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGateway("sslcommerz")}
                    className={`p-4 rounded-xl border text-left ${
                      gateway === "sslcommerz"
                        ? "border-[#D9BD81] bg-[#D9BD81]/15"
                        : "border-[#232528] bg-[#090A0A]"
                    }`}
                  >
                    <p className="font-mono text-xs font-bold text-[#F6F4EF]">
                      SSLCommerz (BDT Local Gateways)
                    </p>
                    <p className="text-[11px] text-[#F6F4EF]/65 mt-1">
                      bKash, Nagad, Local Visa/Mastercard &amp; Net Banking
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGateway("stripe")}
                    className={`p-4 rounded-xl border text-left ${
                      gateway === "stripe"
                        ? "border-[#D9BD81] bg-[#D9BD81]/15"
                        : "border-[#232528] bg-[#090A0A]"
                    }`}
                  >
                    <p className="font-mono text-xs font-bold text-[#F6F4EF]">
                      Stripe Global (USD / International)
                    </p>
                    <p className="text-[11px] text-[#F6F4EF]/65 mt-1">
                      International Cards, Apple Pay &amp; Corporate Billing
                    </p>
                  </button>
                </div>
              </div>

              {pricing.quoteRequired && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1.5 text-xs">
                  <p className="font-mono font-bold uppercase text-amber-300 text-[11px]">
                    Formal Studio Quotation Required Before Checkout
                  </p>
                  <p className="text-[#F6F4EF]/80 leading-relaxed">
                    Displayed figures are estimated reference hours ({pricing.totalScopedHours}h). Direct online payment is paused until final scope &amp; Ratebook confirmation is issued by the Studio Desk.
                  </p>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleComplete("quote")}
                  className="flex-1 cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs h-11"
                >
                  {isSubmitting
                    ? "Submitting Smart Brief..."
                    : "Submit Smart Brief & Request Studio Quote →"}
                </Button>
                {!pricing.quoteRequired && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleComplete("checkout")}
                    className="font-mono text-xs h-11 border-[#232528] text-[#F6F4EF]"
                  >
                    Proceed to Verified Payment ({symbol}
                    {(currency === "BDT"
                      ? pricing.finalBDT
                      : pricing.finalUSD
                    ).toLocaleString()}
                    )
                  </Button>
                )}
              </div>

              {!isAuthenticated && (
                <p className="text-[11px] font-mono text-[#F6F4EF]/60 text-center">
                  Note: Your Smart Brief configuration is saved locally. Clicking submit will prompt you to sign in or register so your project is linked to your Client Office.
                </p>
              )}
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-[#232528]">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="font-mono text-xs border-[#232528] text-[#F6F4EF]"
            >
              &larr; Previous Step
            </Button>

            {step < STEPS.length - 1 && (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs"
              >
                Next Step &rarr;
              </Button>
            )}
          </div>
        </div>

        {/* Live Authoritative Hourly Summary Ledger */}
        <div className="rounded-2xl border border-[#D9BD81]/40 bg-[#121315] p-6 space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#232528] pb-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#D9BD81]">
              Live Hourly Scope Ledger
            </h3>
            <span className="text-xs font-mono text-[#F6F4EF]/75">
              {pricing.totalScopedHours}h Scoped
            </span>
          </div>

          {pricing.items.length === 0 ? (
            <p className="text-xs text-[#F6F4EF]/60 py-6 text-center font-mono">
              No services selected yet.
            </p>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-[#232528] text-xs">
              {pricing.items.map((item) => {
                const lineVal =
                  currency === "BDT" ? item.lineTotalBDT : item.lineTotalUSD;
                return (
                  <li key={item.serviceId} className="pt-2.5 first:pt-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-[#F6F4EF]">
                        <span className="font-mono text-[#D9BD81] mr-1.5">
                          {item.serviceId}
                        </span>
                        {item.title}
                      </span>
                      <span className="font-mono font-semibold text-[#F6F4EF]">
                        {symbol}
                        {lineVal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#F6F4EF]/60">
                      <span>Qty: {item.quantity}</span>
                      <span>&bull; {item.scopedHours}h</span>
                      {item.variantId && (
                        <span className="text-[#D9BD81]">
                          &bull; Variant {item.variantId}
                        </span>
                      )}
                      {item.selectedAddOns.length > 0 && (
                        <span>
                          &bull; +{item.selectedAddOns.length} add-on(s)
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-[#232528] pt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#F6F4EF]/70">
              <span>Base Scoped Subtotal</span>
              <span>
                {symbol}
                {(currency === "BDT"
                  ? pricing.subtotalBDT
                  : pricing.subtotalUSD
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#F6F4EF]/70">
              <span>Compatible Add-ons</span>
              <span>
                {symbol}
                {(currency === "BDT"
                  ? pricing.addOnsTotalBDT
                  : pricing.addOnsTotalUSD
                ).toLocaleString()}
              </span>
            </div>
            {pricing.promoActive && (
              <div className="flex justify-between text-emerald-400">
                <span>5% Launch Promo (20 Nov–15 Dec)</span>
                <span>
                  -{symbol}
                  {(currency === "BDT"
                    ? pricing.promoDiscountBDT || 0
                    : pricing.promoDiscountUSD || 0
                  ).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#D9BD81] pt-2 border-t border-[#232528]">
              <span>
                {pricing.quoteRequired ? "Estimated Reference" : "Approved Total"}
              </span>
              <span>
                {symbol}
                {(currency === "BDT"
                  ? pricing.finalBDT
                  : pricing.finalUSD
                ).toLocaleString()}
              </span>
            </div>
            {pricing.quoteRequired && (
              <p className="text-[10px] text-amber-300/90 pt-1">
                Quote confirmation required before payment checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

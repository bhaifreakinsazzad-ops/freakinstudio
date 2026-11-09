"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  Service,
  ServiceCategory,
  AddOn,
  Currency,
  MarketType,
  PackageObjective,
  ServiceConfig,
  PricingSummary,
  PackageDraft,
} from "@/types/domain";
import { getServiceConfigSchema, getAddOnFamily } from "@/lib/catalog";
import { calculatePricingSummary } from "@/lib/pricing/engine";
import {
  saveLocalDraft,
  getLocalDraft,
} from "@/lib/builder/draft-storage";
import {
  saveDraftAction,
  requestQuoteAction,
  createOrderFromBuilderAction,
  deleteDraftAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PackageBuilderClientProps {
  categories: ServiceCategory[];
  services: Service[];
  addOns: AddOn[];
  serviceAddOnsMap?: Record<string, AddOn[]>;
  initialDrafts?: PackageDraft[];
  initialServiceId?: string;
  isAuthenticated: boolean;
}

export function PackageBuilderClient({
  categories,
  services,
  addOns,
  serviceAddOnsMap,
  initialDrafts = [],
  initialServiceId,
  isAuthenticated,
}: PackageBuilderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Current Step (1 - 7)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftId] = useState<string>(() => {
    const existing = getLocalDraft();
    return existing?.id || `DRAFT-${Date.now()}`;
  });
  const [savedDrafts, setSavedDrafts] = useState<PackageDraft[]>(initialDrafts);

  const handleLoadDraft = (d: PackageDraft) => {
    if (d.objective) setObjective(d.objective);
    if (d.services && d.services.length > 0) setSelectedServices(d.services);
    if (d.serviceConfigs) setServiceConfigs(d.serviceConfigs);
    if (d.selectedAddOns) setSelectedAddOns(d.selectedAddOns);
    if (d.pricing?.currency) setCurrency(d.pricing.currency);
    toast.success("Loaded saved cloud draft: " + (d.objective?.goal ? d.objective.goal.slice(0, 30) : d.id));
  };

  const handleDeleteDraft = async (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
    await deleteDraftAction(id);
    toast.success("Draft removed from cloud storage");
  };

  // Step 1: Objective — initialized lazily from draft if present
  const [objective, setObjective] = useState<PackageObjective>(() => {
    const draft = getLocalDraft();
    if (draft?.objective) return draft.objective;
    return {
      goal: "Launch a new business / Brand launch",
      market: "BD",
      industry: "E-commerce & Retail",
      timeline: "Standard (3-7 Business Days)",
      notes: "",
    };
  });

  // Step 2: Selected Services — initialized lazily from draft if present
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    const draft = getLocalDraft();
    if (draft?.services && draft.services.length > 0) return draft.services;
    if (initialServiceId) return [initialServiceId.toUpperCase()];
    return ["A01"];
  });

  // Category filter & search for Step 2
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Step 3: Service Configs — initialized lazily from draft if present
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, ServiceConfig>>(() => {
    const draft = getLocalDraft();
    if (draft?.serviceConfigs && Object.keys(draft.serviceConfigs).length > 0) {
      return draft.serviceConfigs;
    }
    const initConfigs: Record<string, ServiceConfig> = {};
    const initList = initialServiceId ? [initialServiceId.toUpperCase()] : ["A01"];
    initList.forEach((id) => {
      const schema = getServiceConfigSchema(id);
      initConfigs[id] = {
        quantity: schema.defaultQuantity,
        format: schema.defaultFormat,
        rush: false,
      };
    });
    return initConfigs;
  });

  // Step 4: Selected Add-ons (serviceId -> addOnIds[])
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, string[]>>(() => {
    const draft = getLocalDraft();
    return draft?.selectedAddOns || {};
  });

  // Currency selection — derived or restored from draft
  const [currency, setCurrency] = useState<Currency>(() => {
    const draft = getLocalDraft();
    if (draft?.pricing?.currency) return draft.pricing.currency;
    return "BDT";
  });

  // Payment checkout modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutGateway, setCheckoutGateway] = useState<"sslcommerz" | "stripe">("sslcommerz");
  const [checkoutPhase, setCheckoutPhase] = useState<"select" | "redirecting" | "verifying" | "success">("select");
  const [settlementChannel, setSettlementChannel] = useState<string>("bKash");
  const [completedOrderData, setCompletedOrderData] = useState<{
    orderRef: string;
    txId: string;
    orderId?: string;
  } | null>(null);

  // Service lookup map
  const serviceMap = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  // Live pricing summary
  const pricingSummary: PricingSummary = useMemo(() => {
    return calculatePricingSummary({
      serviceIds: selectedServices,
      serviceConfigs,
      selectedAddOns,
      currency,
      catalogServices: services,
      catalogAddOns: addOns,
    });
  }, [selectedServices, serviceConfigs, selectedAddOns, currency, services, addOns]);

  // Current draft representation
  const currentDraft: PackageDraft = useMemo(() => {
    return {
      id: draftId,
      savedAt: new Date().toISOString(),
      objective,
      services: selectedServices,
      serviceConfigs,
      selectedAddOns,
      pricing: pricingSummary,
    };
  }, [draftId, objective, selectedServices, serviceConfigs, selectedAddOns, pricingSummary]);

  // Toggle service selection
  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      let nextServices: string[];
      if (prev.includes(id)) {
        if (prev.length === 1) {
          toast.error("Package must include at least one creative service.");
          return prev;
        }
        nextServices = prev.filter((s) => s !== id);
      } else {
        nextServices = [...prev, id];
        // Ensure config is present for newly added service
        if (!serviceConfigs[id]) {
          const schema = getServiceConfigSchema(id);
          setServiceConfigs((c) => ({
            ...c,
            [id]: {
              quantity: schema.defaultQuantity,
              format: schema.defaultFormat,
              rush: false,
            },
          }));
        }
      }
      return nextServices;
    });
  };

  // Toggle add-on for a service
  const toggleAddOn = (serviceId: string, addOnId: string) => {
    setSelectedAddOns((prev) => {
      const current = prev[serviceId] || [];
      const updated = current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId];
      return { ...prev, [serviceId]: updated };
    });
  };

  // Update specific service config
  const updateConfig = (
    serviceId: string,
    updates: Partial<ServiceConfig>
  ) => {
    setServiceConfigs((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], ...updates },
    }));
  };

  // Save draft action
  const handleSaveDraft = async () => {
    saveLocalDraft(currentDraft);
    startTransition(async () => {
      const res = await saveDraftAction(currentDraft);
      if (res.ok) {
        if (res.isGuest) {
          toast.success("Draft saved in browser memory! Sign in to sync across devices.");
        } else {
          toast.success("Package draft safely synced to your account database!");
        }
      } else {
        toast.error(res.error || "Failed to sync draft");
      }
    });
  };

  // Request quotation action
  const handleRequestQuote = async () => {
    startTransition(async () => {
      const res = await requestQuoteAction(currentDraft);
      if (res.ok) {
        toast.success(`Formal Quotation Request ${res.quoteRef} lodged with Studio Operations!`);
        router.push("/dashboard");
      } else if (res.requiresAuth) {
        toast.error(res.message, {
          action: {
            label: "Sign In",
            onClick: () => router.push("/login?next=/builder"),
          },
        });
      } else {
        toast.error(res.error || "Failed to lodge quote request.");
      }
    });
  };

  // Initiate checkout flow
  const handleStartCheckout = (gateway: "sslcommerz" | "stripe") => {
    if (!isAuthenticated) {
      toast.error("Please sign in or create an account before launching checkout.", {
        action: {
          label: "Sign In",
          onClick: () => router.push("/login?next=/builder"),
        },
      });
      return;
    }
    setCheckoutGateway(gateway);
    setCheckoutPhase("select");
    setIsCheckoutModalOpen(true);
  };

  // Execute verified simulated checkout adapter
  const handleConfirmCheckoutPayment = () => {
    setCheckoutPhase("redirecting");

    setTimeout(() => {
      setCheckoutPhase("verifying");

      setTimeout(async () => {
        const res = await createOrderFromBuilderAction(currentDraft, checkoutGateway);
        if (res.ok && res.orderRef && res.txId) {
          if (res.redirectUrl && !res.redirectUrl.includes("simulated=true")) {
            window.location.href = res.redirectUrl;
            return;
          }
          setCheckoutPhase("success");
          setCompletedOrderData({
            orderRef: res.orderRef,
            txId: res.txId,
            orderId: res.orderId,
          });
          toast.success(`Order ${res.orderRef} confirmed! Project workspace initialized.`);
        } else {
          toast.error(res.error || "Payment verification failed.");
          setCheckoutPhase("select");
        }
      }, 1500);
    }, 1200);
  };

  // Filtered services for Step 2
  const step2Services = useMemo(() => {
    return services.filter((s) => {
      const matchCat = activeCategory === "ALL" || s.category_id === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.title_bn && s.title_bn.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Step Navigation Progress Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="badge-mono text-brand-highlight px-2 py-0.5 rounded bg-brand-highlight/10 font-bold">
              STEP {currentStep} OF 7
            </span>
            <span className="text-xs font-mono text-brand-light font-semibold">
              {currentStep === 1 && "Campaign & Commercial Objective"}
              {currentStep === 2 && `Select Canonical Services (${selectedServices.length} Selected)`}
              {currentStep === 3 && "Configure Quantities & Format Scope"}
              {currentStep === 4 && "Select Specialized Add-ons"}
              {currentStep === 5 && "Live Scope Audit & Snapshot"}
              {currentStep === 6 && "Server-Authoritative Pricing"}
              {currentStep === 7 && "Verified Launch & Checkout"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isPending}
              className="text-xs font-mono h-8 border-brand-border"
            >
              Save Draft
            </Button>
            <div className="flex items-center rounded-lg border border-brand-border bg-brand-surface p-0.5">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                  currency === "BDT"
                    ? "bg-brand-card text-brand-light"
                    : "text-brand-muted hover:text-brand-light"
                }`}
              >
                ৳ BDT
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                  currency === "USD"
                    ? "bg-brand-card text-brand-light"
                    : "text-brand-muted hover:text-brand-light"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        {/* 7-Segment Progress Track */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => {
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(step)}
                className={`h-2 rounded-full transition-all ${
                  isActive
                    ? "bg-brand-highlight shadow-md ring-2 ring-brand-highlight/40"
                    : isCompleted
                    ? "bg-brand-success/80"
                    : "bg-brand-border/60 hover:bg-brand-border"
                }`}
                title={`Jump to Step ${step}`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {savedDrafts.length > 0 && currentStep === 1 && (
            <div className="p-4 rounded-2xl bg-brand-surface/90 border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-brand-highlight border-brand-highlight/30 font-mono">
                  Saved Cloud Drafts ({savedDrafts.length})
                </Badge>
                <span className="text-brand-muted font-mono text-[11px]">
                  Resume a configured package from your account.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {savedDrafts.map((d) => (
                  <div key={d.id} className="flex items-center gap-1.5 bg-brand-black px-2.5 py-1 rounded-lg border border-brand-border">
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(d)}
                      className="text-[11px] font-mono text-brand-light hover:text-brand-highlight font-bold"
                    >
                      {d.objective?.goal ? d.objective.goal.slice(0, 24) + "..." : d.id}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(d.id)}
                      className="text-brand-muted hover:text-red-400 text-[10px] ml-1"
                      title="Delete draft"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: CAMPAIGN OBJECTIVE */}
          {currentStep === 1 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  1. Define Campaign & Commercial Objective
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Specify your primary goal, target market and operational industry to tailor service recommendations.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-mono text-brand-muted block mb-2 uppercase text-[11px]">
                    Primary Commercial Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      "Launch a new business / Brand launch",
                      "Build brand identity & guidelines",
                      "Create high-volume social media content",
                      "Produce commercial video/motion assets",
                      "Prepare corporate pitch deck & company profile",
                      "Enterprise Rebranding & Re-positioning",
                      "Advertising campaign visual suite",
                      "AI-assisted creative workflow transformation",
                    ].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setObjective({ ...objective, goal })}
                        className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                          objective.goal === goal
                            ? "bg-brand-light text-brand-black border-white font-bold shadow-md"
                            : "bg-brand-surface border-brand-border text-brand-light hover:border-brand-highlight/40"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-mono text-brand-muted block mb-1.5 uppercase text-[11px]">
                      Target Market & Payment Rail
                    </label>
                    <select
                      value={objective.market}
                      onChange={(e) => {
                        const m = e.target.value as MarketType;
                        setObjective((prev) => ({ ...prev, market: m }));
                        setCurrency(m === "BD" ? "BDT" : "USD");
                      }}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-mono text-brand-light focus:outline-none"
                    >
                      <option value="BD">Bangladesh (BDT — bKash / Nagad / Local Cards)</option>
                      <option value="US">United States (USD — International Visa / Mastercard)</option>
                      <option value="Global">Global / International (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-brand-muted block mb-1.5 uppercase text-[11px]">
                      Industry Sector
                    </label>
                    <select
                      value={objective.industry}
                      onChange={(e) =>
                        setObjective({ ...objective, industry: e.target.value })
                      }
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-mono text-brand-light focus:outline-none"
                    >
                      <option value="E-commerce & Retail">E-commerce & Retail</option>
                      <option value="Tech / SaaS / Startups">Tech / SaaS / Startups</option>
                      <option value="Corporate & Financial">Corporate & Financial</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Personal Brand & Influencer">Personal Brand & Influencer</option>
                      <option value="Real Estate & Hospitality">Real Estate & Hospitality</option>
                      <option value="Fashion, Beauty & Lifestyle">Fashion, Beauty & Lifestyle</option>
                      <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                      <option value="Other">Other / Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-brand-muted block mb-1.5 uppercase text-[11px]">
                    Special Operational Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any specific campaign requirements, target launch dates, or reference briefs..."
                    value={objective.notes}
                    onChange={(e) =>
                      setObjective({ ...objective, notes: e.target.value })
                    }
                    className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-xs font-mono text-brand-light placeholder:text-brand-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-border">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Proceed to Service Selection &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT SERVICES */}
          {currentStep === 2 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-brand-light tracking-tight">
                    2. Select Canonical Services ({selectedServices.length} Selected)
                  </h2>
                  <p className="text-xs text-brand-muted mt-1 font-mono">
                    Multi-select creative disciplines from the authoritative 60-service catalog.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Input
                    type="text"
                    placeholder="Search canonical catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-brand-surface border-brand-border text-brand-light text-xs font-mono h-9"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 cyber-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveCategory("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    activeCategory === "ALL"
                      ? "bg-brand-light text-brand-black font-bold"
                      : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-light"
                  }`}
                >
                  ALL (60)
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                      activeCategory === c.id
                        ? "bg-brand-light text-brand-black font-bold"
                        : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-light"
                    }`}
                  >
                    {c.id}
                  </button>
                ))}
              </div>

              {/* Services Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto cyber-scrollbar pr-1">
                {step2Services.map((srv) => {
                  const isSelected = selectedServices.includes(srv.id);
                  const isQuoteReq = srv.pricing_status === "quote_required";
                  const priceStr =
                    currency === "BDT"
                      ? `৳ ${Number(srv.base_bdt).toLocaleString()}`
                      : `$ ${Number(srv.base_usd).toLocaleString()}`;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleService(srv.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-brand-highlight/10 border-brand-highlight shadow-sm"
                          : "bg-brand-surface border-brand-border hover:border-brand-border/80"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="badge-mono text-brand-highlight font-bold text-xs">
                            {srv.id}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-brand-highlight text-white border-brand-highlight"
                                : "border-brand-border"
                            }`}
                          >
                            {isSelected && "✓"}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-brand-light">
                          {srv.title}
                        </h4>
                        {srv.title_bn && (
                          <p className="text-[11px] text-brand-muted font-serif">
                            {srv.title_bn}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-brand-light font-bold">{priceStr}</span>
                        <span
                          className={`text-[10px] ${
                            isQuoteReq ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {isQuoteReq ? "Quote Req" : `${srv.days}d turnaround`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={selectedServices.length === 0}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Configure Quantities ({selectedServices.length}) &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE SCOPE */}
          {currentStep === 3 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  3. Configure Quantities & Deliverable Sizing
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Tailor deliverable volume, primary aspect ratios and priority turnaround for each selected service.
                </p>
              </div>

              <div className="space-y-5">
                {selectedServices.map((sid) => {
                  const srv = serviceMap.get(sid);
                  if (!srv) return null;
                  const cfg = serviceConfigs[sid] || {
                    quantity: 1,
                    format: "Standard",
                    rush: false,
                  };
                  const schema = getServiceConfigSchema(sid);

                  return (
                    <div
                      key={sid}
                      className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="badge-mono text-brand-highlight font-bold text-xs">
                            {sid}
                          </span>
                          <h4 className="font-semibold text-sm text-brand-light">
                            {srv.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-brand-muted">
                          Base:{" "}
                          {currency === "BDT"
                            ? `৳ ${Number(srv.base_bdt).toLocaleString()}`
                            : `$ ${Number(srv.base_usd)}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                        {/* Quantity Stepper */}
                        <div>
                          <label className="block text-brand-muted text-[11px] uppercase mb-1">
                            {schema.quantityLabel}
                          </label>
                          <div className="flex items-center border border-brand-border rounded-xl bg-brand-black/60 overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                updateConfig(sid, {
                                  quantity: Math.max(
                                    schema.minQuantity,
                                    cfg.quantity - 1
                                  ),
                                })
                              }
                              className="px-3 py-2 text-brand-muted hover:text-brand-light hover:bg-brand-surface transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={schema.minQuantity}
                              max={schema.maxQuantity}
                              value={cfg.quantity}
                              onChange={(e) =>
                                updateConfig(sid, {
                                  quantity: Math.max(
                                    schema.minQuantity,
                                    Math.min(
                                      schema.maxQuantity,
                                      parseInt(e.target.value, 10) || 1
                                    )
                                  ),
                                })
                              }
                              className="w-full text-center bg-transparent text-brand-light font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateConfig(sid, {
                                  quantity: Math.min(
                                    schema.maxQuantity,
                                    cfg.quantity + 1
                                  ),
                                })
                              }
                              className="px-3 py-2 text-brand-muted hover:text-brand-light hover:bg-brand-surface transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Format selector */}
                        <div>
                          <label className="block text-brand-muted text-[11px] uppercase mb-1">
                            Deliverable Format / Sizing
                          </label>
                          <select
                            value={cfg.format}
                            onChange={(e) =>
                              updateConfig(sid, { format: e.target.value })
                            }
                            className="w-full bg-brand-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs font-mono text-brand-light focus:outline-none"
                          >
                            {schema.formatOptions.map((fmt) => (
                              <option key={fmt} value={fmt}>
                                {fmt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rush toggle */}
                        <div>
                          <label className="block text-brand-muted text-[11px] uppercase mb-1">
                            Turnaround Priority
                          </label>
                          <label className="flex items-center gap-2 p-2 rounded-xl border border-brand-border bg-brand-black/40 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!cfg.rush}
                              onChange={(e) =>
                                updateConfig(sid, { rush: e.target.checked })
                              }
                              className="rounded border-brand-border text-brand-highlight focus:ring-0"
                            />
                            <span className="text-[11px] text-brand-light font-medium">
                              Rush (×1.35 — 50% faster)
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Proceed to Add-ons &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SPECIALIZED ADD-ONS */}
          {currentStep === 4 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  4. Select Specialized Service Add-ons
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Enrich your production package with editable source files, extra localization, or multi-platform cutdowns (+{currency === "BDT" ? "৳ 3,000" : "$ 25"} each).
                </p>
              </div>

              <div className="space-y-6">
                {selectedServices.map((sid) => {
                  const srv = serviceMap.get(sid);
                  if (!srv) return null;
                  const currentSelected = selectedAddOns[sid] || [];
                  const serviceMappedAddOns = (serviceAddOnsMap && serviceAddOnsMap[sid]) || [];
                  const relatedAddOns = serviceMappedAddOns.length > 0 ? serviceMappedAddOns : addOns.slice(0, 6);

                  return (
                    <div
                      key={sid}
                      className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                        <span className="text-xs font-mono font-bold text-brand-light">
                          {sid} — {srv.title}
                        </span>
                        <span className="text-[11px] font-mono text-brand-muted">
                          {currentSelected.length} Add-on(s) Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {relatedAddOns.map((addon) => {
                          const isChecked = currentSelected.includes(addon.id);
                          return (
                            <div
                              key={addon.id}
                              onClick={() => toggleAddOn(sid, addon.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                                isChecked
                                  ? "bg-brand-highlight/15 border-brand-highlight font-semibold"
                                  : "bg-brand-black/50 border-brand-border text-brand-muted hover:text-brand-light"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                                    isChecked
                                      ? "bg-brand-highlight text-white border-brand-highlight"
                                      : "border-brand-border"
                                  }`}
                                >
                                  {isChecked && "✓"}
                                </span>
                                <div className="flex flex-col text-left">
                                  <span className="text-brand-light font-mono text-[11px]">
                                    {addon.label}
                                  </span>
                                  <span className="text-[9px] font-mono text-brand-muted/70">
                                    {getAddOnFamily(addon.label)}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-brand-highlight font-bold">
                                +{currency === "BDT" ? "৳ 3,000" : "$ 25"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Review Scope Audit &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SCOPE AUDIT & SNAPSHOT */}
          {currentStep === 5 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  5. Live Scope Audit & Deliverables Snapshot
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Inspect assembled parameters, included revisions and deliverable terms prior to authoritative calculation.
                </p>
              </div>

              <div className="border border-brand-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Service Code</th>
                      <th className="p-3">Service Title</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Format</th>
                      <th className="p-3">Rush</th>
                      <th className="p-3">Turnaround</th>
                      <th className="p-3">Revisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {selectedServices.map((sid) => {
                      const srv = serviceMap.get(sid);
                      const cfg = serviceConfigs[sid] || { quantity: 1, rush: false };
                      return (
                        <tr key={sid} className="hover:bg-brand-surface/40">
                          <td className="p-3 font-bold text-brand-highlight">
                            {sid}
                          </td>
                          <td className="p-3 text-brand-light font-sans font-medium">
                            {srv?.title}
                          </td>
                          <td className="p-3 text-brand-light">{cfg.quantity}</td>
                          <td className="p-3 text-brand-muted text-[11px]">
                            {cfg.format || "Standard"}
                          </td>
                          <td className="p-3">
                            {cfg.rush ? (
                              <span className="text-amber-400 font-bold">YES (×1.35)</span>
                            ) : (
                              <span className="text-brand-muted">Standard</span>
                            )}
                          </td>
                          <td className="p-3 text-brand-light">
                            {cfg.rush ? Math.max(1, Math.ceil((srv?.days || 2) * 0.5)) : srv?.days}d
                          </td>
                          <td className="p-3 text-brand-light">
                            {srv?.revisions} Rounds
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted space-y-2">
                <span className="font-bold text-brand-light font-mono block">
                  Production & Licensing Safeguards:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Included revision quotas are strictly bounded per service to ensure schedule integrity.</li>
                  <li>Full commercial usage rights granted upon verified settlement.</li>
                  <li>Real asset archives (.ZIP) generated upon final client review and sign-off.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(4)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(6)}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Calculate Authoritative Pricing &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: PRICING & QUOTATION */}
          {currentStep === 6 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  6. Server-Authoritative Quotation & Pricing
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Calculated deterministically via studio commercial rules.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted">Scope Subtotal:</span>
                  <span className="text-brand-light font-bold">
                    {currency === "BDT"
                      ? `৳ ${pricingSummary.subtotalBDT.toLocaleString()}`
                      : `$ ${pricingSummary.subtotalUSD.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted">Rush Delivery Surcharges:</span>
                  <span className="text-amber-400 font-bold">
                    {pricingSummary.rushSurchargeBDT > 0 || pricingSummary.rushSurchargeUSD > 0
                      ? currency === "BDT"
                        ? `+৳ ${pricingSummary.rushSurchargeBDT.toLocaleString()}`
                        : `+$ ${pricingSummary.rushSurchargeUSD.toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted">Specialized Add-ons Total:</span>
                  <span className="text-brand-highlight font-bold">
                    {pricingSummary.addOnsTotalBDT > 0 || pricingSummary.addOnsTotalUSD > 0
                      ? currency === "BDT"
                        ? `+৳ ${pricingSummary.addOnsTotalBDT.toLocaleString()}`
                        : `+$ ${pricingSummary.addOnsTotalUSD.toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                <div className="pt-4 border-t border-brand-border flex justify-between items-baseline text-base">
                  <span className="font-bold text-brand-light">Total Investment:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {currency === "BDT"
                      ? `৳ ${pricingSummary.finalBDT.toLocaleString()}`
                      : `$ ${pricingSummary.finalUSD.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Quotation Required Notice */}
              {pricingSummary.quoteRequired && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Formal Studio Quotation Required
                  </div>
                  <p className="text-brand-muted text-[11px]">
                    This package requires formal quotation desk review due to commercial governance policies:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-300/90 text-[11px]">
                    {pricingSummary.quoteReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(5)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(7)}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs px-6"
                >
                  Proceed to Launch Action &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: VERIFIED CHECKOUT OR QUOTE LODGING */}
          {currentStep === 7 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border space-y-6">
              <div>
                <h2 className="text-xl font-black text-brand-light tracking-tight">
                  7. Verified Launch, Quotation or Checkout
                </h2>
                <p className="text-xs text-brand-muted mt-1 font-mono">
                  Confirm your delivery terms, lodge formal review, or launch via verified sandbox payment adapters.
                </p>
              </div>

              {pricingSummary.quoteRequired ? (
                <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-brand-light font-mono">
                      Request Formal Studio Quotation
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Your assembled package will be directly submitted to Studio Operations. An approved formal quote with commercial milestones and timeline guarantees will be issued to your portal within 24 hours.
                    </p>
                  </div>

                  <Button
                    onClick={handleRequestQuote}
                    disabled={isPending}
                    className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-sm py-6"
                  >
                    {isPending ? "Lodging Quotation..." : "Lodge Formal Quotation Request"}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SSLCOMMERZ Hosted Card */}
                  <div
                    onClick={() => handleStartCheckout("sslcommerz")}
                    className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-highlight/60 cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        SSLCOMMERZ Hosted
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono text-brand-muted">
                        BD Local Rails
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-muted">
                      Settle via bKash, Nagad, Rocket, DBBL Nexus or local Visa/Mastercard cards.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-mono group-hover:bg-brand-highlight group-hover:text-white group-hover:border-transparent transition-all"
                    >
                      Checkout with SSLCOMMERZ
                    </Button>
                  </div>

                  {/* Stripe Hosted Card */}
                  <div
                    onClick={() => handleStartCheckout("stripe")}
                    className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-highlight/60 cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-brand-highlight">
                        Stripe International
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono text-brand-muted">
                        USD Global
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-muted">
                      Settle via International Credit Card (Visa, MasterCard, Amex) in USD.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-mono group-hover:bg-brand-highlight group-hover:text-white group-hover:border-transparent transition-all"
                    >
                      Checkout with Stripe
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(6)}
                  className="font-mono text-xs"
                >
                  &larr; Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveDraft}
                  className="font-mono text-xs text-brand-muted hover:text-brand-light"
                >
                  Save Draft for Later
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-5 sticky top-24 cyber-glow">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <span className="text-xs font-mono uppercase text-brand-muted">
                Package Scope
              </span>
              <span className="badge-mono text-brand-highlight text-[11px] font-bold">
                {selectedServices.length} Service(s)
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-brand-muted block uppercase">
                Selected Disciplines
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto cyber-scrollbar pr-1">
                {selectedServices.map((sid) => {
                  const srv = serviceMap.get(sid);
                  const cfg = serviceConfigs[sid];
                  return (
                    <div
                      key={sid}
                      className="p-2.5 rounded-xl bg-brand-surface/70 border border-brand-border text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-brand-highlight mr-2 text-[11px]">
                          {sid}
                        </span>
                        <span className="text-brand-light text-xs font-medium">
                          {srv?.title}
                        </span>
                        <span className="block text-[10px] text-brand-muted font-mono">
                          Qty: {cfg?.quantity || 1} {cfg?.rush ? "• RUSH" : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleService(sid)}
                        className="text-brand-muted hover:text-brand-danger text-xs font-mono ml-2"
                        title="Remove service"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-brand-border/60 border-t border-b border-brand-border/60 py-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-brand-muted">Gross Scope:</span>
                <span className="text-brand-light font-semibold">
                  {currency === "BDT"
                    ? `৳ ${pricingSummary.subtotalBDT.toLocaleString()}`
                    : `$ ${pricingSummary.subtotalUSD.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-brand-muted">Rush Surcharges:</span>
                <span className="text-brand-light font-semibold">
                  {pricingSummary.rushSurchargeBDT > 0 || pricingSummary.rushSurchargeUSD > 0
                    ? currency === "BDT"
                      ? `+৳ ${pricingSummary.rushSurchargeBDT.toLocaleString()}`
                      : `+$ ${pricingSummary.rushSurchargeUSD.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-brand-muted">Add-ons:</span>
                <span className="text-brand-light font-semibold">
                  {pricingSummary.addOnsTotalBDT > 0 || pricingSummary.addOnsTotalUSD > 0
                    ? currency === "BDT"
                      ? `+৳ ${pricingSummary.addOnsTotalBDT.toLocaleString()}`
                      : `+$ ${pricingSummary.addOnsTotalUSD.toLocaleString()}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xs text-brand-muted uppercase">Final Total</span>
              <span className="text-2xl font-black text-emerald-400">
                {currency === "BDT"
                  ? `৳ ${pricingSummary.finalBDT.toLocaleString()}`
                  : `$ ${pricingSummary.finalUSD.toLocaleString()}`}
              </span>
            </div>

            {pricingSummary.quoteRequired ? (
              <Badge
                variant="outline"
                className="w-full justify-center py-1 font-mono text-[11px] border-amber-500/40 text-amber-400 bg-amber-500/10"
              >
                Quote Desk Review Required
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="w-full justify-center py-1 font-mono text-[11px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
              >
                Instant Launch Eligible
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Verified Hosted Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-brand-border shadow-2xl space-y-6 cyber-glow">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm text-brand-light font-mono uppercase">
                  {checkoutGateway.toUpperCase()} Hosted Checkout Adapter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-brand-muted hover:text-brand-light text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {checkoutPhase === "select" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex justify-between items-baseline">
                  <span className="text-brand-muted">Total Scope Investment:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {currency === "BDT"
                      ? `৳ ${pricingSummary.finalBDT.toLocaleString()}`
                      : `$ ${pricingSummary.finalUSD.toLocaleString()}`}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-brand-muted uppercase text-[10px] block">
                    Settlement Payment Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["bKash", "Nagad", "Rocket", "DBBL Card", "Visa", "Mastercard"].map(
                      (ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setSettlementChannel(ch)}
                          className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all ${
                            settlementChannel === ch
                              ? "bg-brand-light text-brand-black border-white"
                              : "bg-brand-surface border-brand-border text-brand-muted hover:text-brand-light"
                          }`}
                        >
                          {ch}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-highlight/10 border border-brand-highlight/30 text-brand-highlight text-[11px] font-mono">
                  PCI-DSS Level 1 Hosted Architecture: No card or banking PINs are ever collected on Freakin&apos;s Studio servers.
                </div>

                <Button
                  onClick={handleConfirmCheckoutPayment}
                  className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-sm py-5"
                >
                  Launch Payment Simulation &rarr;
                </Button>
              </div>
            )}

            {checkoutPhase === "redirecting" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-brand-highlight border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-brand-light">
                  Initiating server-side session with {checkoutGateway.toUpperCase()}...
                </p>
              </div>
            )}

            {checkoutPhase === "verifying" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-emerald-400">
                  Verifying cryptographic webhook payload & transaction status...
                </p>
              </div>
            )}

            {checkoutPhase === "success" && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-base text-brand-light font-mono">
                    Payment Verified Successfully
                  </h4>
                  <p className="text-xs text-brand-muted font-mono mt-1">
                    Order Ref: {completedOrderData?.orderRef}
                  </p>
                  <p className="text-[11px] text-brand-muted font-mono">
                    Tx ID: {completedOrderData?.txId}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    router.push("/dashboard");
                  }}
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs w-full py-5"
                >
                  Enter Project Workspace & Complete Brief &rarr;
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

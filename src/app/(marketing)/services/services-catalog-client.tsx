"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { isLaunchPromoActive } from "@/lib/pricing/engine";
import {
  CANONICAL_HOURLY_RATE_BDT,
  CANONICAL_HOURLY_RATE_USD,
} from "@/lib/catalog";
import type {
  AddOn,
  CommercialBundle,
  Currency,
  Service,
  ServiceCategory,
  ServiceVariant,
} from "@/types/domain";

interface ServicesCatalogClientProps {
  categories: ServiceCategory[];
  services: Service[];
  variants: ServiceVariant[];
  bundles: CommercialBundle[];
  addOns: AddOn[];
  initialCategory: string;
  initialSearch: string;
}

export function ServicesCatalogClient({
  categories,
  services,
  variants,
  bundles,
  addOns,
  initialCategory,
  initialSearch,
}: ServicesCatalogClientProps) {
  const { locale, t } = useI18n();
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>(initialSearch);
  const [currency, setCurrency] = useState<Currency>("BDT");

  // Interactive Scope Estimator state
  const [activeServiceId, setActiveServiceId] = useState<string>(
    services[0]?.id || "SRV-01"
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>("BASE");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [testDateStr, setTestDateStr] = useState<string>("2026-11-25");

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat =
        selectedCat === "ALL" || s.category_id === selectedCat;
      const q = search.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          (s.title_bn && s.title_bn.toLowerCase().includes(q)) ||
          (s.summary && s.summary.toLowerCase().includes(q)))
      );
    });
  }, [services, selectedCat, search]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, ServiceCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const activeService = useMemo(
    () => services.find((s) => s.id === activeServiceId) || services[0],
    [services, activeServiceId]
  );

  const serviceVariants = useMemo(
    () => variants.filter((v) => v.serviceId === activeService?.id),
    [variants, activeService]
  );

  const compatibleAddons = useMemo(
    () =>
      addOns.filter((a) =>
        a.compatible_services?.includes(activeService?.id || "")
      ),
    [addOns, activeService]
  );

  const activeVariant = serviceVariants.find((v) => v.id === selectedVariantId);
  const baseHours = activeVariant
    ? activeVariant.estimatedHours
    : activeService?.estimated_hours || 4;
  const addonHours = compatibleAddons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + (a.extra_hours || 1), 0);
  const totalScopedHours = baseHours + addonHours;

  const hourlyRate =
    currency === "BDT" ? CANONICAL_HOURLY_RATE_BDT : CANONICAL_HOURLY_RATE_USD;
  const rawSubtotal = Math.round(totalScopedHours * hourlyRate);
  const promoActive = isLaunchPromoActive(testDateStr);
  const promoDiscount = promoActive ? Math.round(rawSubtotal * 0.05) : 0;
  const finalEstimated = rawSubtotal - promoDiscount;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12">
      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between rounded-xl border border-[#232528] bg-[#121315] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCat("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              selectedCat === "ALL"
                ? "bg-[#D9BD81] text-[#090A0A] font-semibold"
                : "bg-[#090A0A] text-[#F6F4EF]/70 hover:text-[#F6F4EF] border border-[#232528]"
            }`}
          >
            All 4 Disciplines ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter(
              (s) => s.category_id === cat.id
            ).length;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  selectedCat === cat.id
                    ? "bg-[#D9BD81] text-[#090A0A] font-semibold"
                    : "bg-[#090A0A] text-[#F6F4EF]/70 hover:text-[#F6F4EF] border border-[#232528]"
                }`}
              >
                {cat.code || cat.id} &middot;{" "}
                {locale === "bn" && cat.name_bn ? cat.name_bn : cat.name} (
                {count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="search"
            placeholder={t("catalog.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-[#090A0A] border-[#232528] text-xs font-mono h-9 text-[#F6F4EF]"
          />

          <div className="flex items-center rounded-md border border-[#232528] bg-[#090A0A] p-0.5 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => setCurrency("BDT")}
              className={`px-2.5 py-1 rounded ${
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
              className={`px-2.5 py-1 rounded ${
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

      {/* Main Split: 13 Service Grid + Live Hourly Scope & 5% Launch Promo Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 13 Canonical Services */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((srv) => {
            const cat = categoryMap.get(srv.category_id);
            const displayTitle =
              locale === "bn" && srv.title_bn ? srv.title_bn : srv.title;
            const price = currency === "BDT" ? srv.base_bdt : srv.base_usd;
            const symbol = currency === "BDT" ? "৳" : "$";
            const isSelected = activeService?.id === srv.id;

            return (
              <div
                key={srv.id}
                onClick={() => {
                  setActiveServiceId(srv.id);
                  setSelectedVariantId("BASE");
                  setSelectedAddonIds([]);
                }}
                className={`group flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#D9BD81] bg-[#232528]/70 shadow-lg"
                    : "border-[#232528] bg-[#121315] hover:border-[#D9BD81]/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#D9BD81] bg-[#D9BD81]/10 px-2 py-0.5 rounded border border-[#D9BD81]/30">
                      {srv.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {srv.express_eligible && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          10m Express Micro-Edit
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#F6F4EF]/65 bg-[#090A0A] px-2 py-0.5 rounded border border-[#232528]">
                        {srv.estimated_hours || 4}h Base
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-mono text-[#F6F4EF]/55">
                      {cat?.name}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[#F6F4EF] group-hover:text-[#D9BD81] transition-colors">
                      {displayTitle}
                    </h3>
                  </div>

                  {srv.summary && (
                    <p className="text-xs text-[#F6F4EF]/70 leading-relaxed line-clamp-2">
                      {srv.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-[#F6F4EF]/65 border-t border-[#232528]">
                    <div>
                      <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                        {t("catalog.turnaround")}
                      </span>
                      <span className="text-[#F6F4EF]">
                        {srv.days} {srv.days === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                        {t("catalog.revisions")}
                      </span>
                      <span className="text-[#F6F4EF]">
                        {srv.revisions} Consolidated
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#232528] flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-[#F6F4EF]/45">
                      {t("catalog.starting")}
                    </span>
                    <span className="text-lg font-bold font-mono text-[#D9BD81]">
                      {symbol}
                      {price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      render={<Link href={`/services/${srv.id}`}>Specs</Link>}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-mono h-8 px-2.5 text-[#F6F4EF]/70 hover:text-[#F6F4EF]"
                    />
                    <Button
                      render={
                        <Link href={`/builder?service=${srv.id}`}>
                          {t("catalog.configure")}
                        </Link>
                      }
                      size="sm"
                      className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono h-8"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Scoped Variant, 14 Add-on & 5% Launch Promo Calculator */}
        {activeService && (
          <div className="lg:col-span-5 rounded-2xl border border-[#D9BD81]/40 bg-[#121315] p-6 space-y-5 sticky top-20">
            <div className="flex items-start justify-between gap-3 border-b border-[#232528] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D9BD81]">
                  Live Scope &amp; Hourly Estimator ({activeService.id})
                </span>
                <h3 className="text-lg font-bold text-[#F6F4EF] mt-0.5">
                  {locale === "bn" && activeService.title_bn
                    ? activeService.title_bn
                    : activeService.title}
                </h3>
              </div>
              <span className="rounded bg-[#090A0A] border border-[#232528] px-2.5 py-1 font-mono text-xs text-[#D9BD81]">
                {totalScopedHours}h Total
              </span>
            </div>

            {/* Included / Excluded Boundaries */}
            {activeService.included && activeService.excluded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="font-mono text-[10px] uppercase text-emerald-300 block mb-1.5">
                    Included Deliverables
                  </span>
                  <ul className="space-y-1 text-[#F6F4EF]/85 text-[11px]">
                    {activeService.included.map((inc) => (
                      <li key={inc}>&bull; {inc}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <span className="font-mono text-[10px] uppercase text-amber-300 block mb-1.5">
                    Explicit Exclusions
                  </span>
                  <ul className="space-y-1 text-[#F6F4EF]/75 text-[11px]">
                    {activeService.excluded.map((exc) => (
                      <li key={exc}>&bull; {exc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 10-Min Express Rule Notice */}
            {activeService.express_eligible && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-200">
                <strong className="font-mono uppercase block text-[10px] text-emerald-300">
                  10-Minute Express Delivery Rule:
                </strong>
                {activeService.express_rule}
              </div>
            )}

            {/* Scoped Variants (15 Canonical Variants) */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#F6F4EF]/65">
                1. Scoped Service Variant ({serviceVariants.length} Available)
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedVariantId("BASE")}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
                    selectedVariantId === "BASE"
                      ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                      : "border-[#232528] bg-[#090A0A]/60 text-[#F6F4EF]/70"
                  }`}
                >
                  <span>Standard Base Scope</span>
                  <span className="font-mono text-[#D9BD81]">
                    {activeService.estimated_hours}h
                  </span>
                </button>
                {serviceVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
                      selectedVariantId === v.id
                        ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                        : "border-[#232528] bg-[#090A0A]/60 text-[#F6F4EF]/70"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[10px] text-[#D9BD81] mr-1.5">
                        {v.id}
                      </span>
                      <span className="font-medium">
                        {locale === "bn" ? v.titleBn : v.title}
                      </span>
                      <p className="text-[11px] text-[#F6F4EF]/55">
                        {v.scopeSummary}
                      </p>
                    </div>
                    <span className="font-mono text-[#D9BD81] shrink-0 ml-2">
                      {v.estimatedHours}h
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compatible Add-ons (from the 14 Canonical Add-ons) */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#F6F4EF]/65">
                2. Compatible Add-ons ({compatibleAddons.length} of 14 Canonical
                Add-ons)
              </label>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {compatibleAddons.map((addon) => {
                  const checked = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        checked
                          ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#F6F4EF]"
                          : "border-[#232528] bg-[#090A0A]/50 text-[#F6F4EF]/70 hover:border-[#F6F4EF]/30"
                      }`}
                    >
                      <div className="pr-2">
                        <span className="font-mono text-[10px] text-[#D9BD81] mr-1.5">
                          {addon.id}
                        </span>
                        <span>
                          {locale === "bn" && addon.label_bn
                            ? addon.label_bn
                            : addon.label}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#D9BD81] shrink-0">
                        +{addon.extra_hours}h
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5% Launch Promotion Window Date Tester */}
            <div className="rounded-xl border border-[#232528] bg-[#090A0A]/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="catalog-promo-date"
                  className="font-mono text-[10px] uppercase text-[#F6F4EF]/65"
                >
                  Promo Date Check (20 Nov &ndash; 15 Dec 2026)
                </label>
                <input
                  id="catalog-promo-date"
                  type="date"
                  value={testDateStr}
                  onChange={(e) => setTestDateStr(e.target.value)}
                  className="rounded border border-[#232528] bg-[#121315] px-2 py-1 font-mono text-xs text-[#F6F4EF]"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#F6F4EF]/65">Promo Status:</span>
                <span
                  className={
                    promoActive ? "text-emerald-400 font-bold" : "text-[#F6F4EF]/50"
                  }
                >
                  {promoActive
                    ? "ACTIVE (-5% Launch Discount Applied)"
                    : "INACTIVE (Standard Rate)"}
                </span>
              </div>
            </div>

            {/* Pricing Breakdown Ledger */}
            <div className="rounded-xl border border-[#D9BD81]/30 bg-[#090A0A] p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#F6F4EF]/70">
                <span>
                  Scoped Hours ({totalScopedHours}h &times;{" "}
                  {currency === "BDT" ? "৳1,500" : "$15"}/h)
                </span>
                <span>
                  {currency === "BDT" ? "৳" : "$"}
                  {rawSubtotal.toLocaleString()}
                </span>
              </div>
              {promoActive && (
                <div className="flex justify-between text-emerald-400">
                  <span>5% Launch Promo (Asia/Dhaka)</span>
                  <span>
                    -{currency === "BDT" ? "৳" : "$"}
                    {promoDiscount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#232528] pt-2.5 text-sm font-bold text-[#D9BD81]">
                <span>Estimated Scoped Total</span>
                <span>
                  {currency === "BDT" ? "৳" : "$"}
                  {finalEstimated.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              render={
                <Link href={`/builder?service=${activeService.id}`}>
                  Load {activeService.id} into Smart Brief Builder &rarr;
                </Link>
              }
              className="w-full cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs h-10"
            />
          </div>
        )}
      </div>

      {/* 5 Commercial Bundles Section */}
      <section className="space-y-4 pt-6 border-t border-[#232528]">
        <div>
          <span className="badge-mono text-[#D9BD81]">
            5 Approved Commercial Bundles (BND-01 to BND-05)
          </span>
          <h2 className="text-2xl font-bold text-[#F6F4EF] mt-1">
            Multi-Service Commercial Production Pods
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {bundles.map((bnd) => {
            const rawPrice =
              currency === "BDT" ? bnd.baseBdt : bnd.baseUsd;
            const discounted = promoActive
              ? Math.round(rawPrice * 0.95)
              : rawPrice;
            const symbol = currency === "BDT" ? "৳" : "$";

            return (
              <div
                key={bnd.id}
                className="rounded-xl border border-[#232528] bg-[#121315] p-5 flex flex-col justify-between space-y-4 hover:border-[#D9BD81]/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#D9BD81]">
                      {bnd.id}
                    </span>
                    <span className="font-mono text-[10px] text-[#F6F4EF]/65 bg-[#090A0A] px-2 py-0.5 rounded border border-[#232528]">
                      {bnd.estimatedHours}h &bull; {bnd.turnaroundDays}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F6F4EF]">
                    {locale === "bn" ? bnd.titleBn : bnd.title}
                  </h3>
                  <p className="text-xs text-[#F6F4EF]/70 leading-relaxed">
                    {bnd.summary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bnd.includedServiceIds.map((sid) => (
                      <span
                        key={sid}
                        className="rounded bg-[#090A0A] border border-[#232528] px-1.5 py-0.5 font-mono text-[10px] text-[#D9BD81]"
                      >
                        {sid}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#232528] space-y-2">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-[#F6F4EF]/55">
                      {promoActive ? "5% Promo Rate" : "Scoped Rate"}
                    </span>
                    <span className="text-base font-bold text-[#D9BD81]">
                      {symbol}
                      {discounted.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    render={
                      <Link
                        href={`/builder?service=${bnd.includedServiceIds[0]}&bundle=${bnd.id}`}
                      >
                        Select Bundle &rarr;
                      </Link>
                    }
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs font-mono border-[#D9BD81]/40 text-[#D9BD81]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

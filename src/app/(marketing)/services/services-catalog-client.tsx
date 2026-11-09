"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import type { Service, ServiceCategory, Currency } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServicesCatalogClientProps {
  initialCategories: ServiceCategory[];
  initialServices: Service[];
}

export function ServicesCatalogClient({
  initialCategories,
  initialServices,
}: ServicesCatalogClientProps) {
  const { locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [sortBy, setSortBy] = useState<"id" | "price-asc" | "price-desc" | "days">("id");

  const filteredServices = useMemo(() => {
    return initialServices
      .filter((s) => {
        const matchesCategory =
          activeCategory === "ALL" || s.category_id === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          (s.title_bn && s.title_bn.toLowerCase().includes(q));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          const priceA = currency === "BDT" ? Number(a.base_bdt) : Number(a.base_usd);
          const priceB = currency === "BDT" ? Number(b.base_bdt) : Number(b.base_usd);
          return priceA - priceB;
        }
        if (sortBy === "price-desc") {
          const priceA = currency === "BDT" ? Number(a.base_bdt) : Number(a.base_usd);
          const priceB = currency === "BDT" ? Number(b.base_bdt) : Number(b.base_usd);
          return priceB - priceA;
        }
        if (sortBy === "days") {
          return a.days - b.days;
        }
        return a.id.localeCompare(b.id);
      });
  }, [initialServices, activeCategory, searchQuery, sortBy, currency]);

  return (
    <div className="space-y-8">
      {/* Search, Filter & Controls Toolbar */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by code (e.g. A01), name or বাংলা..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-brand-surface/80 border-brand-border text-brand-light placeholder:text-brand-muted text-xs font-mono h-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-brand-muted hover:text-brand-light font-mono"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="flex items-center rounded-lg border border-brand-border bg-brand-surface p-1">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  currency === "BDT"
                    ? "bg-brand-card text-brand-light shadow-sm"
                    : "text-brand-muted hover:text-brand-light"
                }`}
              >
                ৳ BDT
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  currency === "USD"
                    ? "bg-brand-card text-brand-light shadow-sm"
                    : "text-brand-muted hover:text-brand-light"
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "id" | "price-asc" | "price-desc" | "days"
                )
              }
              className="bg-brand-surface border border-brand-border text-brand-muted rounded-lg px-3 py-1.5 text-xs font-mono focus:text-brand-light focus:outline-none"
            >
              <option value="id">Sort: Code (Default)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="days">Speed: Fastest Turnaround</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 cyber-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
              activeCategory === "ALL"
                ? "bg-brand-light text-brand-black font-bold shadow-md"
                : "bg-brand-surface/70 border border-brand-border text-brand-muted hover:text-brand-light"
            }`}
          >
            ALL (60)
          </button>
          {initialCategories.map((cat) => {
            const count = initialServices.filter((s) => s.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-brand-light text-brand-black font-bold shadow-md"
                    : "bg-brand-surface/70 border border-brand-border text-brand-muted hover:text-brand-light"
                }`}
              >
                {cat.id}: {locale === "bn" && cat.name_bn ? cat.name_bn : cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs font-mono text-brand-muted">
        <span>
          Showing <strong className="text-brand-light">{filteredServices.length}</strong> of{" "}
          {initialServices.length} canonical services
        </span>
        {activeCategory !== "ALL" && (
          <button
            onClick={() => setActiveCategory("ALL")}
            className="text-brand-highlight hover:underline"
          >
            Reset category filter
          </button>
        )}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-brand-border space-y-3">
          <p className="text-brand-muted font-mono text-sm">
            No creative services matched your query &ldquo;{searchQuery}&rdquo;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("ALL");
            }}
            className="font-mono text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const isQuoteRequired = service.pricing_status === "quote_required";
            const priceDisplay =
              currency === "BDT"
                ? `৳ ${Number(service.base_bdt).toLocaleString()}`
                : `$ ${Number(service.base_usd).toLocaleString()}`;

            return (
              <div
                key={service.id}
                className="glass-card p-5 rounded-2xl border border-brand-border hover:border-brand-highlight/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-mono text-brand-highlight px-2 py-0.5 rounded bg-brand-highlight/10 border border-brand-highlight/20 font-bold">
                      {service.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        isQuoteRequired
                          ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      }`}
                    >
                      {isQuoteRequired ? "Quote Required" : "Instant Pricing"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-brand-light text-base group-hover:text-brand-highlight transition-colors">
                      {service.title}
                    </h3>
                    {service.title_bn && (
                      <p className="text-xs text-brand-muted font-serif mt-0.5">
                        {service.title_bn}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-border/60 text-[11px] font-mono text-brand-muted">
                    <div>
                      <span className="block text-[10px] uppercase text-brand-muted/70">
                        Turnaround
                      </span>
                      <span className="text-brand-light font-medium">
                        {service.days} Business Days
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-brand-muted/70">
                        Included
                      </span>
                      <span className="text-brand-light font-medium">
                        {service.revisions} Revisions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-brand-border flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-brand-muted">
                      Starting Investment
                    </span>
                    <span className="text-lg font-bold font-mono text-brand-light">
                      {priceDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      render={<Link href={`/services/${service.id}`}>Details</Link>}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-mono h-8 px-2.5 text-brand-muted hover:text-brand-light"
                    />
                    <Button
                      render={
                        <Link href={`/builder?service=${service.id}`}>Add to Scope</Link>
                      }
                      size="sm"
                      className="text-xs font-mono h-8 px-3 cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  getServiceById,
  getCatalogServices,
  getServiceConfigSchema,
  getAddOnFamily,
} from "@/lib/catalog";

export const instant = false;

export async function generateStaticParams() {
  const services = await getCatalogServices();
  return services.map((service) => ({ id: service.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    return { title: "Service Not Found — Freakin's Studio" };
  }

  return {
    title: `${service.id} · ${service.title} — Freakin's Studio`,
    description:
      service.summary ||
      `Configure ${service.title} (${service.id}) at Freakin's Studio. Hourly scoped production (${service.estimated_hours || 4}h base), ${service.days}-day turnaround, and ${service.revisions} consolidated revisions.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  const configSchema = getServiceConfigSchema(service.id);

  const groupedAddOns = service.addOns.reduce((acc, addon) => {
    const family = getAddOnFamily(addon.label);
    if (!acc[family]) acc[family] = [];
    acc[family].push(addon);
    return acc;
  }, {} as Record<string, typeof service.addOns>);

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-[#F6F4EF]/60">
            <Link
              href="/services"
              className="hover:text-[#F6F4EF] transition-colors"
            >
              Services (13)
            </Link>
            <span>/</span>
            {service.category && (
              <>
                <Link
                  href={`/services?category=${service.category.id}`}
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  {service.category.id} &middot; {service.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#D9BD81] font-bold">{service.id}</span>
          </nav>

          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-[#D9BD81] bg-[#D9BD81]/10 px-3 py-1 rounded border border-[#D9BD81]/30">
                  {service.id}
                </span>
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-[#121315] text-[#F6F4EF] border border-[#232528]">
                  {service.estimated_hours || 4}h Scoped Base
                </span>
                {service.express_eligible && (
                  <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    10-Min Express Micro-Edit Eligible
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F4EF]">
                {service.title}
              </h1>
              {service.title_bn && (
                <p className="text-lg text-[#F6F4EF]/65 font-medium">
                  {service.title_bn}
                </p>
              )}

              <p className="text-sm sm:text-base text-[#F6F4EF]/75 leading-relaxed pt-2">
                {service.summary ||
                  `Engineered under the ${service.category?.name || "Freakin's Studio"} production practice with 2 consolidated revision rounds and structured coordinate proofing.`}
              </p>

              {/* Included & Excluded Deliverables */}
              {service.included && service.excluded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-2">
                    <span className="font-mono text-xs uppercase text-emerald-300 font-semibold block">
                      Included Deliverables
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#F6F4EF]/85">
                      {service.included.map((inc) => (
                        <li key={inc}>&bull; {inc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-2">
                    <span className="font-mono text-xs uppercase text-amber-300 font-semibold block">
                      Explicit Exclusions
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#F6F4EF]/75">
                      {service.excluded.map((exc) => (
                        <li key={exc}>&bull; {exc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 10-Min Express Rule */}
              {service.express_eligible && service.express_rule && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                  <strong className="font-mono uppercase block text-[11px] text-emerald-300 mb-1">
                    10-Minute Express Delivery Eligibility Guard:
                  </strong>
                  {service.express_rule}
                </div>
              )}
            </div>

            {/* Pricing & Action Card */}
            <div className="rounded-2xl border border-[#D9BD81]/40 bg-[#121315] p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#D9BD81]">
                  {service.pricing_status === "approved"
                    ? `Approved Hourly Scoped Rate (${service.estimated_hours || 4}h)`
                    : `Estimated Reference Baseline (${service.estimated_hours || 4}h • Quote Confirmed)`}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold font-mono text-[#F6F4EF]">
                    ৳{service.base_bdt.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono text-[#F6F4EF]/65">
                    / ${service.base_usd.toLocaleString()} USD
                  </span>
                </div>
                {service.pricing_status !== "approved" && (
                  <p className="text-[11px] font-mono text-amber-300 pt-1">
                    Ratebook Confirmation Pending — Formal Studio Quote Issued Prior to Payment
                  </p>
                )}
                <p className="text-[11px] font-mono text-emerald-400 pt-1">
                  5% Launch Window Promo Eligible (20 Nov &ndash; 15 Dec 2026)
                </p>
              </div>

              <div className="space-y-3 border-t border-b border-[#232528] py-4 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">Standard Turnaround</span>
                  <span className="text-[#F6F4EF] font-semibold">
                    {service.days} Business {service.days === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">Revision Rounds</span>
                  <span className="text-[#F6F4EF] font-semibold">
                    {service.revisions} Consolidated Rounds
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F6F4EF]/60">10-Min Express</span>
                  <span className="text-[#D9BD81] font-semibold">
                    {configSchema.express10MinEligible
                      ? "Eligible (Micro-Edits)"
                      : "Standard Queue Only"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  render={
                    <Link href={`/builder?service=${service.id}`}>
                      Configure in Smart Brief &rarr;
                    </Link>
                  }
                  className="w-full cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs h-10"
                />
                <Button
                  render={<Link href="/services">Back to 13 Services</Link>}
                  variant="outline"
                  className="w-full font-mono text-xs h-9 border-[#232528] text-[#F6F4EF]"
                />
              </div>
            </div>
          </div>

          {/* Scoped Service Variants */}
          {service.variants && service.variants.length > 0 && (
            <div className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#F6F4EF] font-mono">
                Approved Scoped Variants ({service.variants.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-lg border border-[#232528] bg-[#090A0A] p-4 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-[#D9BD81]">
                        {variant.id}
                      </span>
                      <h3 className="text-sm font-semibold text-[#F6F4EF]">
                        {variant.title}
                      </h3>
                      <p className="text-xs text-[#F6F4EF]/65">
                        {variant.scopeSummary}
                      </p>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="block text-sm font-bold text-[#D9BD81]">
                        {variant.estimatedHours}h
                      </span>
                      <span className="text-[10px] text-[#F6F4EF]/55">
                        &times;{variant.hourMultiplier} Scope
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Add-Ons */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#F6F4EF]">
                Compatible Scope Add-Ons ({service.addOns.length})
              </h2>
              <p className="text-xs text-[#F6F4EF]/65 mt-1">
                Optional production extensions from our 14 canonical add-ons
                available for {service.title}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedAddOns).map(([family, items]) => (
                <div
                  key={family}
                  className="rounded-xl border border-[#232528] bg-[#121315] p-5 space-y-3"
                >
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#D9BD81]">
                    {family} ({items.length})
                  </h3>
                  <ul className="divide-y divide-[#232528] text-xs">
                    {items.map((addon) => (
                      <li
                        key={addon.id}
                        className="py-2.5 flex items-center justify-between gap-4"
                      >
                        <span className="text-[#F6F4EF]">
                          <strong className="font-mono text-[#D9BD81] mr-1.5">
                            {addon.id}
                          </strong>
                          {addon.label}
                        </span>
                        <span className="font-mono text-[#F6F4EF]/75 whitespace-nowrap">
                          +৳{addon.unit_price_bdt.toLocaleString()} / +$
                          {addon.unit_price_usd}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

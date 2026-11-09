import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getServiceById,
  getCatalogServices,
  getServiceConfigSchema,
} from "@/lib/catalog";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) {
    return { title: "Service Not Found — Freakin's Studio" };
  }
  return {
    title: `${service.id} — ${service.title} | Freakin's Studio`,
    description: `Production specifications, commercial investment, and specialized add-ons for ${service.title}.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  const relatedServices = (await getCatalogServices(service.category_id))
    .filter((s) => s.id !== service.id)
    .slice(0, 3);

  const schema = getServiceConfigSchema(service.id);
  const isQuoteRequired = service.pricing_status === "quote_required";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-brand-black">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-brand-muted">
            <Link href="/" className="hover:text-brand-light transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-brand-light transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-brand-highlight">{service.id}</span>
          </nav>

          {/* Service Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="badge-mono text-brand-highlight px-3 py-1 rounded bg-brand-highlight/10 border border-brand-highlight/20 text-sm font-bold">
                    {service.id}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${
                      isQuoteRequired
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    {isQuoteRequired ? "Quote Required" : "Instant Pricing Available"}
                  </Badge>
                  {service.category && (
                    <span className="text-xs font-mono text-brand-muted">
                      Category {service.category.id}: {service.category.name}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-brand-light tracking-tight">
                  {service.title}
                </h1>
                {service.title_bn && (
                  <p className="text-lg text-brand-muted font-serif">
                    {service.title_bn}
                  </p>
                )}
              </div>

              {/* Service Specifications */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-brand-border space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-brand-light">
                    Deliverable Specifications & Formats
                  </h2>
                  <p className="text-xs text-brand-muted mt-1">
                    Standard production sizing and delivery formats provided with this service.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-mono uppercase text-brand-muted mb-2">
                      Supported Delivery Formats
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {schema.formatOptions.map((fmt) => (
                        <span
                          key={fmt}
                          className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-brand-light"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {schema.notes && (
                    <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/60 text-xs text-brand-muted">
                      {schema.notes}
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border text-xs text-brand-muted space-y-1">
                    <span className="font-semibold text-brand-light font-mono block">
                      Commercial Rights & Licensing Terms:
                    </span>
                    <p>
                      Includes full commercial production rights upon final payment settlement.
                      Source files and editable templates available via specialized add-ons below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compatible Add-ons */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-brand-border space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-brand-light">
                    Specialized Service Add-ons
                  </h2>
                  <p className="text-xs text-brand-muted mt-1">
                    Optional enhancements compatible with this creative service.
                  </p>
                </div>

                {service.addOns.length === 0 ? (
                  <p className="text-xs text-brand-muted font-mono">
                    No optional add-ons specified for this service.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.addOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="p-3.5 rounded-xl border border-brand-border bg-brand-surface/50 flex flex-col justify-between"
                      >
                        <span className="text-xs font-medium text-brand-light">
                          {addon.label}
                        </span>
                        <span className="text-[11px] font-mono text-brand-highlight mt-2 font-semibold">
                          +৳ {Number(addon.unit_price_bdt).toLocaleString()} / +${" "}
                          {addon.unit_price_usd}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Commercial Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6 sticky top-24 cyber-glow">
                <span className="text-xs font-mono uppercase text-brand-muted block">
                  Commercial Snapshot
                </span>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-brand-muted">Base Rate (BDT):</span>
                    <span className="text-2xl font-black font-mono text-brand-light">
                      ৳ {Number(service.base_bdt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-brand-muted">
                    <span>Base Rate (USD):</span>
                    <span className="font-mono text-sm font-semibold text-brand-light">
                      ${Number(service.base_usd).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-brand-border/60 border-t border-b border-brand-border/60 py-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between pt-2">
                    <span className="text-brand-muted">Turnaround:</span>
                    <span className="text-brand-light font-semibold">
                      {service.days} Business Days
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-brand-muted">Included Revisions:</span>
                    <span className="text-brand-light font-semibold">
                      {service.revisions} Rounds
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-brand-muted">Rush Delivery (x1.35):</span>
                    <span className="text-emerald-400 font-semibold">Available in Builder</span>
                  </div>
                </div>

                <Button
                  render={
                    <Link href={`/builder?service=${service.id}`}>
                      Configure in Package Builder
                    </Link>
                  }
                  size="lg"
                  className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-sm"
                />

                <Button
                  render={<Link href="/services">Browse All Services</Link>}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-mono border-brand-border"
                />
              </div>
            </div>
          </div>

          {/* Related Services */}
          {relatedServices.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-brand-border">
              <h2 className="text-xl font-bold text-brand-light">
                More Services in {service.category?.name || "This Category"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedServices.map((rel) => (
                  <div
                    key={rel.id}
                    className="glass-card p-4 rounded-xl border border-brand-border flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="badge-mono text-brand-highlight text-xs font-bold">
                          {rel.id}
                        </span>
                        <span className="text-xs font-mono text-brand-muted">
                          {rel.days}d turnaround
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-brand-light">
                        {rel.title}
                      </h3>
                      {rel.title_bn && (
                        <p className="text-xs text-brand-muted font-serif mt-0.5">
                          {rel.title_bn}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-brand-light">
                        ৳ {Number(rel.base_bdt).toLocaleString()}
                      </span>
                      <Link
                        href={`/services/${rel.id}`}
                        className="text-xs font-mono text-brand-highlight hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

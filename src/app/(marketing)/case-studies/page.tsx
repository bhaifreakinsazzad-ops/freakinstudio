import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ShowcaseImage } from "@/components/ui/ShowcaseImage";
import { CANONICAL_CONCEPT_WORKS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Technical Concept Studies — Freakin's Studio",
  description:
    "In-depth technical design studies examining typography, vector construction, pre-press color separation, and kinetic motion systems.",
};

export const instant = false;

export default function CaseStudiesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono rounded border border-[#D9BD81]/40 bg-[#D9BD81]/10 px-2.5 py-1 text-[#D9BD81]">
              Concept Work — Not Client Work
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF] text-balance">
              Technical Production Breakdowns.
            </h1>
            <p className="text-base sm:text-lg text-[#F6F4EF]/70 leading-relaxed">
              Explore how Freakin&apos;s Studio structures design systems,
              pre-press packaging dielines, and short-form motion sequences
              across our 13 canonical services. All studies are internal studio
              specimens with zero fabricated client testimonials or inflated
              vanity metrics.
            </p>
          </div>

          {/* Concept Studies List */}
          <div className="space-y-12">
            {CANONICAL_CONCEPT_WORKS.map((study, idx) => (
              <article
                key={study.id}
                className="rounded-2xl border border-[#232528] bg-[#121315] p-6 sm:p-10 space-y-8"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232528] pb-5 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[#F6F4EF] font-bold">
                      Specimen 0{idx + 1} ({study.id})
                    </span>
                    <span className="text-[#232528]">&bull;</span>
                    <span className="rounded border border-[#D9BD81]/40 bg-[#D9BD81]/10 px-2 py-0.5 text-[#D9BD81]">
                      Concept Work — Not Client Work
                    </span>
                    <span className="text-[#232528]">&bull;</span>
                    <span className="text-[#F6F4EF]/65">
                      {study.categoryLabel}
                    </span>
                  </div>
                  <div className="text-[#F6F4EF]/70">
                    Canonical Service:{" "}
                    <Link
                      href={`/services/${study.serviceId}`}
                      className="text-[#D9BD81] font-semibold hover:underline"
                    >
                      {study.serviceId}
                    </Link>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-5">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#F6F4EF] leading-snug">
                        {study.title}
                      </h2>
                      <p className="text-sm font-medium text-[#F6F4EF]/75 leading-relaxed">
                        {study.visualTheme}
                      </p>

                      <div className="space-y-4 pt-2 text-xs leading-relaxed text-[#F6F4EF]/70">
                        <div className="rounded-xl border border-[#232528] bg-[#090A0A]/60 p-4">
                          <h3 className="font-mono uppercase font-semibold text-[#D9BD81] text-xs mb-1.5">
                            Production Architecture &amp; Truth Policy
                          </h3>
                          <p>{study.rationale}</p>
                        </div>
                      </div>

                      {/* Deliverables & Formats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="rounded-xl border border-[#232528] bg-[#090A0A]/40 p-4 space-y-1.5">
                          <h4 className="font-mono uppercase text-[10px] text-[#F6F4EF]/50">
                            Included Specimen Deliverables
                          </h4>
                          <ul className="space-y-1 text-xs font-mono text-[#F6F4EF]/90">
                            {study.deliverables.map((d) => (
                              <li key={d}>&bull; {d}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl border border-[#232528] bg-[#090A0A]/40 p-4 space-y-1.5">
                          <h4 className="font-mono uppercase text-[10px] text-[#F6F4EF]/50">
                            Handover Formats &amp; Governance
                          </h4>
                          <p className="text-xs font-mono text-[#D9BD81]">
                            {study.formats.join(" · ")}
                          </p>
                          <p className="text-[11px] text-[#F6F4EF]/60 pt-1">
                            2 Consolidated Revision Rounds &bull; Human Art
                            Direction Sign-Off
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar with Image & CTA */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-[#232528] bg-[#232528]">
                      {study.imageUrl && (
                        <ShowcaseImage
                          src={study.imageUrl}
                          alt={study.title}
                          caption={`${study.title} (Concept Work)`}
                          className="object-cover"
                        />
                      )}
                    </div>

                    <Button
                      render={
                        <Link href={`/builder?service=${study.serviceId}`}>
                          Configure {study.serviceId} Scope in Smart Brief &rarr;
                        </Link>
                      }
                      className="w-full cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono h-11"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Direct CTA */}
          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF] text-balance">
              Start Your Next Production Chapter with Freakin&apos;s Studio.
            </h2>
            <p className="text-sm text-[#F6F4EF]/70 max-w-xl mx-auto">
              Choose from 13 canonical creative services across 4 disciplines,
              tailor your variants and add-ons, and submit a Smart Brief today.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Button
                render={<Link href="/builder">Launch Smart Brief Builder</Link>}
                size="lg"
                className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-sm"
              />
              <Button
                render={<Link href="/services">Browse 13 Core Services</Link>}
                size="lg"
                variant="outline"
                className="font-mono text-sm border-[#232528] text-[#F6F4EF]"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

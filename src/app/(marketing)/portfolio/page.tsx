import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ShowcaseImage } from "@/components/ui/ShowcaseImage";
import { CANONICAL_CONCEPT_WORKS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Concept Works Showcase — Freakin's Studio",
  description:
    "Curated studio design studies and technical craft specimens across Brand Identity, Social Campaign Creative, Print & Packaging, and Motion Graphics.",
};

export const instant = false;

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-mono rounded border border-[#D9BD81]/40 bg-[#D9BD81]/10 px-2.5 py-1 text-[#D9BD81]">
                Concept Work — Not Client Work
              </span>
              <span className="badge-mono text-[#F6F4EF]/60">
                Zero Fabricated Metrics Policy
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF] text-balance">
              Studio Craft &amp; Technical Specimens.
            </h1>
            <p className="text-base sm:text-lg text-[#F6F4EF]/70 leading-relaxed">
              Every specimen below is an internal Freakin&apos;s Studio design
              study explicitly labeled{" "}
              <strong className="text-[#D9BD81]">
                Concept Work — Not Client Work
              </strong>
              . We demonstrate our vector geometry, print pre-press accuracy,
              and motion pacing transparently—without inventing fabricated
              client revenue or ROAS numbers.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                render={<Link href="/builder">Start Smart Brief &rarr;</Link>}
                size="lg"
                className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-sm"
              />
              <Button
                render={<Link href="/case-studies">View Technical Studies</Link>}
                size="lg"
                variant="outline"
                className="font-mono text-sm border-[#232528] text-[#F6F4EF]"
              />
            </div>
          </div>

          {/* Grid of Truthful Concept Works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CANONICAL_CONCEPT_WORKS.map((work) => (
              <div
                key={work.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#232528] bg-[#121315] overflow-hidden hover:border-[#D9BD81]/50 transition-colors duration-200"
              >
                <div>
                  <div className="relative h-60 w-full overflow-hidden bg-[#232528]">
                    {work.imageUrl && (
                      <ShowcaseImage
                        src={work.imageUrl}
                        alt={work.title}
                        caption={work.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center rounded-md border border-[#D9BD81]/50 bg-[#090A0A]/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D9BD81] backdrop-blur-md">
                        Concept Work — Not Client Work
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center rounded-md border border-[#232528] bg-[#090A0A]/85 px-2 py-1 font-mono text-[10px] text-[#F6F4EF]/80">
                        {work.id} &middot; {work.serviceId}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-[#D9BD81]">
                        {work.disciplineId} &middot; {work.categoryLabel}
                      </p>
                      <h2 className="text-xl font-bold text-[#F6F4EF] group-hover:text-[#D9BD81] transition-colors">
                        {work.title}
                      </h2>
                    </div>

                    <p className="text-xs text-[#F6F4EF]/75 leading-relaxed">
                      {work.visualTheme}
                    </p>

                    <div className="rounded-xl border border-[#232528] bg-[#090A0A]/60 p-3.5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#D9BD81] block">
                        Craft &amp; Production Rationale
                      </span>
                      <p className="text-xs text-[#F6F4EF]/70 leading-relaxed">
                        {work.rationale}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#232528]">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#F6F4EF]/50 block">
                          Specimen Deliverables
                        </span>
                        <p className="text-xs font-mono text-[#F6F4EF]/90 mt-0.5">
                          {work.deliverables.join(" · ")}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#F6F4EF]/50 block">
                          Master Formats
                        </span>
                        <p className="text-xs font-mono text-[#D9BD81] mt-0.5">
                          {work.formats.join(" · ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-6 py-4 border-t border-[#232528] flex items-center justify-between gap-2 bg-[#090A0A]/40">
                  <Link
                    href={`/services/${work.serviceId}`}
                    className="text-xs font-mono text-[#F6F4EF]/70 hover:text-[#D9BD81] transition-colors whitespace-nowrap"
                  >
                    Inspect {work.serviceId} Specification &rarr;
                  </Link>
                  <Button
                    render={
                      <Link href={`/builder?service=${work.serviceId}`}>
                        Scope Similar Study
                      </Link>
                    }
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-mono border-[#D9BD81]/40 text-[#D9BD81] whitespace-nowrap"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF] text-balance">
              Commission Human Studio Craft with Transparent Hourly Scoping.
            </h2>
            <p className="text-sm text-[#F6F4EF]/70 max-w-xl mx-auto">
              Select from our 13 core services, 15 scoped variants, 5 commercial
              bundles, and 14 compatible add-ons—with 2 consolidated revisions
              included.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/builder">Launch 3-Step Smart Brief</Link>}
                size="lg"
                className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-sm"
              />
              <Button
                render={<Link href="/tools">Try 6 Free Browser Tools</Link>}
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

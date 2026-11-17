import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ShowcaseImage } from "@/components/ui/ShowcaseImage";

export const metadata: Metadata = {
  title: "Portfolio Showcase — Freakin's Studio",
  description:
    "Exemplary brand identity systems, commercial video & 3D motion, AI-assisted creative production, luxury packaging, ad suites, and corporate decks engineered by Freakin's Studio.",
};

export const instant = false;

interface PortfolioProject {
  id: string;
  categoryCode: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  categoryName: string;
  title: string;
  client: string;
  description: string;
  deliverables: string[];
  metrics: string;
  imageUrl: string;
  serviceId: string;
}

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "p-aurum",
    categoryCode: "B",
    categoryName: "Brand Identity & Development",
    title: "Aurum Autonomous — Complete Brand Identity System",
    client: "Aurum Robotics Corp",
    description:
      "Mathematical monogram architecture, embossed obsidian stationery suite, typography specifications, and comprehensive brand book for a Series-A robotics company.",
    deliverables: ["Vector Master SVG & AI", "Brand Guidelines Book", "Stationery & Executive Kit"],
    metrics: "4.8x increase in Series-A pitch visual confidence",
    imageUrl: "/images/portfolio/brand-identity.jpg",
    serviceId: "B02",
  },
  {
    id: "p-motion-aura",
    categoryCode: "C",
    categoryName: "Video Production, Editing & Motion Graphics",
    title: "Motion Aura — 4K Kinetic Brand Film & 3D Sequence",
    client: "Kinetic Interactive Labs",
    description:
      "Full 4K commercial edit, metallic gold 3D animated typography sequences, broadcast color grading, and multi-aspect vertical/widescreen delivery cutdowns.",
    deliverables: ["4K ProRes & MP4 Master", "After Effects Source", "9:16 & 16:9 Cutdowns"],
    metrics: "1.4M organic launch views in first 14 days",
    imageUrl: "/images/portfolio/video-motion.jpg",
    serviceId: "C05",
  },
  {
    id: "p-aetheria",
    categoryCode: "F",
    categoryName: "Digital & AI-Powered Creative Production",
    title: "Aetheria Spatial — AI-Assisted Hardware Film & Stills",
    client: "Aetheria Audio Systems",
    description:
      "AI-assisted generative storyboard pipeline combined with studio-grade retouching and dynamic hardware video reveal sequences for a global hardware reveal.",
    deliverables: ["8K Generative Product Stills", "AI Video Reveal Sequences", "Layered Retouch PSD"],
    metrics: "2,400 pre-order units reserved within 48 hours",
    imageUrl: "/images/portfolio/ai-creative.jpg",
    serviceId: "F02",
  },
  {
    id: "p-aura-nocturne",
    categoryCode: "A",
    categoryName: "Graphic Design & Visual Communication",
    title: "Aura Nocturne — Tactile Luxury Packaging & Crest Graphics",
    client: "Aura Nocturne Fragrance House",
    description:
      "Custom geometric emblem, matte rigid unboxing structural dielines, hot-foil stamping specs, and print-ready CMYK pre-press packaging masters.",
    deliverables: ["Die-Cut Vector Dielines", "Foil & Spot UV Specs", "Print-Ready CMYK Masters"],
    metrics: "500-unit limited first run sold out in 72 hours",
    imageUrl: "/images/portfolio/luxury-packaging.jpg",
    serviceId: "A09",
  },
  {
    id: "p-monolith-ads",
    categoryCode: "E",
    categoryName: "Advertising & Marketing Creative",
    title: "Monolith Drop — High-Converting Paid Advertising Matrix",
    client: "Monolith Performance Wear",
    description:
      "Performance acquisition ad suite engineered for Meta, Instagram, Google Display Network, and retargeting funnels with high-contrast architectural lighting.",
    deliverables: ["16 Ad Aspect Variations", "Static & Motion Ad Stems", "A/B Hook Creative Pack"],
    metrics: "+42% ROAS uplift over previous agency baseline",
    imageUrl: "/images/portfolio/ad-campaign.jpg",
    serviceId: "E01",
  },
  {
    id: "p-arcturus",
    categoryCode: "G",
    categoryName: "Corporate & Business Communication",
    title: "Arcturus Holdings — Executive Investor Deck & Annual Report",
    client: "Arcturus Capital Partners",
    description:
      "28-slide executive investor pitch deck and hardcover annual report system with custom financial data visualization charts in champagne gold and obsidian.",
    deliverables: ["Editable Keynote / PPTX", "Vector Financial Charts", "Executive Print & PDF"],
    metrics: "$24M institutional capital committed post-roadshow",
    imageUrl: "/images/portfolio/corporate-deck.jpg",
    serviceId: "G03",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">Excellence in Production</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light text-balance">
              Crafted for Commercial Impact.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Explore recent production milestones delivered at Freakin&apos;s Studio. Every project maps directly to our
              canonical 60-service catalog, structured proofing rounds, and perpetual commercial buyout licensing.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                render={<Link href="/builder">Launch Package Builder &rarr;</Link>}
                size="lg"
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-sm"
              />
              <Button
                render={<Link href="/case-studies">Read Deep-Dive Case Studies</Link>}
                size="lg"
                variant="outline"
                className="font-mono text-sm border-brand-border text-brand-light"
              />
            </div>
          </div>

          {/* Grid of Showcase Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PORTFOLIO_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="group flex flex-col justify-between rounded-xl border border-brand-border bg-brand-surface/40 overflow-hidden hover:border-brand-highlight/40 transition-colors duration-200"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-brand-surface">
                    <ShowcaseImage
                      src={proj.imageUrl}
                      alt={proj.title}
                      caption={proj.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-brand-muted">
                        Cat {proj.categoryCode} · {proj.categoryName}
                      </p>
                      <h3 className="text-lg font-bold text-brand-light group-hover:text-brand-highlight transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-mono text-brand-highlight">{proj.client}</p>
                    </div>

                    <p className="text-xs text-brand-muted leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="space-y-1 pt-2 border-t border-brand-border/50">
                      <span className="text-[10px] font-mono uppercase text-brand-muted block">
                        Deliverables Included
                      </span>
                      <p className="text-xs font-mono text-brand-light/90">
                        {proj.deliverables.join(" · ")}
                      </p>
                    </div>

                    <p className="text-xs font-mono text-emerald-400 pt-1">
                      Outcome: {proj.metrics}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-6 py-4 border-t border-brand-border/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/services/${proj.serviceId}`}
                    className="text-xs font-mono text-brand-muted hover:text-brand-light transition-colors whitespace-nowrap"
                  >
                    Service {proj.serviceId} &rarr;
                  </Link>
                  <Button
                    render={<Link href={`/builder?service=${proj.serviceId}`}>Configure Scope</Link>}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-mono border-brand-border text-brand-light whitespace-nowrap"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface to-brand-border/30 p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light text-balance">
              Ready to elevate your commercial identity?
            </h2>
            <p className="text-sm text-brand-muted max-w-xl mx-auto">
              Our 7-step interactive Package Builder allows you to combine any of our 60 services, configure add-ons,
              and receive instant authoritative pricing or an enterprise quotation.
            </p>
            <div className="pt-2">
              <Button
                render={<Link href="/builder">Build Your Custom Creative Package</Link>}
                size="lg"
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

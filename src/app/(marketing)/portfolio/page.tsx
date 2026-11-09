/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Portfolio Showcase — Freakin's Studio",
  description: "Exemplary brand systems, 3D kinetic visuals, web platforms, and sonic design engineered by Freakin's Studio.",
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
    id: "p-apex",
    categoryCode: "A",
    categoryName: "Identity Systems",
    title: "Apex Robotics — Series-A Visual Architecture",
    client: "Apex Autonomous Corp",
    description: "Complete corporate brand system, custom mathematical logomark, design tokens, and comprehensive brand guide for an autonomous logistics startup.",
    deliverables: ["Vector Master SVG", "Brand Book Guidelines", "Design Tokens JSON", "Stationery Pack"],
    metrics: "4.8x increase in Series-A pitch visual valuation",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    serviceId: "A1",
  },
  {
    id: "p-finpulse",
    categoryCode: "C",
    categoryName: "Digital Experience",
    title: "FinPulse — Cross-Platform Banking Ecosystem",
    client: "FinPulse Global",
    description: "42 high-fidelity mobile application screens, dark/light kinetic UI tokens, micro-interactions, and responsive web marketing platform.",
    deliverables: ["Figma Component Library", "Next.js 16 Web Platform", "Interactive Lottie Animations"],
    metrics: "99.8% customer design satisfaction score",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    serviceId: "C1",
  },
  {
    id: "p-neurosynth",
    categoryCode: "F",
    categoryName: "AI & 3D Kinetic",
    title: "NeuroSynth — Generative 3D Spatial Audio Reveal",
    client: "NeuroSynth Labs",
    description: "60-second procedural 3D teaser video rendered in 4K ProRes with bespoke sonic identity and haptic soundscape chimes.",
    deliverables: ["4K ProRes 4444 Master", "Dolby Atmos Spatial Audio", "Blender Procedural Project File"],
    metrics: "1.4M views across tech launch announcement",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    serviceId: "F1",
  },
  {
    id: "p-veloce",
    categoryCode: "B",
    categoryName: "Visual Design",
    title: "Veloce Atelier — Luxury Editorial Design & Packaging",
    client: "Veloce Timepieces",
    description: "Bespoke typography, luxury tactile unboxing packaging, custom foiled certificates of authenticity, and catalog art direction.",
    deliverables: ["Die-Cut Vector Dielines", "Spot UV Foil Specs", "Print-Ready CMYK Masters"],
    metrics: "Sold out initial 500-unit limited run in 72h",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
    serviceId: "B1",
  },
  {
    id: "p-omnichannel",
    categoryCode: "E",
    categoryName: "Advertising & Marketing",
    title: "Kinetix Performance — Global Product Drop Campaign",
    client: "Kinetix Athletics",
    description: "High-converting multi-format social ad suites across Meta, TikTok, and Google Display Network with animated kinetic type.",
    deliverables: ["16 Ad Aspect Variations", "High-FPS MP4 Motion Stems", "Static Display Banners"],
    metrics: "+42% ROAS over previous agency baseline",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    serviceId: "E1",
  },
  {
    id: "p-synthetix",
    categoryCode: "G",
    categoryName: "Corporate Communication",
    title: "Synthetix Capital — Series-B Investor Master Deck",
    client: "Synthetix Ventures",
    description: "Interactive executive pitch presentation, custom financial data visualization charts, and editable Keynote/Figma tokens.",
    deliverables: ["Editable Keynote / PPTX", "Vector Chart Assets", "Executive Leave-Behind PDF"],
    metrics: "$24M institutional capital secured",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    serviceId: "G1",
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
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light">
              Crafted for Commercial Impact.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Explore recent production milestones engineered at Freakin&apos;s Studio. Every project is backed by our
              canonical 60-service catalog, rigorous quality assurance, and commercial buyout licensing.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                render={<Link href="/builder">Launch Package Builder &rarr;</Link>}
                size="lg"
                className="cyber-glow"
              />
              <Button
                render={<Link href="/case-studies">Read Deep-Dive Case Studies</Link>}
                size="lg"
                variant="outline"
              />
            </div>
          </div>

          {/* Grid of Showcase Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PORTFOLIO_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="group flex flex-col justify-between rounded-xl border border-brand-border bg-brand-surface/40 overflow-hidden hover:border-brand-highlight/40 transition-all duration-300"
              >
                <div>
                  {/* Image banner */}
                  <div className="relative h-56 w-full overflow-hidden bg-brand-border/30">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="outline" className="badge-mono bg-brand-black/80 backdrop-blur-sm border-brand-border text-brand-light">
                        Cat {proj.categoryCode} &bull; {proj.categoryName}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-brand-highlight">{proj.client}</span>
                      <h3 className="text-lg font-bold text-brand-light group-hover:text-brand-highlight transition-colors">
                        {proj.title}
                      </h3>
                    </div>

                    <p className="text-xs text-brand-muted leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Deliverables tags */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-mono uppercase text-brand-muted">Included Deliverables:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.deliverables.map((deliv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-border/40 text-brand-light"
                          >
                            {deliv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metric badge */}
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-mono text-emerald-400">
                      &bull; Outcome: {proj.metrics}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-6 pt-0 border-t border-brand-border/40 mt-4 flex items-center justify-between">
                  <Link
                    href={`/services/${proj.serviceId}`}
                    className="text-xs font-mono text-brand-muted hover:text-brand-light transition-colors"
                  >
                    View Service ({proj.serviceId}) &rarr;
                  </Link>
                  <Button
                    render={<Link href={`/builder?service=${proj.serviceId}`}>Configure Scope</Link>}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface to-brand-border/30 p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light">
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
                className="cyber-glow"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

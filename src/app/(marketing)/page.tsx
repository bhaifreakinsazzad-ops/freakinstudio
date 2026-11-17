import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { WorkflowStepCard } from "@/components/ui/WorkflowStepCard";
import { ShowcaseImage } from "@/components/ui/ShowcaseImage";

export const metadata: Metadata = {
  title: "Freakin's Studio — Creative Commerce Operating System",
  description:
    "Next-generation studio platform for graphic design, brand identity, video & 3D motion production, social content, paid ad creative, AI production, and corporate communication.",
};

export const instant = false;

const CATEGORY_PILLARS = [
  {
    code: "A",
    count: 10,
    title: "Graphic Design & Visual Communication",
    desc: "Social graphics, promotional ad creatives, flyers, stationery, infographics, packaging graphics, and print publication layouts.",
    highlight: "A09 · Packaging & Product Graphics",
  },
  {
    code: "B",
    count: 8,
    title: "Brand Identity & Development",
    desc: "Logo systems, complete brand identity architecture, brand books, color & typography systems, positioning, and design templates.",
    highlight: "B02 · Complete Brand Identity Development",
  },
  {
    code: "C",
    count: 12,
    title: "Video Production, Editing & Motion Graphics",
    desc: "Commercial video editing, short-form reels, animated typography, 2D & 3D animation, VFX, corporate explainers, and localization.",
    highlight: "C05 · 3D Animation & Visuals",
  },
  {
    code: "D",
    count: 8,
    title: "Social Media & Digital Content",
    desc: "Monthly content calendars, multi-platform creative production, content repurposing, page identity, and creative direction.",
    highlight: "D03 · Social Media Creative Production",
  },
  {
    code: "E",
    count: 8,
    title: "Advertising & Marketing Creative",
    desc: "Paid acquisition creatives for Meta, Instagram, Google Display, YouTube video ads, e-commerce promos, and campaign art direction.",
    highlight: "E01 · Paid Advertising Creative Design",
  },
  {
    code: "F",
    count: 7,
    title: "Digital & AI-Powered Creative Production",
    desc: "AI-assisted imagery and video production, concept ideation, neural retouching, digital product mockups, and workflow automation.",
    highlight: "F02 · AI-Assisted Video Production",
  },
  {
    code: "G",
    count: 7,
    title: "Corporate & Business Communication",
    desc: "Investor pitch decks, company profiles, executive presentations, annual reports, training kits, and corporate infographics.",
    highlight: "G03 · Business Pitch Decks",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Discover & Configure",
    desc: "Select from 60 canonical services across 7 disciplines in our 7-step interactive Package Builder with compatible add-ons.",
  },
  {
    step: "02",
    title: "Authoritative Pricing",
    desc: "Server-calculated pricing in BDT & USD. Instant checkout for standard scopes; streamlined formal quotations for enterprise volumes.",
  },
  {
    step: "03",
    title: "Client Workspace & Brief",
    desc: "Dedicated project portal to submit structured onboarding briefs, brand parameters, and target platform specs.",
  },
  {
    step: "04",
    title: "Pin Annotation & Review",
    desc: "Click directly on preview drafts to place feedback pins with exact coordinates and track contractual revision rounds.",
  },
  {
    step: "05",
    title: "Master ZIP Delivery",
    desc: "One-click download of finalized deliverables, vector masters, 4K exports, manifests, and commercial buyout licenses.",
  },
];

const FEATURED_SHOWCASE = [
  {
    title: "Aurum Industrial — Brand Architecture & Stationery",
    category: "Category B · Brand Identity",
    serviceId: "B02",
    outcome: "4.8x Series-A pitch confidence",
    image: "/images/portfolio/brand-identity.jpg",
  },
  {
    title: "Motion Aura — 4K Kinetic Brand Film & Grading",
    category: "Category C · Video & Motion",
    serviceId: "C05",
    outcome: "1.4M organic launch views",
    image: "/images/portfolio/video-motion.jpg",
  },
  {
    title: "Aura Nocturne — Luxury Tactile Unboxing System",
    category: "Category A · Graphic & Packaging",
    serviceId: "A09",
    outcome: "500-unit drop sold out in 72h",
    image: "/images/portfolio/luxury-packaging.jpg",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-brand-border py-20 sm:py-28">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2b302d26_1px,transparent_1px),linear-gradient(to_bottom,#2b302d26_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 space-y-7">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-brand-highlight">
              Creative Commerce Operating System · 60 Canonical Services · Dhaka &amp; Global
            </p>
            <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-light leading-[1.08] text-balance">
              Where High-Velocity Creativity Meets{" "}
              <span className="text-brand-highlight">Operating Precision.</span>
            </h1>
            <p className="text-sm sm:text-base font-mono uppercase tracking-[0.25em] text-brand-light/90">
              Design · Create · Produce · Grow
            </p>
            <p className="max-w-2xl text-base sm:text-lg text-brand-muted leading-relaxed">
              Freakin&apos;s Studio delivers bespoke brand systems, commercial video and 3D motion,
              high-converting ad creative, and AI-assisted production for ambitious brands.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                render={<Link href="/builder">Launch Package Builder &rarr;</Link>}
                size="lg"
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-sm px-8 h-12 whitespace-nowrap"
              />
              <Button
                render={<Link href="/services">Explore 60 Services</Link>}
                size="lg"
                variant="outline"
                className="font-mono text-sm h-12 border-brand-border text-brand-light hover:bg-brand-surface whitespace-nowrap"
              />
              <Button
                render={<Link href="/portfolio">View Portfolio</Link>}
                size="lg"
                variant="ghost"
                className="font-mono text-sm h-12 text-brand-muted hover:text-brand-light whitespace-nowrap"
              />
            </div>

            {/* Key Guarantees Row */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full border-t border-brand-border/50 tabular-nums">
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-light">60</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Canonical Services</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-highlight">100%</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Commercial Buyout</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-light">+35%</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Rush Priority SLA</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">BDT / USD</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Dual-Currency Pay</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 CATEGORY PILLARS */}
        <section className="py-24 border-b border-brand-border bg-brand-surface/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="badge-mono text-brand-highlight">Comprehensive Service Spectrum</span>
                <h2 className="text-3xl sm:text-5xl font-bold text-brand-light text-balance">
                  Seven Specialized Creative Disciplines.
                </h2>
                <p className="text-sm sm:text-base text-brand-muted">
                  From foundational graphic design and brand books to 3D motion films, AI production, and executive pitch decks—every service carries transparent turnaround and revision bounds.
                </p>
              </div>
              <Button
                render={<Link href="/services">View All 60 Services &rarr;</Link>}
                variant="outline"
                className="font-mono text-xs border-brand-border text-brand-light self-start md:self-auto whitespace-nowrap"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {CATEGORY_PILLARS.map((cat) => (
                <FeatureCard
                  key={cat.code}
                  code={cat.code}
                  title={cat.title}
                  desc={cat.desc}
                  highlight={cat.highlight}
                  count={cat.count}
                  href={`/services?category=${cat.code}`}
                />
              ))}
              {/* Package Builder Card */}
              <div className="rounded-xl border border-brand-highlight/40 bg-gradient-to-br from-brand-highlight/10 via-brand-surface/40 to-transparent p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="badge-mono text-brand-highlight font-bold block">
                    Interactive Configurator
                  </span>
                  <h3 className="text-lg font-bold text-brand-light">Custom Multi-Service Bundles</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Combine services across categories, select rush turnarounds, attach compatible add-ons, and get instant server-authoritative pricing.
                  </p>
                </div>
                <Button
                  render={<Link href="/builder">Build Custom Scope &rarr;</Link>}
                  className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold text-xs font-mono h-10 whitespace-nowrap"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTION PROOF */}
        <section className="py-24 border-b border-brand-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="badge-mono text-brand-highlight">Selected Studio Work</span>
                <h2 className="text-3xl sm:text-5xl font-bold text-brand-light text-balance">
                  Commercial Production in Practice.
                </h2>
              </div>
              <Button
                render={<Link href="/portfolio">Explore Full Portfolio &rarr;</Link>}
                variant="outline"
                className="font-mono text-xs border-brand-border text-brand-light self-start md:self-auto whitespace-nowrap"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_SHOWCASE.map((item) => (
                <div
                  key={item.serviceId}
                  className="group rounded-xl border border-brand-border bg-brand-surface/40 overflow-hidden flex flex-col justify-between hover:border-brand-highlight/40 transition-colors"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-surface">
                      <ShowcaseImage
                        src={item.image}
                        alt={item.title}
                        caption={item.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 space-y-2">
                      <p className="text-xs font-mono text-brand-muted">
                        {item.category} · <span className="text-brand-highlight">{item.serviceId}</span>
                      </p>
                      <h3 className="text-base font-bold text-brand-light">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-emerald-400">
                        Outcome: {item.outcome}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs font-mono">
                    <Link
                      href={`/services/${item.serviceId}`}
                      className="text-brand-muted hover:text-brand-light transition-colors"
                    >
                      Inspect {item.serviceId} &rarr;
                    </Link>
                    <Link
                      href={`/builder?service=${item.serviceId}`}
                      className="text-brand-highlight hover:underline"
                    >
                      Configure Scope
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW OPERATING ARCHITECTURE */}
        <section className="py-24 border-b border-brand-border bg-brand-surface/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="badge-mono text-brand-highlight">The Studio Engine</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-brand-light text-balance">
                Built as an Operating System, Not a Traditional Agency.
              </h2>
              <p className="text-sm sm:text-base text-brand-muted">
                Transparent milestones, server-authoritative checkout, interactive canvas pin-annotations, and instant master ZIP deliverable packaging.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {WORKFLOW_STEPS.map((step) => (
                <WorkflowStepCard key={step.step} step={step.step} title={step.title} desc={step.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-brand-highlight/30 bg-gradient-to-b from-brand-surface to-brand-black p-8 sm:p-16 text-center space-y-6 relative overflow-hidden">
              <span className="badge-mono text-brand-highlight">Start Your Sprint Today</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-brand-light tracking-tight max-w-2xl mx-auto text-balance">
                Ready to elevate your commercial identity?
              </h2>
              <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
                Launch the interactive Package Builder to calculate your authoritative project quote or speak directly with our studio desk.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Button
                  render={<Link href="/builder">Build Your Custom Package</Link>}
                  size="lg"
                  className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-sm px-8 h-12"
                />
                <Button
                  render={<Link href="/contact">Request Studio Consultation</Link>}
                  size="lg"
                  variant="outline"
                  className="font-mono text-sm h-12 border-brand-border text-brand-light"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { WorkflowStepCard } from "@/components/ui/WorkflowStepCard";

export const metadata: Metadata = {
  title: "Freakin's Studio — Creative Commerce Operating System",
  description:
    "Next-generation studio platform for bespoke brand systems, 3D kinetic visuals, digital experience engineering, and commercial creative production.",
};

export const instant = false;

const CATEGORY_PILLARS = [
  {
    code: "A",
    count: 10,
    title: "Identity Systems",
    desc: "Complete visual architecture, mathematical logomarks, typography rules, brand guidelines, and design tokens.",
    highlight: "Enterprise Brand System & Guidelines",
  },
  {
    code: "B",
    count: 8,
    title: "Visual Design & Art",
    desc: "High-precision vector illustrations, tactile product packaging, editorial publication design, and visual assets.",
    highlight: "Tactile Luxury Unboxing Packaging",
  },
  {
    code: "C",
    count: 12,
    title: "Digital Experience",
    desc: "Next.js web platforms, headless e-commerce stores, responsive mobile app UI/UX, and component libraries.",
    highlight: "Next.js 16 Production Web Platform",
  },
  {
    code: "D",
    count: 8,
    title: "Content & Media",
    desc: "High-retention social media content engines, podcast visual systems, video thumbnail frameworks, and campaign assets.",
    highlight: "Multi-Platform Content Engine Sprints",
  },
  {
    code: "E",
    count: 8,
    title: "Advertising & Performance",
    desc: "High-converting multi-aspect ad suites for Meta, TikTok, Google Display Network, and animated kinetic banners.",
    highlight: "Omnichannel Acquisition Ad Suite",
  },
  {
    code: "F",
    count: 7,
    title: "AI-Powered & 3D Kinetic",
    desc: "Photorealistic 3D product visualizers, procedural cinema reveals, AI generative workflows, and sonic mnemonic branding.",
    highlight: "4K 3D Cinema Product Trailer",
  },
  {
    code: "G",
    count: 7,
    title: "Corporate Communications",
    desc: "Institutional investor pitch decks, annual corporate reports, executive collateral, and interactive keynote slides.",
    highlight: "Series-A / Series-B Pitch Master Deck",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Discover & Configure",
    desc: "Select from 60 precision services across 7 categories in our 7‑step interactive Package Builder. Tailor deliverables and add‑ons.",
  },
  {
    step: "02",
    title: "Authoritative Pricing",
    desc: "Server‑calculated pricing with zero tampering risk. Instant checkout for standard scopes; seamless automated formal quotations for enterprise volumes.",
  },
  {
    step: "03",
    title: "Client Workspace & Brief",
    desc: "Dedicated project portal. Submit brand parameters, target audiences, and upload assets to trigger production sprints.",
  },
  {
    step: "04",
    title: "Pin Annotation & Review",
    desc: "Click directly on preview drafts to place feedback pins with exact coordinates. Track revision rounds with contractual bounds.",
  },
  {
    step: "05",
    title: "Master ZIP Delivery",
    desc: "One‑click download of all production deliverables, vector SVGs, 4K renders, delivery manifests, and commercial buyout licenses.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-brand-border py-20 sm:py-32">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-highlight/30 bg-brand-highlight/10 px-4 py-1.5 text-xs font-mono text-brand-highlight">
              <span className="w-2 h-2 rounded-full bg-brand-highlight animate-pulse" />
              Creative Commerce Operating System &bull; 60 Canonical Services
            </div>
            <h1 className="max-w-5xl text-5xl sm:text-8xl font-bold tracking-wide text-brand-light leading-tight">
              Where High‑Velocity Creativity Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight via-brand-light to-brand-highlight">Operating Precision.</span>
            </h1>
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light mt-4">DESIGN. CREATE. PRODUCE. GROW.</h2>
            <p className="max-w-3xl text-base sm:text-xl text-brand-muted leading-relaxed">
              Freakin&apos;s Studio engineers bespoke brand architectures, 3D kinetic visuals, high‑performance digital platforms, and commercial creative assets for ambitious global enterprises.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button render={<Link href="/builder">Launch Package Builder &rarr;</Link>} size="lg" className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-sm px-8 h-12" />
              <Button render={<Link href="/services">Explore 60 Services</Link>} size="lg" variant="outline" className="font-mono text-sm h-12 border-brand-border hover:bg-brand-surface" />
              <Button render={<Link href="/portfolio">View Portfolio</Link>} size="lg" variant="ghost" className="font-mono text-sm h-12 text-brand-muted hover:text-brand-light" />
            </div>
            {/* Live Trust Metrics */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full border-t border-brand-border/40">
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-light">60</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Precision Services</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-highlight">100%</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Commercial Buyout</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-light">35%</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Rush Priority Option</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">BDT &amp; USD</div>
                <div className="font-mono text-xs text-brand-muted uppercase">Multi‑Currency Pay</div>
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
                <h2 className="text-3xl sm:text-5xl font-bold text-brand-light">Seven Specialized Creative Disciplines.</h2>
                <p className="text-sm sm:text-base text-brand-muted">
                  From mathematical logo mark geometry to real‑time 3D kinetic video and full‑stack Next.js platforms, our catalog covers every milestone of high‑growth brand evolution.
                </p>
              </div>
              <Button render={<Link href="/services">View All 60 Services &rarr;</Link>} variant="outline" className="font-mono text-xs self-start md:self-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORY_PILLARS.map((cat) => (
                <FeatureCard
                  key={cat.code}
                  code={cat.code}
                  title={cat.title}
                  desc={cat.desc}
                  highlight={cat.highlight}
                  count={cat.count}
                />
              ))}
              {/* Package Builder Card */}
              <div className="rounded-xl border border-brand-highlight/40 bg-gradient-to-br from-brand-highlight/10 via-brand-surface/40 to-transparent p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Badge variant="outline" className="font-mono text-xs border-brand-highlight text-brand-highlight bg-brand-highlight/10">Interactive Configurator</Badge>
                  <h3 className="text-lg font-bold text-brand-light">Custom Multi‑Service Bundles</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Combine services across categories, configure delivery speeds, add companion add‑ons, and obtain real‑time pricing with tamper‑proof validation.
                  </p>
                </div>
                <Button render={<Link href="/builder">Launch Package Builder &rarr;</Link>} className="w-full cyber-glow text-xs font-mono h-10" />
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW OPERATING ARCHITECTURE */}
        <section className="py-24 border-b border-brand-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="badge-mono text-brand-highlight">The Studio Engine</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-brand-light">Built as an Operating System, Not a Static Agency.</h2>
              <p className="text-sm sm:text-base text-brand-muted">
                Transparent milestones, server‑authoritative checkout, real‑time collaboration with pin‑annotations, and instant deliverable packaging.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-highlight/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-highlight/5 rounded-full blur-3xl pointer-events-none" />
              <span className="badge-mono text-brand-highlight">Start Your Sprint Today</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-brand-light tracking-tight max-w-2xl mx-auto">Ready to elevate your commercial identity?</h2>
              <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
                Launch the interactive Package Builder to calculate your project quote or browse our 60 canonical services.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Button render={<Link href="/builder">Build Your Custom Package</Link>} size="lg" className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-sm px-8 h-12" />
                <Button render={<Link href="/case-studies">Read Case Studies</Link>} size="lg" variant="outline" className="font-mono text-sm h-12 border-brand-border" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

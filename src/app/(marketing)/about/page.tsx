import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us — Freakin's Studio",
  description: "Our philosophy, creative operating system, and engineering approach to commercial brand production.",
};

export const instant = false;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">About Freakin&apos;s Studio</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light">
              Engineering the Future of Creative Production.
            </h1>
            <p className="text-base sm:text-xl text-brand-muted leading-relaxed">
              We founded Freakin&apos;s Studio on a single conviction: modern commercial brands require
              the velocity of software engineering combined with the aesthetic precision of a world-class design atelier.
            </p>
          </div>

          {/* Core Manifesto */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface/30 p-8 sm:p-12 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-brand-highlight">The Studio Manifesto</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light">
              Design. Create. Produce. Grow.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-brand-muted leading-relaxed">
              <p>
                Traditional creative agencies are slow, opaque, and built around billable hours rather than decisive market outcomes.
                Freelancer marketplaces are noisy, fragmented, and lack systemic quality assurance.
              </p>
              <p>
                Freakin&apos;s Studio is a <strong className="text-brand-light">Creative Commerce Operating System</strong>.
                We have codified our entire production capability into 60 canonical services across 7 specialized categories.
                Every engagement is governed by transparent turnaround schedules, server-authoritative pricing, interactive
                canvas proofing, and perpetual commercial buyout rights.
              </p>
            </div>
          </div>

          {/* Three Operating Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-6 space-y-3">
              <Badge variant="outline" className="badge-mono border-brand-highlight text-brand-highlight">
                01 &bull; Systemic Velocity
              </Badge>
              <h3 className="text-lg font-bold text-brand-light">Algorithmic Precision</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                By standardizing deliverable specifications, schema-driven project briefs, and design token pipelines,
                we eliminate friction and deliver senior-caliber creative output in days rather than months.
              </p>
            </div>

            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-6 space-y-3">
              <Badge variant="outline" className="badge-mono border-brand-highlight text-brand-highlight">
                02 &bull; Complete Ownership
              </Badge>
              <h3 className="text-lg font-bold text-brand-light">100% Commercial Buyout</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                We believe you should own what you pay for. Every completed package includes editable source files (SVG, AI, Figma, Blender, WAV)
                and an irrevocable worldwide commercial buyout license.
              </p>
            </div>

            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-6 space-y-3">
              <Badge variant="outline" className="badge-mono border-brand-highlight text-brand-highlight">
                03 &bull; Global Operations
              </Badge>
              <h3 className="text-lg font-bold text-brand-light">Dual-Currency Commerce</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Operating out of Dhaka with international reach, we natively support both Bangladeshi Taka (bKash Merchant Pay)
                and US Dollars (Stripe card checkout) with zero currency conversion penalty.
              </p>
            </div>
          </div>

          {/* Studio Leadership & Footprint */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-6">
              <div className="space-y-1">
                <span className="font-mono text-xs text-brand-highlight uppercase">Studio Footprint</span>
                <h3 className="text-2xl font-bold text-brand-light">Dhaka Headquarters &bull; Worldwide Delivery</h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Production Desk Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
              <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-surface/60 space-y-1">
                <div className="text-3xl font-bold text-brand-light">60</div>
                <div className="text-[10px] uppercase text-brand-muted">Canonical Services</div>
              </div>
              <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-surface/60 space-y-1">
                <div className="text-3xl font-bold text-brand-highlight">7</div>
                <div className="text-[10px] uppercase text-brand-muted">Creative Disciplines</div>
              </div>
              <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-surface/60 space-y-1">
                <div className="text-3xl font-bold text-emerald-400">24h</div>
                <div className="text-[10px] uppercase text-brand-muted">Rush SLA Support</div>
              </div>
              <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-surface/60 space-y-1">
                <div className="text-3xl font-bold text-brand-light">100%</div>
                <div className="text-[10px] uppercase text-brand-muted">Source Handover</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface to-brand-border/30 p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-light">
              Collaborate with Freakin&apos;s Studio
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto">
              Configure your next brand sprint in our interactive Package Builder or speak directly with our production desk.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/builder">Launch Package Builder</Link>}
                size="lg"
                className="cyber-glow"
              />
              <Button
                render={<Link href="/contact">Request Studio Consultation</Link>}
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

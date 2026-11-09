import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works — Freakin's Studio",
  description: "A transparent walkthrough of our 6-stage creative commerce operating system from discovery to final delivery.",
};

export const instant = false;

const STEPS = [
  {
    step: "01",
    phase: "Discovery & Configuration",
    title: "Configure in the 7-Step Package Builder",
    description: "Browse 60 canonical services across 7 categories. Select individual deliverables or bundle multi-discipline sprints. Tailor quantity, format options, and compatible companion add-ons.",
    features: ["Canonical 60-service catalog", "Category A–G cross-selection", "Automatic add-on compatibility mapping"],
  },
  {
    step: "02",
    phase: "Authoritative Pricing",
    phaseBadge: "Server-Calculated",
    title: "Instant Checkout or Enterprise Quotation",
    description: "Our server pricing engine calculates exact investment in BDT or USD with zero client-side tampering risk. Standard packages qualify for instant checkout; custom high-volume scopes receive an automated formal quotation within hours.",
    features: ["Dual currency: BDT & USD", "35% Rush Delivery option", "Dual quotation gating (>5 services or >৳150k)"],
  },
  {
    step: "03",
    phase: "Client Workspace",
    title: "Submit Your Schema-Driven Brief",
    description: "Once an order or quote is confirmed, your project is provisioned in the Client Workspace. Complete the tailored onboarding brief specifying brand parameters, color palettes, and reference files to immediately unlock production.",
    features: ["Service-specific brief schemas", "Direct file asset uploads", "Assigned project manager notification"],
  },
  {
    step: "04",
    phase: "Creative Production",
    title: "Senior Sprints & Milestone Progress",
    description: "Production is executed by senior brand architects, 3D kinetic artists, and software engineers. Monitor active tasks on your workspace checklist with live milestone status updates.",
    features: ["Real-time checklist progression", "Standard 2–5 day turnarounds", "24–48h expedited rush sprints"],
  },
  {
    step: "05",
    phase: "Visual Proofing",
    title: "Click-to-Pin Visual Feedback",
    description: "Review high-resolution draft previews directly inside your browser. Click anywhere on the artwork to place pin annotations with exact coordinate coordinates (X%, Y%), leave targeted notes, and request consolidated revisions.",
    features: ["Relative coordinate precision", "Contractual revision quota monitor", "Change-order gating when limits reach"],
  },
  {
    step: "06",
    phase: "Final Delivery",
    phaseBadge: "Perpetual Buyout",
    title: "One-Click Master ZIP Deliverable Download",
    description: "Upon client approval, click 'Download Master Delivery' to instantly generate a comprehensive ZIP archive containing scalable vector SVGs, 4K renders, delivery manifests, and commercial buyout licenses.",
    features: ["Real binary ZIP generation via JSZip", "100% source file handover", "Irrevocable commercial buyout license"],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">System Architecture</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light">
              How the Creative Commerce OS Works.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Experience the clarity of an operating system built specifically for high-velocity creative production.
              No vague estimates, no endless email chains, and no withheld source files.
            </p>
          </div>

          {/* 6 Step Interactive Flow */}
          <div className="space-y-12">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-brand-border bg-brand-surface/30 p-8 sm:p-10 space-y-6 hover:border-brand-highlight/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-brand-highlight">
                      {step.step}
                    </span>
                    <span className="text-brand-border font-mono">&bull;</span>
                    <span className="font-mono text-xs uppercase text-brand-muted tracking-wider">
                      {step.phase}
                    </span>
                  </div>
                  {step.phaseBadge && (
                    <Badge variant="outline" className="badge-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                      {step.phaseBadge}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-light">
                    {step.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed max-w-3xl">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {step.features.map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-xs font-mono px-3 py-1 rounded-md bg-brand-border/40 text-brand-light border border-brand-border/60"
                    >
                      &check; {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Matrix */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-12 space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-xs text-brand-highlight uppercase">The Studio Advantage</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-brand-light">
                Why Modern Ventures Choose Freakin&apos;s Studio
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted uppercase text-[11px]">
                    <th className="p-3">Feature</th>
                    <th className="p-3 text-brand-highlight">Freakin&apos;s Studio OS</th>
                    <th className="p-3">Traditional Agency</th>
                    <th className="p-3">Freelance Marketplaces</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  <tr>
                    <td className="p-3 font-semibold text-brand-light">Pricing Model</td>
                    <td className="p-3 text-emerald-400 font-bold">&check; Transparent &amp; Authoritative</td>
                    <td className="p-3 text-brand-muted">&cross; High Markups &amp; Vague Retainers</td>
                    <td className="p-3 text-brand-muted">&cross; Volatile &amp; Hidden Surcharges</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-light">Turnaround Time</td>
                    <td className="p-3 text-emerald-400 font-bold">&check; 2–5 Days (24h Rush SLA)</td>
                    <td className="p-3 text-brand-muted">&cross; 4–12 Weeks Average</td>
                    <td className="p-3 text-brand-muted">&cross; Unpredictable Delivery</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-light">Creative Proofing</td>
                    <td className="p-3 text-emerald-400 font-bold">&check; Canvas Pin-Annotations (X, Y)</td>
                    <td className="p-3 text-brand-muted">&cross; Messy Email PDF Threads</td>
                    <td className="p-3 text-brand-muted">&cross; Third-party Chat Attachments</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-light">Commercial Ownership</td>
                    <td className="p-3 text-emerald-400 font-bold">&check; 100% Perpetual Buyout + Sources</td>
                    <td className="p-3 text-brand-muted">&cross; Editable Files Extra Fee</td>
                    <td className="p-3 text-brand-muted">&cross; Licensing Ambiguity</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-light">Payment Gateways</td>
                    <td className="p-3 text-emerald-400 font-bold">&check; bKash Merchant &amp; Stripe (BDT/USD)</td>
                    <td className="p-3 text-brand-muted">&cross; Wire Transfer Only</td>
                    <td className="p-3 text-brand-muted">&cross; 20% Platform Fee Deductions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface to-brand-border/30 p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-light">
              Ready to start your next creative milestone?
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto">
              Launch our 7-step builder and obtain an authoritative project quote in under two minutes.
            </p>
            <div className="pt-2">
              <Button
                render={<Link href="/builder">Launch Package Builder &rarr;</Link>}
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

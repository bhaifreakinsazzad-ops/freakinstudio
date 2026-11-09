import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Revision Policy — Freakin's Studio",
  description: "Rules, quotas, pin-annotation workflows, and guidelines for creative revisions at Freakin's Studio.",
};

export const instant = false;

export default function RevisionPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-brand-border pb-6">
            <span className="badge-mono text-brand-highlight">Quality &amp; Precision</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-light">
              Creative Revision Policy &amp; SLA
            </h1>
            <p className="text-sm font-mono text-brand-muted">
              Effective Date: November 9, 2026 &bull; Strict Revision Quota &amp; Scope Bounds
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-brand-muted font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">1. Contractual Revision Quota</h2>
              <p>
                Each service in the Freakin&apos;s Studio 60-service catalog includes a specified number of revision rounds
                (typically 2 to 4 rounds, with an average standard of 3 rounds per package).
              </p>
              <p>
                A revision round consists of a consolidated batch of feedback submitted via the interactive Workspace Pin
                Annotation tool or formal feedback form. Fragmented or piece-meal requests across multiple channels (e.g. WhatsApp,
                email) will be compiled into a single unified sprint to preserve focus and timeline integrity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">2. In-Scope vs. Out-of-Scope Revisions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-brand-border bg-brand-surface/40 p-4 space-y-2">
                  <h3 className="font-mono text-xs font-semibold uppercase text-brand-highlight">In-Scope (Covered)</h3>
                  <ul className="text-xs list-disc pl-4 space-y-1 text-brand-muted">
                    <li>Typography adjustments, kerning, font weight changes</li>
                    <li>Color palette fine-tuning and contrast adjustments</li>
                    <li>Layout balance, hierarchy, and element positioning</li>
                    <li>3D camera angle adjustments within the existing scene</li>
                    <li>Audio timing, EQ balance, stem balance tweaks</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-brand-border bg-brand-surface/40 p-4 space-y-2">
                  <h3 className="font-mono text-xs font-semibold uppercase text-brand-danger">Out-of-Scope (Change Order)</h3>
                  <ul className="text-xs list-disc pl-4 space-y-1 text-brand-muted">
                    <li>Complete brand repositioning after brief approval</li>
                    <li>Altering approved brand names or phonetic direction</li>
                    <li>Requesting a completely new visual style or concept</li>
                    <li>Adding deliverable formats not specified in the original order</li>
                    <li>Substantive copy or messaging rewrites post-signoff</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">3. Additional Revision Rounds</h2>
              <p>
                Should a client exhaust all included revision rounds, additional rounds can be purchased seamlessly
                via the workspace at standard studio rates (৳6,000 BDT or $50 USD per additional design sprint).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">4. Turnaround Time for Revisions</h2>
              <p>
                Standard revisions are completed within 2 to 3 business days. Projects under Rush Delivery protocol
                receive prioritized 24–48 hour turnaround on all revision sprints.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <Link href="/refund-policy" className="hover:text-brand-light transition-colors">
              &larr; Refund Policy
            </Link>
            <Link href="/licensing-policy" className="hover:text-brand-light transition-colors">
              Commercial Buyout &amp; Licensing &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

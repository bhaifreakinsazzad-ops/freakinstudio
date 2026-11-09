import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Refund Policy — Freakin's Studio",
  description: "Clarity on cancellation, milestone refunds, and creative production guarantees at Freakin's Studio.",
};

export const instant = false;

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-brand-border pb-6">
            <span className="badge-mono text-brand-highlight">Financial Fair Exchange</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-light">
              Cancellation &amp; Refund Policy
            </h1>
            <p className="text-sm font-mono text-brand-muted">
              Effective Date: November 9, 2026 &bull; Studio Production Standards
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-brand-muted font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">1. Tailored Creative Services Nature</h2>
              <p>
                Due to the bespoke nature of creative design, kinetic 3D modeling, audio engineering, and custom software
                development, all work involves committed senior specialist time and compute infrastructure. As such,
                refunds are structured around production milestones.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">2. Cancellation Prior to Production Commencing</h2>
              <p>
                If an order is cancelled within 24 hours of checkout and prior to the submission of the Project Onboarding
                Brief or commencement of design research, a full 100% refund will be issued (less third-party merchant
                gateway processing fees).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">3. Milestone-Based Refund Tiers</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-brand-light">Initial Concept Phase (Round 1):</strong> If initial design directions
                  do not align with the brief despite comprehensive discussion, a 50% pro-rata refund may be requested prior to
                  entering Round 2.
                </li>
                <li>
                  <strong className="text-brand-light">In-Production / Revision Rounds (Round 2+):</strong> Once revisions have
                  been requested and executed, work is non-refundable. Our studio commits to exhausting the contracted revision rounds
                  to achieve satisfactory outcomes.
                </li>
                <li>
                  <strong className="text-brand-light">Approved &amp; Delivered:</strong> Once deliverables are approved and the master
                  ZIP archive is generated/downloaded, transactions are strictly non-refundable.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">4. Dispute Resolution &amp; Escrow</h2>
              <p>
                In the rare event of irreconcilable creative differences, our Executive Creative Director will conduct an
                audit of brief adherence. Should the studio fail to satisfy explicit contractual deliverables, a credit
                or full refund will be granted.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <Link href="/terms" className="hover:text-brand-light transition-colors">
              &larr; Terms of Service
            </Link>
            <Link href="/revision-policy" className="hover:text-brand-light transition-colors">
              Revision Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service — Freakin's Studio",
  description: "Terms and conditions governing creative service contracts, milestone delivery, and commercial operation.",
};

export const instant = false;

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-brand-border pb-6">
            <span className="badge-mono text-brand-highlight">Commercial Governance</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-light">
              Terms of Service &amp; Studio Agreements
            </h1>
            <p className="text-sm font-mono text-brand-muted">
              Effective Date: November 9, 2026 &bull; Creative Commerce OS Directives
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-brand-muted font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">1. Agreement to Terms</h2>
              <p>
                By commissioning creative packages via the Package Builder, accepting a formal Quotation, or logging
                into the Client Workspace, you agree to be bound by these Terms of Service. If you are entering into
                this agreement on behalf of a company or organization, you represent that you hold proper signing authority.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">2. Quotation Gating &amp; Authoritative Pricing</h2>
              <p>
                Studio pricing is calculated authoritatively on our secure servers. Self-service checkout is available
                for standard configurations up to 5 services or ৳150,000 BDT / $1,250 USD. Orders exceeding these
                bounds or containing custom enterprise scopes require a Formal Quotation issued by our Production Desk.
              </p>
              <p>
                Issued quotes remain valid for 14 calendar days from the timestamp of issue.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">3. Creative Production &amp; Milestones</h2>
              <p>
                Production commences immediately upon verified receipt of payment or initial deposit and submission of the
                required Project Onboarding Brief. Production timelines are measured in business days (Sunday–Thursday
                for BDT operations, Monday–Friday for international accounts).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">4. Rush Delivery Protocol</h2>
              <p>
                When Rush Delivery is selected (35% priority surcharge), our studio reserves dedicated senior design
                sprints and expedites delivery by 40–50%. The client agrees to provide feedback on milestone reviews within
                24 hours to maintain the expedited production schedule.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">5. Delivery &amp; Archival</h2>
              <p>
                Deliverables are deemed accepted upon client clicking &quot;Approve &amp; Finalize&quot; in the workspace or 10 business
                days after milestone submission if no feedback is provided. Approved assets are packaged into master ZIP
                archives containing vector SVGs, high-resolution renders, and license agreements.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <Link href="/revision-policy" className="hover:text-brand-light transition-colors">
              &larr; Revision Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-brand-light transition-colors">
              Refund Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

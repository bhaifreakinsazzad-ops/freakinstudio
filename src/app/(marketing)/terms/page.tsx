import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service — Freakin's Studio",
  description:
    "Terms and conditions governing creative service contracts, hourly scoped quotes, 10-minute express micro-edits, and milestone delivery.",
};

export const instant = false;

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-[#232528] pb-6">
            <span className="badge-mono text-[#D9BD81]">
              Commercial Governance
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F4EF]">
              Terms of Service &amp; Studio Agreements
            </h1>
            <p className="text-sm font-mono text-[#F6F4EF]/65">
              Effective Date: November 20, 2026 &bull; Creative Office OS 2.0
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-[#F6F4EF]/75 font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                1. Agreement to Terms
              </h2>
              <p>
                By submitting a Smart Brief, accepting a formal Studio
                Quotation, or accessing the Client Office, you agree to be bound
                by these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                2. Hourly Scoped Pricing &amp; 5% Launch Promotion
              </h2>
              <p>
                Studio pricing is calculated on our servers across our 13
                canonical services, 15 scoped variants, 5 commercial bundles,
                and 14 compatible add-ons. The 5% Launch Promotion applies once
                to eligible subtotals booked between 20 November 2026 and 15
                December 2026 (Asia/Dhaka timezone).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                3. 10-Minute Express Micro-Edit Rule
              </h2>
              <p>
                10-Minute Express Delivery applies strictly to pre-checked
                single-file micro-edits on SRV-02, SRV-05, and SRV-13 where open
                working source files are provided upfront and a live studio
                slot is confirmed by a Human Creative Lead.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                4. Human + SI Governance &amp; Delivery
              </h2>
              <p>
                Synthetic Intelligence (SI) assistants assist with brief
                structuring and draft task checklists, but cannot approve
                quotes, deadlines, or final deliverables. All commercial
                commitments and final asset releases are signed off by a Human
                Creative Lead.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#232528] flex items-center justify-between text-xs font-mono text-[#F6F4EF]/65">
            <Link
              href="/revision-policy"
              className="hover:text-[#F6F4EF] transition-colors"
            >
              &larr; Revision Policy
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-[#F6F4EF] transition-colors"
            >
              Refund Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Revision Policy (2 Consolidated Rounds) — Freakin's Studio",
  description:
    "Rules, 2-revision consolidated quota, pin-annotation proofing workflows, and ADD-04 extension rules at Freakin's Studio.",
};

export const instant = false;

export default function RevisionPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-[#232528] pb-6">
            <span className="badge-mono text-[#D9BD81]">
              Quality &amp; Precision Governance
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F4EF]">
              2 Consolidated Revision Policy
            </h1>
            <p className="text-sm font-mono text-[#F6F4EF]/65">
              Effective Date: November 20, 2026 &bull; Applies Across All 13 Core
              Services &amp; 5 Bundles
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-[#F6F4EF]/75 font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                1. Standard 2 Consolidated Revision Rounds
              </h2>
              <p>
                Every service in the Freakin&apos;s Studio 13-service canonical
                catalog and all 5 commercial bundles include{" "}
                <strong className="text-[#D9BD81]">
                  2 consolidated revision rounds
                </strong>
                .
              </p>
              <p>
                A consolidated revision round consists of a structured batch of
                coordinate pins and notes submitted together on the Client
                Office Proofing Canvas.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F6F4EF] font-mono">
                2. In-Scope Refinements vs. New Scope
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#232528] bg-[#121315] p-4 space-y-2">
                  <h3 className="font-mono text-xs font-semibold uppercase text-[#D9BD81]">
                    In-Scope (Covered in 2 Rounds)
                  </h3>
                  <ul className="text-xs list-disc pl-4 space-y-1 text-[#F6F4EF]/75">
                    <li>Typography adjustments, kerning, and weight balance</li>
                    <li>Color palette fine-tuning and contrast calibration</li>
                    <li>Layout alignment, spacing, and visual hierarchy</li>
                    <li>Motion pacing and caption timing adjustments</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[#232528] bg-[#121315] p-4 space-y-2">
                  <h3 className="font-mono text-xs font-semibold uppercase text-amber-400">
                    Additional Round or Scope Extension
                  </h3>
                  <ul className="text-xs list-disc pl-4 space-y-1 text-[#F6F4EF]/75">
                    <li>
                      Need a 3rd revision cycle? Select{" "}
                      <strong className="text-[#F6F4EF]">ADD-04</strong>{" "}
                      (Additional Consolidated Revision Round, +1.5h scoped).
                    </li>
                    <li>
                      Need an additional aspect ratio? Select{" "}
                      <strong className="text-[#F6F4EF]">ADD-02</strong> (+1h
                      scoped).
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-[#232528] flex items-center justify-between text-xs font-mono text-[#F6F4EF]/65">
            <Link
              href="/refund-policy"
              className="hover:text-[#F6F4EF] transition-colors"
            >
              &larr; Refund Policy
            </Link>
            <Link
              href="/licensing-policy"
              className="hover:text-[#F6F4EF] transition-colors"
            >
              Commercial Licensing &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

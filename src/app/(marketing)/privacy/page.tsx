import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Freakin's Studio",
  description: "How Freakin's Studio collects, protects, and governs client assets, payment data, and production briefs.",
};

export const instant = false;

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-brand-border pb-6">
            <span className="badge-mono text-brand-highlight">Legal & Compliance</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-light">
              Privacy & Data Governance Policy
            </h1>
            <p className="text-sm font-mono text-brand-muted">
              Effective Date: November 9, 2026 &bull; Version 2.4 &bull; Freakin&apos;s Studio Ops
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-brand-muted font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">1. Operational Scope & Overview</h2>
              <p>
                Freakin&apos;s Studio (&quot;Studio&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides high-velocity creative production,
                brand systems engineering, 3D kinetic visuals, and full-stack marketing platforms. This policy
                governs how our Creative Commerce OS processes client identity, proprietary briefing tokens, uploaded vector
                and raster source files, and checkout transaction identifiers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">2. Creative Assets & Confidentiality</h2>
              <p>
                All creative source material, raw footage, 3D assets, Figma prototypes, and strategic briefs provided
                during the project onboarding and revision cycles remain your exclusive intellectual property and
                confidential material.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Production assets are stored in isolated tenant object storage with cryptographic Row Level Security (RLS).</li>
                <li>Files are never ingested into public foundational AI training datasets.</li>
                <li>Designers and engineers access files under mutual non-disclosure obligations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">3. Payment & Transaction Security</h2>
              <p>
                We do not store or process raw credit card numbers or mobile banking PINs on our servers. All transactions
                are processed through certified merchant gateways:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-brand-light">bKash Merchant Pay</strong> (PGW API with TLS 1.3 encryption and OTP verification).</li>
                <li><strong className="text-brand-light">Stripe Payments</strong> (PCI-DSS Level 1 compliant tokenized card processing).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">4. Data Retention & Archival</h2>
              <p>
                Approved project deliverables remain accessible in your Client Workspace for a minimum of 365 days
                following project closure. Automated ZIP packaging allows clients to download complete source manifests at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">5. Contact & Privacy Officer</h2>
              <p>
                For data export requests, non-disclosure agreement execution, or deletion inquiries, contact our Studio Data Officer at{" "}
                <a href="mailto:privacy@freakinstudio.com" className="text-brand-highlight underline">
                  privacy@freakinstudio.com
                </a>.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <Link href="/terms" className="hover:text-brand-light transition-colors">
              Terms of Service &rarr;
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

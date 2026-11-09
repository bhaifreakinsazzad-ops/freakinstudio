import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Commercial Licensing & Buyout Policy — Freakin's Studio",
  description: "Worldwide commercial rights, source code ownership, intellectual property transfer, and portfolio rights.",
};

export const instant = false;

export default function LicensingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3 border-b border-brand-border pb-6">
            <span className="badge-mono text-brand-highlight">Intellectual Property</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-light">
              Commercial Buyout &amp; Licensing Agreement
            </h1>
            <p className="text-sm font-mono text-brand-muted">
              Effective Date: November 9, 2026 &bull; Perpetual Commercial Assignment
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-brand-muted font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">1. Full Commercial Ownership Transfer</h2>
              <p>
                Upon final client approval and full settlement of payment for any creative package, Freakin&apos;s Studio
                irrevocably transfers and assigns all worldwide right, title, and interest in the approved custom deliverables
                to the client.
              </p>
              <p>
                This includes perpetual, unrestricted rights to use, modify, distribute, reproduce, display, and commercially
                exploit the final designs across all digital, broadcast, and print media without additional royalty claims.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">2. Master Source Files &amp; Packaging</h2>
              <p>
                Unlike traditional agencies that withhold editable working files, Freakin&apos;s Studio packages complete
                production-grade source archives directly into every completed project ZIP download:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-brand-light">Branding &amp; Graphic Design:</strong> Scalable Vector (SVG), AI/EPS, and master PDF assets.</li>
                <li><strong className="text-brand-light">Digital Systems &amp; Web:</strong> Figma tokens, component trees, and clean TypeScript/React source code under MIT/Commercial buyout.</li>
                <li><strong className="text-brand-light">3D &amp; Motion:</strong> 4K ProRes 4444 video files, Blender / Cinema4D scene manifests, and optimized GLB/glTF web assets.</li>
                <li><strong className="text-brand-light">Audio &amp; Sonic Branding:</strong> 24-bit 96kHz master WAV files and isolated stem tracks.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">3. Font &amp; Stock Media Third-Party Licenses</h2>
              <p>
                Freakin&apos;s Studio prioritizes commercial open-source fonts (e.g., Google Fonts, Fontshare) and proprietary
                custom typography. Where commercial desktop/web font licenses are required by a brand, we specify the exact font
                foundry tiers required for the client&apos;s internal legal licensing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-brand-light font-mono">4. Studio Portfolio &amp; Self-Promotion Rights</h2>
              <p>
                Unless a specific Enterprise Non-Disclosure Agreement (NDA) or Private Commission add-on is executed,
                Freakin&apos;s Studio reserves the standard industry right to showcase approved deliverables in our portfolio,
                case studies, award submissions, and social studio showcases.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <Link href="/privacy" className="hover:text-brand-light transition-colors">
              &larr; Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-light transition-colors">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

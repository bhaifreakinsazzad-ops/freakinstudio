import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works — Freakin's Studio Creative Office OS 2.0",
  description:
    "Discover how our B+C+D architecture connects 6 free browser-native tools, Puter-free Studio AI direction, and 13 hourly-scoped human creative services.",
};

export const instant = false;

const STEPS = [
  {
    step: "01",
    phase: "Layer B — Instant Free Utility",
    title: "Use 6 Browser-Native Free Creative Tools (No Login Required)",
    description:
      "Resize and compress images, extract deterministic color palettes, verify WCAG 2.2 contrast ratios, generate offline Markdown briefs, and inspect 3D packaging mockups right in your browser with zero file uploads.",
    features: [
      "100% local HTML5 Canvas execution",
      "No account or credit card required",
      "Direct transition into human services",
    ],
  },
  {
    step: "02",
    phase: "Layer C & D — Sponsored AI & Micro-Kits",
    title: "Generate Direction with Puter-Free Studio AI or ৳49/৳99/৳199 Micro-Kits",
    description:
      "Test hooks, bilingual captions, and creative briefs using our server-guarded Studio AI Gateway (3 free trials/day, never forcing a Puter login) or preview our 3 structured AI Micro-Kits.",
    features: [
      "Zero visitor Puter login prompt",
      "Emergency kill-switch & daily budget cap",
      "Transparent output & exclusion contracts",
    ],
  },
  {
    step: "03",
    phase: "Canonical Catalog & Hourly Estimator",
    title: "Scope Across 13 Core Services, 15 Variants, 5 Bundles & 14 Add-ons",
    description:
      "Select from 4 focused disciplines with transparent hourly scope estimates, 2 consolidated revision rounds, and an automatic 5% Launch Promotion (20 Nov – 15 Dec 2026 Asia/Dhaka).",
    features: [
      "4 Disciplines & 13 Core Services",
      "15 Scoped Variants & 14 Add-ons",
      "10-Min Express preflight for micro-edits",
    ],
  },
  {
    step: "04",
    phase: "Human + SI Connected Workflow",
    title: "Track Production from Smart Brief to Proofing & Final Delivery",
    description:
      "Every project moves through an auditable 8-stage rail (Request → Quote → Accepted → Assigned → Production → Proof → Revision → Approved → Delivered) with coordinate pin proofing and Human Creative Lead sign-off.",
    features: [
      "Interactive coordinate pin proofing",
      "2 consolidated revision counter",
      "Gated SI Assistant proposals",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-5xl space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-[#D9BD81]">
              B + C + D Value Engine &bull; Human + SI Workflow
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF]">
              How the Creative Office OS Works.
            </h1>
            <p className="text-base sm:text-lg text-[#F6F4EF]/70 leading-relaxed">
              From zero-login browser tools to human art-directed commercial
              deliverables, every stage is transparent, auditable, and free of
              fabricated metrics.
            </p>
          </div>

          <div className="space-y-8">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-[#232528] bg-[#121315] p-8 space-y-5 hover:border-[#D9BD81]/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232528] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-[#D9BD81]">
                      {step.step}
                    </span>
                    <span className="text-[#232528] font-mono">&bull;</span>
                    <span className="font-mono text-xs uppercase text-[#D9BD81] tracking-wider">
                      {step.phase}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F6F4EF]">
                    {step.title}
                  </h2>
                  <p className="text-sm text-[#F6F4EF]/75 leading-relaxed max-w-3xl">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {step.features.map((feat) => (
                    <span
                      key={feat}
                      className="text-xs font-mono px-3 py-1 rounded-md bg-[#090A0A] text-[#F6F4EF] border border-[#232528]"
                    >
                      &check; {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F6F4EF]">
              Ready to try the Creative Office OS?
            </h2>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/tools">Try 6 Free Browser Tools</Link>}
                size="lg"
                variant="outline"
                className="border-[#232528] text-[#F6F4EF] font-mono text-xs"
              />
              <Button
                render={<Link href="/builder">Launch 3-Step Smart Brief &rarr;</Link>}
                size="lg"
                className="cyber-glow bg-[#D9BD81] text-[#090A0A] font-semibold font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

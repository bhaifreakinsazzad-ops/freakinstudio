import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Freakin's Studio",
  description: "Clear answers on pricing, turnaround times, commercial buyout licensing, revision limits, and payment methods.",
};

export const instant = false;

interface FAQItem {
  q: string;
  a: string;
  category: "Services & Scope" | "Pricing & Payments" | "Revisions & Proofing" | "Licensing & Handover";
}

const FAQS: FAQItem[] = [
  {
    category: "Services & Scope",
    q: "How many creative services do you offer?",
    a: "Freakin's Studio maintains a strict canonical catalog of exactly 60 services organized across seven specialized disciplines: Identity Systems (A), Visual Design (B), Digital Experience (C), Content & Media (D), Advertising (E), AI-Powered & 3D (F), and Corporate Communications (G).",
  },
  {
    category: "Services & Scope",
    q: "Can I bundle multiple services across different categories?",
    a: "Yes. Our 7-step interactive Package Builder allows you to combine services from any discipline into a single unified sprint (e.g. Logo Identity + Next.js Marketing Web Platform + 3D Product Teaser Video).",
  },
  {
    category: "Services & Scope",
    q: "What companion add-ons are available?",
    a: "Each service features tailored add-ons such as Editable Working Source Files, Extra Concept Variations, Expedited Review Sprints, Additional Platform Aspect Ratios, and Extended Commercial Buyouts.",
  },
  {
    category: "Pricing & Payments",
    q: "How is pricing calculated?",
    a: "Pricing is calculated authoritatively by our server pricing engine based on approved base rates, quantity bounds, companion add-ons, and delivery priority. This eliminates client-side price tampering.",
  },
  {
    category: "Pricing & Payments",
    q: "What payment methods are supported?",
    a: "We natively support dual currencies: Bangladeshi Taka (BDT) via bKash Merchant Pay and international payments in US Dollars (USD) via Stripe Card Checkout.",
  },
  {
    category: "Pricing & Payments",
    q: "When is a formal quotation required instead of instant checkout?",
    a: "Self-service instant checkout is available for standard packages up to 5 services or ৳150,000 BDT / $1,250 USD. Orders exceeding these limits or involving custom enterprise scopes are routed to our Quote Desk for custom sprint planning.",
  },
  {
    category: "Pricing & Payments",
    q: "Do quotes expire?",
    a: "Formal quotations issued by our production desk remain binding and valid for 14 calendar days from the moment of issue.",
  },
  {
    category: "Revisions & Proofing",
    q: "How many revision rounds are included?",
    a: "Each service specifies an included revision quota (typically 2 to 5 rounds, with an average of 3 rounds per package). Our Client Workspace actively monitors used vs. remaining rounds.",
  },
  {
    category: "Revisions & Proofing",
    q: "How does visual proofing work?",
    a: "Our Client Workspace features an interactive canvas proofing tool. You click directly on the draft image or video preview to place feedback pins at exact relative coordinates (X%, Y%) and leave precise notes.",
  },
  {
    category: "Revisions & Proofing",
    q: "What happens if I need revisions beyond the included quota?",
    a: "Additional revision sprints can be requested directly in the workspace at standard studio rates (৳6,000 BDT or $50 USD per sprint) without interrupting active production.",
  },
  {
    category: "Licensing & Handover",
    q: "Do I own the final deliverables?",
    a: "Yes, 100%. Upon full payment and project approval, Freakin's Studio irrevocably transfers all worldwide commercial rights to you under our Commercial Buyout & Licensing Agreement.",
  },
  {
    category: "Licensing & Handover",
    q: "Are source files included?",
    a: "Yes. Every approved project generates a real ZIP binary archive containing vector SVGs, high-resolution renders, technical specs JSON, delivery manifests, and commercial buyout licenses.",
  },
  {
    category: "Services & Scope",
    q: "What is Rush Delivery (+35%)?",
    a: "Rush Delivery reserves dedicated senior specialists and expedites turnaround times by 40–50% (often within 24–48 hours for standard sprints) for a 35% priority surcharge.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">Frequently Asked Questions</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light">
              Everything You Need to Know.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Transparent answers regarding our creative production standards, pricing integrity,
              revision governance, and commercial buyout terms.
            </p>
          </div>

          {/* Categorized FAQs */}
          <div className="space-y-12">
            {["Services & Scope", "Pricing & Payments", "Revisions & Proofing", "Licensing & Handover"].map((cat) => {
              const items = FAQS.filter((f) => f.category === cat);
              return (
                <div key={cat} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brand-border/60 pb-3">
                    <span className="w-2 h-2 rounded-full bg-brand-highlight" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-brand-light">
                      {cat}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-brand-border bg-brand-surface/30 p-6 space-y-2 hover:border-brand-highlight/30 transition-colors"
                      >
                        <h3 className="text-base font-bold text-brand-light">
                          {item.q}
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct CTA */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface to-brand-border/30 p-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-brand-light">
              Have a question not listed here?
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto">
              Contact our production desk directly or configure your custom scope in our interactive builder.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/contact">Speak with Production Desk</Link>}
                size="lg"
                variant="outline"
              />
              <Button
                render={<Link href="/builder">Launch Package Builder</Link>}
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

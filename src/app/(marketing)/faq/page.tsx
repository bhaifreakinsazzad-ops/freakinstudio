import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Freakin's Studio",
  description:
    "Clear answers on our 13 core services, hourly scoped pricing, 5% launch promotion, 10-minute express rules, and 2 consolidated revisions.",
};

export const instant = false;

interface FAQItem {
  q: string;
  a: string;
  category:
    | "Services & Scope"
    | "Pricing & Payments"
    | "Revisions & Proofing"
    | "Licensing & Handover";
}

const FAQS: FAQItem[] = [
  {
    category: "Services & Scope",
    q: "How many creative services do you offer?",
    a: "Freakin's Studio maintains an approved canonical catalog of 13 core creative services organized across 4 disciplines: Brand & Visual Identity (DISC-01), Social Media & Campaign Creative (DISC-02), Commercial Graphic & Print Design (DISC-03), and Motion, Reels & Short-Form Video (DISC-04), supported by 15 scoped variants, 5 commercial bundles, and 14 compatible add-ons.",
  },
  {
    category: "Services & Scope",
    q: "What are the 5 Commercial Bundles?",
    a: "We offer 5 multi-service production pods: Brand Launch Starter Pack (BND-01), Social Growth Monthly Pulse (BND-02), Performance Ad Campaign Pod (BND-03), Retail Packaging & Shelf Suite (BND-04), and Founder Pitch & Fundraising Kit (BND-05).",
  },
  {
    category: "Services & Scope",
    q: "What is the 10-Minute Express Delivery Rule?",
    a: "10-Minute Express Delivery is strictly available for pre-checked single-file micro-edits on SRV-02 (Logo Vector Cleanup), SRV-05 (Social Single Post text/crop tweak), and SRV-13 (Motion end-slate update) when open working source files are ready and a live studio desk slot is confirmed.",
  },
  {
    category: "Pricing & Payments",
    q: "How is hourly scoped pricing calculated?",
    a: "Pricing is calculated authoritatively on our server from scoped hours (Base Service Hours × Scoped Variant Multiplier + Compatible Add-on Hours) multiplied by our canonical hourly rate (৳1,500 BDT/h or $15 USD/h).",
  },
  {
    category: "Pricing & Payments",
    q: "How does the 5% Launch Promotion work?",
    a: "A 5% launch discount applies automatically once to eligible subtotals during our official launch window from 20 November 2026 to 15 December 2026 (Asia/Dhaka timezone, UTC+6).",
  },
  {
    category: "Pricing & Payments",
    q: "What payment methods are supported?",
    a: "We natively support Bangladeshi Taka (BDT) via SSLCommerz (bKash, Nagad, local cards) and US Dollars (USD) via Stripe after server-verified webhook confirmation.",
  },
  {
    category: "Revisions & Proofing",
    q: "How many revision rounds are included?",
    a: "Every service and commercial bundle includes 2 consolidated revision rounds. Additional revision rounds can be added via ADD-04 (+1.5h scoped).",
  },
  {
    category: "Revisions & Proofing",
    q: "How does visual proofing and Human + SI governance work?",
    a: "Our Client Office features an interactive coordinate pin proofing canvas. SI Assistants can help organize feedback checklists and timeline drafts, while Human Creative Leads review and approve all final creative work, pricing, and delivery.",
  },
  {
    category: "Licensing & Handover",
    q: "Do I own the final deliverables?",
    a: "Yes. Upon full payment settlement and final project approval, Freakin's Studio transfers commercial usage rights for the agreed deliverables.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-[#D9BD81]">
              Frequently Asked Questions
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF]">
              Transparent Studio Governance.
            </h1>
            <p className="text-base sm:text-lg text-[#F6F4EF]/70 leading-relaxed">
              Clear answers regarding our 13 core services, hourly scoped
              pricing, 5% launch promo window, 10-minute express micro-edit
              rules, and 2 consolidated revisions.
            </p>
          </div>

          <div className="space-y-12">
            {[
              "Services & Scope",
              "Pricing & Payments",
              "Revisions & Proofing",
              "Licensing & Handover",
            ].map((cat) => {
              const items = FAQS.filter((f) => f.category === cat);
              return (
                <div key={cat} className="space-y-6">
                  <div className="border-b border-[#232528] pb-3">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#D9BD81]">
                      {cat}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#232528] bg-[#121315] p-6 space-y-2 hover:border-[#D9BD81]/40 transition-colors"
                      >
                        <h3 className="text-base font-bold text-[#F6F4EF]">
                          {item.q}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#F6F4EF]/75 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[#F6F4EF]">
              Have a question not listed here?
            </h3>
            <p className="text-xs sm:text-sm text-[#F6F4EF]/70 max-w-xl mx-auto">
              Message our official WhatsApp desk (+8801778307704) or configure
              your custom scope in the Smart Brief Builder.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/contact">Contact Studio Desk</Link>}
                size="lg"
                variant="outline"
                className="border-[#232528] text-[#F6F4EF] font-mono text-xs"
              />
              <Button
                render={<Link href="/builder">Launch Smart Brief</Link>}
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

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ContactFormClient } from "./contact-form-client";
import { BRAND_TOKENS } from "@/lib/designTokens";

export const metadata: Metadata = {
  title: "Contact & Studio Desk — Freakin's Studio",
  description:
    "Connect with Freakin's Studio via official WhatsApp (+8801778307704), email (bhaifreakinstudio@gmail.com), or submit a structured studio consultation brief.",
};

export const instant = false;

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-[#D9BD81]">
              Verified Official Studio Desk
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF] text-balance">
              Let&apos;s Scope Your Creative Production.
            </h1>
            <p className="text-base sm:text-lg text-[#F6F4EF]/70 leading-relaxed">
              Whether you need a single hourly-scoped creative deliverable from
              our 13 canonical services or one of our 5 commercial bundles, our
              Dhaka production desk is ready to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 rounded-2xl border border-[#232528] bg-[#121315] p-8 sm:p-10 space-y-6">
              <h2 className="text-xl font-bold text-[#F6F4EF] font-mono">
                Request Studio Consultation
              </h2>
              <ContactFormClient />
            </div>

            {/* Direct Verified Studio Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[#232528] bg-[#121315] p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-bold text-[#D9BD81] font-mono uppercase tracking-wider">
                  Verified Official Contacts
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1 border-b border-[#232528] pb-3">
                    <span className="text-[#F6F4EF]/50 uppercase text-[10px]">
                      Official WhatsApp Production Desk
                    </span>
                    <p className="text-[#D9BD81] font-semibold text-sm">
                      <a
                        href={BRAND_TOKENS.contacts.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {BRAND_TOKENS.contacts.whatsappDisplay}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1 border-b border-[#232528] pb-3">
                    <span className="text-[#F6F4EF]/50 uppercase text-[10px]">
                      Official Studio Email
                    </span>
                    <p className="text-[#F6F4EF] font-semibold">
                      <a
                        href={`mailto:${BRAND_TOKENS.contacts.email}`}
                        className="hover:text-[#D9BD81] transition-colors"
                      >
                        {BRAND_TOKENS.contacts.email}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1 border-b border-[#232528] pb-3">
                    <span className="text-[#F6F4EF]/50 uppercase text-[10px]">
                      Official Web Domain
                    </span>
                    <p className="text-[#F6F4EF] font-semibold">
                      <a
                        href={BRAND_TOKENS.contacts.websiteHref}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D9BD81] transition-colors"
                      >
                        {BRAND_TOKENS.contacts.website}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#F6F4EF]/50 uppercase text-[10px]">
                      Studio Operations &amp; Promo Window
                    </span>
                    <p className="text-[#F6F4EF] font-semibold">
                      Dhaka, Bangladesh (Asia/Dhaka, UTC+6)
                    </p>
                    <p className="text-[#D9BD81] text-[11px]">
                      5% Launch Window Promo: 20 Nov &ndash; 15 Dec 2026
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Brief Builder Quick Card */}
              <div className="rounded-2xl border border-[#D9BD81]/30 bg-gradient-to-br from-[#D9BD81]/10 to-[#121315] p-6 space-y-3">
                <h4 className="font-mono text-xs uppercase font-bold text-[#D9BD81]">
                  3-Step Smart Brief &amp; Hourly Estimator
                </h4>
                <p className="text-xs text-[#F6F4EF]/75 leading-relaxed">
                  Want an immediate hourly scope estimate across our 13 core
                  services, 15 variants, and 14 add-ons? Launch the 3-step Smart
                  Brief Builder.
                </p>
                <Button
                  render={<Link href="/builder">Launch Smart Brief &rarr;</Link>}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-mono border-[#D9BD81]/40 text-[#D9BD81]"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

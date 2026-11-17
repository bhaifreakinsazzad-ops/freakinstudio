import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ContactFormClient } from "./contact-form-client";

export const metadata: Metadata = {
  title: "Contact & Consultation — Freakin's Studio",
  description:
    "Get in touch with our studio production desk, schedule an executive consultation, or inquire about custom enterprise packages.",
};

export const instant = false;

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">Studio Contact Desk</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light text-balance">
              Let&apos;s Build Something Iconic.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Have an enterprise inquiry, custom multi-discipline campaign, or urgent rush production requirement?
              Our studio production desk is ready to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-10 space-y-6">
              <h2 className="text-xl font-bold text-brand-light font-mono">
                Request Studio Consultation
              </h2>
              <ContactFormClient />
            </div>

            {/* Direct Studio Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-brand-border bg-brand-surface/30 p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-bold text-brand-light font-mono uppercase tracking-wider">
                  Direct Studio Inquiries
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1 border-b border-brand-border/60 pb-3">
                    <span className="text-brand-muted uppercase text-[10px]">Production &amp; Scoping Desk</span>
                    <p className="text-brand-light font-semibold">ops@freakinstudio.com</p>
                  </div>

                  <div className="space-y-1 border-b border-brand-border/60 pb-3">
                    <span className="text-brand-muted uppercase text-[10px]">Commercial Billing &amp; Contracts</span>
                    <p className="text-brand-light font-semibold">billing@freakinstudio.com</p>
                  </div>

                  <div className="space-y-1 border-b border-brand-border/60 pb-3">
                    <span className="text-brand-muted uppercase text-[10px]">Studio Headquarters</span>
                    <p className="text-brand-light font-semibold">Dhaka, Bangladesh</p>
                    <p className="text-brand-muted text-[11px]">
                      Gulshan Commercial District &bull; Global Remote Operations
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-brand-muted uppercase text-[10px]">Operating Hours</span>
                    <p className="text-brand-light font-semibold">Sunday &ndash; Thursday: 09:00 &ndash; 20:00 (BST)</p>
                    <p className="text-brand-muted text-[11px]">
                      Prioritized coverage for Active Rush Protocol Sprints
                    </p>
                  </div>
                </div>
              </div>

              {/* Package Builder Quick Card */}
              <div className="rounded-2xl border border-brand-highlight/30 bg-gradient-to-br from-brand-highlight/10 to-brand-surface/40 p-6 space-y-3">
                <h4 className="font-mono text-xs uppercase font-bold text-brand-highlight">
                  Instant Self-Service Option
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Want an immediate authoritative cost estimate without waiting? Configure your project in our 7-step builder.
                </p>
                <Button
                  render={<Link href="/builder">Launch Package Builder &rarr;</Link>}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-mono border-brand-border text-brand-light"
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

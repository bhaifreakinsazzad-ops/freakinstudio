import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BRAND_TOKENS } from "@/lib/designTokens";

export function Footer() {
  return (
    <footer className="border-t border-[#232528] bg-[#090A0A] py-12 text-xs text-[#F6F4EF]/65">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <BrandLogo size="sm" />
            <p className="leading-relaxed text-[#F6F4EF]/60">
              Creative Office OS 2.0 — Browser-native free creative utilities,
              Puter-free sponsored Studio AI direction, and 13 hourly-scoped
              human creative services across 4 disciplines.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
              <span className="rounded border border-[#232528] bg-[#121315] px-2 py-0.5 text-[#D9BD81]">
                #090A0A Obsidian
              </span>
              <span className="rounded border border-[#232528] bg-[#121315] px-2 py-0.5 text-[#D9BD81]">
                #D9BD81 Champagne Gold
              </span>
              <span className="rounded border border-[#232528] bg-[#121315] px-2 py-0.5 text-[#F6F4EF]">
                #F6F4EF Ivory
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-mono uppercase tracking-wider text-[#D9BD81]">
              Creative Office OS
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tools"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  Free Browser Tools (6 Local Utilities)
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  Canonical Service Catalog (13 Services)
                </Link>
              </li>
              <li>
                <Link
                  href="/kits"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  Studio AI Assistants &amp; Micro-Kits (৳49/৳99/৳199)
                </Link>
              </li>
              <li>
                <Link
                  href="/builder"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  3-Step Smart Project Brief &amp; Estimator
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  Concept Works (Labeled Non-Client Specimens)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono uppercase tracking-wider text-[#D9BD81]">
              4 Approved Disciplines
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services?category=DISC-01"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  01 &middot; Brand &amp; Visual Identity (SRV-01..04)
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=DISC-02"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  02 &middot; Social Media &amp; Campaign (SRV-05..08)
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=DISC-03"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  03 &middot; Commercial Graphic &amp; Print (SRV-09..11)
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=DISC-04"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  04 &middot; Motion, Reels &amp; Video (SRV-12..13)
                </Link>
              </li>
              <li>
                <Link
                  href="/revision-policy"
                  className="hover:text-[#F6F4EF] transition-colors"
                >
                  2 Consolidated Revisions &amp; Licensing Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono uppercase tracking-wider text-[#D9BD81]">
              Verified Official Contacts
            </h4>
            <ul className="space-y-2.5 font-mono text-[11px]">
              <li>
                <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                  Official WhatsApp Desk
                </span>
                <a
                  href={BRAND_TOKENS.contacts.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D9BD81] hover:underline font-semibold"
                >
                  {BRAND_TOKENS.contacts.whatsappDisplay}
                </a>
              </li>
              <li>
                <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                  Official Studio Email
                </span>
                <a
                  href={`mailto:${BRAND_TOKENS.contacts.email}`}
                  className="text-[#F6F4EF] hover:text-[#D9BD81] transition-colors"
                >
                  {BRAND_TOKENS.contacts.email}
                </a>
              </li>
              <li>
                <span className="block text-[10px] uppercase text-[#F6F4EF]/45">
                  Official Web Domain
                </span>
                <a
                  href={BRAND_TOKENS.contacts.websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F6F4EF] hover:text-[#D9BD81] transition-colors"
                >
                  {BRAND_TOKENS.contacts.website}
                </a>
              </li>
              <li className="pt-1">
                <Link
                  href="/contact"
                  className="text-[#D9BD81] hover:underline"
                >
                  Submit Studio Consultation Inquiry &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#232528]/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px]">
            &copy; 2026 FREAKIN&apos;S STUDIO &mdash;
            DESIGN. CREATE. PRODUCE. GROW.
          </p>
          <p className="font-mono text-[11px] text-[#F6F4EF]/55">
            5% Launch Promo: 20 Nov &ndash; 15 Dec 2026 (Asia/Dhaka) &bull; 2
            Consolidated Revisions Included
          </p>
        </div>
      </div>
    </footer>
  );
}

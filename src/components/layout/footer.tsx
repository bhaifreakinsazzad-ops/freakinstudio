"use client";
import Link from "next/link";

import { BrandLogo } from "../ui/BrandLogo";

// Next 16's cacheComponents prerendering rejects new Date() at render time
// (it's an unstable value); a static build-time year is fine for a footer.
const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface/30 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="font-mono text-base font-bold tracking-wider text-brand-light flex items-center gap-2"><BrandLogo className="inline-block" /></Link>
            <p className="text-xs text-brand-muted max-w-sm leading-relaxed">
              Creative Commerce Operating System. High-velocity brand systems, 3D kinetic visuals, audio engineering, and full-stack digital platforms engineered for visionary commercial ventures.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brand-light font-semibold">Platform</h4>
            <ul className="space-y-2 text-xs font-mono text-brand-muted">
              <li><Link href="/services" className="hover:text-brand-light transition-colors">Services Catalog (60)</Link></li>
              <li><Link href="/builder" className="hover:text-brand-light transition-colors">Package Builder</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-light transition-colors">How It Works</Link></li>
              <li><Link href="/portfolio" className="hover:text-brand-light transition-colors">Portfolio Showcase</Link></li>
              <li><Link href="/case-studies" className="hover:text-brand-light transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          {/* Studio & Support */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brand-light font-semibold">Studio</h4>
            <ul className="space-y-2 text-xs font-mono text-brand-muted">
              <li><Link href="/about" className="hover:text-brand-light transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-light transition-colors">Contact &amp; Desk</Link></li>
              <li><Link href="/faq" className="hover:text-brand-light transition-colors">FAQ</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-light transition-colors">Client Portal</Link></li>
              <li><Link href="/admin" className="hover:text-brand-light transition-colors">Studio Admin OS</Link></li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brand-light font-semibold">Legal &amp; Policy</h4>
            <ul className="space-y-2 text-xs font-mono text-brand-muted">
              <li><Link href="/licensing-policy" className="hover:text-brand-light transition-colors">Commercial Buyout</Link></li>
              <li><Link href="/revision-policy" className="hover:text-brand-light transition-colors">Revision SLA</Link></li>
              <li><Link href="/refund-policy" className="hover:text-brand-light transition-colors">Refund Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-light transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-light transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-brand-muted">
          <p className="badge-mono text-brand-highlight">Design. Create. Produce. Grow.</p>
          <div className="flex items-center gap-6">
            <span>&copy; {COPYRIGHT_YEAR} Freakin&apos;s Studio. All rights reserved.</span>
            <span className="text-brand-border">|</span>
            <span>Dhaka &bull; Global Operations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

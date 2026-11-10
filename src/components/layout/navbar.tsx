"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo and main navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <BrandLogo className="h-12 w-12" />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-brand-muted">
            <Link href="/services" className="hover:text-brand-light transition-colors">Services (60)</Link>
            <Link href="/builder" className="hover:text-brand-light transition-colors flex items-center gap-1.5 text-brand-highlight">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-pulse" /> Package Builder
            </Link>
            <Link href="/portfolio" className="hover:text-brand-light transition-colors">Portfolio</Link>
            <Link href="/case-studies" className="hover:text-brand-light transition-colors">Case Studies</Link>
            <Link href="/dashboard" className="hover:text-brand-light transition-colors">Workspace</Link>
          </nav>
        </div>
        {/* Right side: language toggle and actions */}
        <nav className="flex items-center gap-2.5">
          <LanguageToggle />
          <Button
            render={<Link href="/builder">Build Package</Link>}
            size="sm"
            className="hidden sm:inline-flex cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-white font-mono text-xs"
          />
          <Button
            render={<Link href="/login">Sign in</Link>}
            variant="ghost"
            size="sm"
            className="text-xs font-mono"
          />
          <Button
            render={<Link href="/signup">Sign up</Link>}
            size="sm"
            variant="outline"
            className="text-xs font-mono border-brand-border hover:bg-brand-surface"
          />
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="h-6 w-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </nav>
      </div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="md:hidden bg-brand-black border-t border-brand-border">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/services" className="block py-2 text-brand-muted hover:text-brand-light transition-colors">Services (60)</Link>
            <Link href="/builder" className="block py-2 text-brand-highlight hover:text-brand-light transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-pulse" /> Package Builder
            </Link>
            <Link href="/portfolio" className="block py-2 text-brand-muted hover:text-brand-light transition-colors">Portfolio</Link>
            <Link href="/case-studies" className="block py-2 text-brand-muted hover:text-brand-light transition-colors">Case Studies</Link>
            <Link href="/dashboard" className="block py-2 text-brand-muted hover:text-brand-light transition-colors">Workspace</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

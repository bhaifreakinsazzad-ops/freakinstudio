"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLocale } from "@/lib/i18n/context";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();

  const navLinks = [
    { href: "/services", label: t("nav_services"), highlight: false },
    { href: "/builder", label: t("nav_builder"), highlight: true },
    { href: "/portfolio", label: t("nav_portfolio"), highlight: false },
    { href: "/case-studies", label: t("nav_case_studies"), highlight: false },
    { href: "/dashboard", label: t("nav_workspace"), highlight: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Brand mark & single-line wordmark */}
        <Link href="/" className="flex items-center shrink-0 whitespace-nowrap">
          <BrandLogo size={36} showWordmark />
        </Link>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-brand-muted">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap shrink-0 transition-colors hover:underline underline-offset-4 ${
                item.highlight
                  ? "text-brand-highlight hover:text-brand-light font-semibold"
                  : "hover:text-brand-light"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Language toggle & actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <Button
            render={<Link href="/login">{t("nav_sign_in")}</Link>}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-xs font-mono text-brand-light hover:text-brand-highlight whitespace-nowrap shrink-0"
          />
          <Button
            render={<Link href="/builder">{t("nav_build_package")}</Link>}
            size="sm"
            className="hidden sm:inline-flex cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs whitespace-nowrap shrink-0"
          />
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-brand-muted hover:text-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-highlight"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="lg:hidden bg-brand-black border-t border-brand-border">
          <div className="px-4 pt-3 pb-5 space-y-2 text-sm font-mono">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 transition-colors ${
                  item.highlight
                    ? "text-brand-highlight font-semibold hover:text-brand-light"
                    : "text-brand-muted hover:text-brand-light"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-brand-muted hover:text-brand-light transition-colors"
            >
              {t("nav_contact")}
            </Link>
            <div className="pt-3 border-t border-brand-border flex items-center gap-2">
              <Button
                render={
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    {t("nav_sign_in")}
                  </Link>
                }
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-mono border-brand-border text-brand-light"
              />
              <Button
                render={
                  <Link href="/builder" onClick={() => setMobileOpen(false)}>
                    {t("nav_build_package")}
                  </Link>
                }
                size="sm"
                className="flex-1 bg-brand-highlight text-brand-black font-semibold font-mono text-xs"
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

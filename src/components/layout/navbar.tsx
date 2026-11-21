"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { useI18n } from "@/lib/i18n/context";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PWAInstallButton } from "@/components/pwa/pwa-install-button";
import { isAdminRole } from "@/lib/permissions/roles";
import type { UserRole } from "@/types/domain";

interface NavbarProps {
  userEmail?: string | null;
  userRole?: string | null;
}

export function Navbar({ userEmail, userRole }: NavbarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudioAdmin = Boolean(userRole && isAdminRole(userRole as UserRole));

  const navItems = [
    { href: "/", label: t("nav.orbit", "Orbit Discovery") },
    { href: "/tools", label: t("nav.tools", "Free Tools (6)") },
    { href: "/services", label: t("nav.services", "Services (13)") },
    { href: "/kits", label: t("nav.kits", "AI & Kits") },
    { href: "/portfolio", label: t("nav.portfolio", "Concept Works") },
    { href: "/builder", label: t("nav.builder", "Smart Brief") },
    { href: "/dashboard", label: t("nav.portal", "Client Office") },
    ...(isStudioAdmin
      ? [{ href: "/admin", label: t("nav.admin", "Studio Pulse") }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232528] bg-[#090A0A]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-2">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 min-h-[44px]"
          aria-label="Freakin's Studio Home"
        >
          <BrandLogo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-1 text-xs font-medium"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#D9BD81] text-[#090A0A] font-semibold"
                    : "text-[#F6F4EF]/80 hover:text-[#F6F4EF] hover:bg-[#232528]/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <LanguageToggle />
          {userEmail ? (
            <div className="hidden sm:flex items-center gap-2">
              {isStudioAdmin && (
                <Button
                  render={<Link href="/admin">{t("nav.admin")}</Link>}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs border-[#D9BD81]/40 text-[#D9BD81]"
                />
              )}
              <Button
                render={<Link href="/dashboard">{t("nav.portal")}</Link>}
                size="sm"
                className="bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono"
              />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                render={<Link href="/login">{t("nav.signin")}</Link>}
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-[#F6F4EF]/80 hover:text-[#F6F4EF]"
              />
              <Button
                render={<Link href="/builder">{t("nav.launch")}</Link>}
                size="sm"
                className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono"
              />
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="xl:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#232528] bg-[#121315] p-2 text-[#F6F4EF] hover:border-[#D9BD81]/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="xl:hidden border-t border-[#232528] bg-[#090A0A]/98 px-4 py-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex min-h-[44px] items-center rounded-lg border px-3 py-2.5 transition-colors ${
                  isActive(item.href)
                    ? "border-[#D9BD81] bg-[#D9BD81]/15 text-[#D9BD81] font-semibold"
                    : "border-[#232528] bg-[#121315]/60 text-[#F6F4EF] hover:border-[#D9BD81]/40"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-[#232528]/60 flex items-center justify-between gap-2">
            {userEmail ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-xs font-mono text-[#D9BD81] px-2"
              >
                {userEmail}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-xs font-mono text-[#F6F4EF]/80 hover:text-[#F6F4EF] px-2"
              >
                {t("nav.signin")}
              </Link>
            )}
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg bg-[#D9BD81] px-4 py-2 text-xs font-mono font-semibold text-[#090A0A]"
            >
              {t("nav.launch")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

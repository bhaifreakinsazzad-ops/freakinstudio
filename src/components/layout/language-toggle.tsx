"use client";

import { useLocale } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-1.5 rounded border border-brand-border bg-brand-surface/60 px-2.5 py-1 text-xs font-mono text-brand-muted hover:text-brand-light hover:border-brand-highlight/40 transition-colors"
      title={`Switch language (Current: ${locale === "en" ? "English" : "বাংলা"})`}
    >
      <span className={locale === "en" ? "text-brand-highlight font-bold" : "opacity-60"}>
        EN
      </span>
      <span className="opacity-40">/</span>
      <span className={locale === "bn" ? "text-brand-highlight font-bold" : "opacity-60"}>
        বাং
      </span>
    </button>
  );
}

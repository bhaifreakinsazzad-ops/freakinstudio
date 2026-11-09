"use client";

import React, { createContext, useContext, useState } from "react";

export type Locale = "en" | "bn";

interface Dictionary {
  [key: string]: {
    en: string;
    bn: string;
  };
}

const UI_DICTIONARY: Dictionary = {
  nav_services: { en: "Services (60)", bn: "সার্ভিস সমূহ (৬০)" },
  nav_builder: { en: "Package Builder", bn: "প্যাকেজ বিল্ডার" },
  nav_portfolio: { en: "Portfolio", bn: "পোর্টফোলিও" },
  nav_case_studies: { en: "Case Studies", bn: "কেস স্টাডি" },
  nav_workspace: { en: "Workspace", bn: "ওয়ার্কস্পেস" },
  nav_sign_in: { en: "Sign in", bn: "সাইন ইন" },
  nav_sign_up: { en: "Sign up", bn: "সাইন আপ" },
  nav_build_package: { en: "Build Package", bn: "প্যাকেজ তৈরি করুন" },
  hero_badge: { en: "Creative Commerce OS", bn: "ক্রিয়েটিভ কমার্স ওএস" },
  all_categories: { en: "All Categories", bn: "সকল ক্যাটাগরি" },
  search_services: { en: "Search 60 creative services...", bn: "৬০টি ক্রিয়েটিভ সার্ভিস খুঁজুন..." },
  rush_delivery: { en: "Rush Delivery (+35%)", bn: "জরুরি ডেলিভারি (+৩৫%)" },
  configure: { en: "Configure Scope", bn: "স্কোপ কনফিগার করুন" },
  add_to_package: { en: "Add to Package", bn: "প্যাকেজে যোগ করুন" },
  request_quote: { en: "Request Formal Quotation", bn: "কোটেশনের অনুরোধ করুন" },
  checkout: { en: "Proceed to Checkout", bn: "চেকআউটে যান" },
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key: string) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("fs_locale") as Locale | null;
        if (stored === "en" || stored === "bn") return stored;
      } catch {
        // Ignore localStorage issues
      }
    }
    return "en";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("fs_locale", newLocale);
    } catch {
      // Ignore
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const t = (key: string): string => {
    const item = UI_DICTIONARY[key];
    if (!item) return key;
    return item[locale] || item.en;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

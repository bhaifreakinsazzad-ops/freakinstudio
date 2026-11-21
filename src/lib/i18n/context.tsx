"use client";

import React, { createContext, useContext, useState } from "react";

export type Locale = "en" | "bn";

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    "nav.orbit": "Orbit Discovery",
    "nav.tools": "Free Tools (6)",
    "nav.services": "Services (13)",
    "nav.kits": "AI & Kits",
    "nav.portfolio": "Concept Works",
    "nav.case_studies": "Concept Studies",
    "nav.how_it_works": "How It Works",
    "nav.builder": "Smart Brief",
    "nav.portal": "Client Office",
    "nav.admin": "Studio Pulse",
    "nav.signin": "Sign In",
    "nav.signout": "Sign Out",
    "nav.launch": "Smart Brief →",
    "hero.badge": "Creative Office OS 2.0 • Human Craft + SI Precision",
    "hero.title": "Free tools for instant utility. Sponsored AI for rapid direction. Human studio craft for commercial outcomes.",
    "hero.subtitle":
      "Explore 6 zero-login local browser utilities, 5 Puter-free Studio AI assistants, and 13 hourly-scoped creative services across 4 disciplines.",
    "hero.cta.builder": "Start Smart Brief →",
    "hero.cta.catalog": "Explore 13 Services",
    "catalog.title": "Canonical Creative Catalog (13 Services • 4 Disciplines)",
    "catalog.subtitle":
      "13 core creative services, 15 scoped variants, 5 commercial bundles, and 14 compatible add-ons with transparent hourly estimates and 2 consolidated revisions.",
    "catalog.search": "Search by service code (e.g. SRV-01), discipline, or title...",
    "catalog.configure": "Configure Scope →",
    "catalog.turnaround": "Turnaround",
    "catalog.revisions": "Revisions",
    "catalog.starting": "Scoped Rate",
    "builder.title": "Smart Project Brief & Hourly Scope Estimator",
    "builder.step1": "1. Core Service",
    "builder.step2": "2. Variant & Add-ons",
    "builder.step3": "3. Brief & Timeline",
    "builder.rush": "10-Min Express Micro-Edit (SRV-02 / SRV-05 / SRV-13 Only)",
    "builder.subtotal": "Scoped Subtotal",
    "builder.addons": "Selected Add-ons",
    "builder.promo": "5% Launch Window Promo (20 Nov – 15 Dec 2026)",
    "builder.total": "Estimated Investment",
    "builder.checkout": "Proceed to Payment",
    "builder.quote": "Submit Smart Brief & Request Studio Quote",
  },
  bn: {
    "nav.orbit": "অরবিট ডিসকভারি",
    "nav.tools": "ফ্রি টুলস (৬)",
    "nav.services": "সার্ভিস (১৩)",
    "nav.kits": "এআই ও কিটস",
    "nav.portfolio": "কনসেপ্ট ওয়ার্কস",
    "nav.case_studies": "কনসেপ্ট স্টাডিজ",
    "nav.how_it_works": "কাজের প্রক্রিয়া",
    "nav.builder": "স্মার্ট ব্রিফ",
    "nav.portal": "ক্লায়েন্ট অফিস",
    "nav.admin": "স্টুডিও পালস",
    "nav.signin": "সাইন ইন",
    "nav.signout": "সাইন আউট",
    "nav.launch": "স্মার্ট ব্রিফ →",
    "hero.badge": "ক্রিয়েটিভ অফিস ওএস ২.০ • হিউম্যান ক্রাফট + এসআই প্রিসিশন",
    "hero.title": "তাৎক্ষণিক কাজের জন্য ফ্রি টুলস। দ্রুত দিকনির্দেশনার জন্য এআই। ব্যবসায়িক ফলাফলের জন্য হিউম্যান ক্রিয়েটিভ স্টুডিও।",
    "hero.subtitle":
      "কোনো লগইন ছাড়াই ৬টি লোকাল ব্রাউজার টুল, ৫টি স্টুডিও এআই অ্যাসিস্ট্যান্ট এবং ৪টি ডিসিপ্লিনে ১৩টি আওয়ারলি-স্কোপড ক্রিয়েটিভ সার্ভিস।",
    "hero.cta.builder": "স্মার্ট ব্রিফ শুরু করুন →",
    "hero.cta.catalog": "১৩টি সার্ভিস দেখুন",
    "catalog.title": "ক্যানোনিকাল ক্রিয়েটিভ ক্যাটালগ (১৩টি সার্ভিস • ৪টি ডিসিপ্লিন)",
    "catalog.subtitle":
      "১৩টি কোর সার্ভিস, ১৫টি ভ্যারিয়েন্ট, ৫টি কমার্শিয়াল বান্ডেল এবং ১৪টি অ্যাড-অন — স্বচ্ছ আওয়ারলি এস্টিমেট ও ২টি কনসোলিডেটেড রিভিশনসহ।",
    "catalog.search": "সার্ভিস কোড (যেমন SRV-01) বা নাম দিয়ে খুঁজুন...",
    "catalog.configure": "স্কোপ কনফিগার করুন →",
    "catalog.turnaround": "ডেলিভারি সময়",
    "catalog.revisions": "রিভিশন",
    "catalog.starting": "স্কোপড রেট",
    "builder.title": "স্মার্ট প্রজেক্ট ব্রিফ ও আওয়ারলি এস্টিমেটর",
    "builder.step1": "১. কোর সার্ভিস",
    "builder.step2": "২. ভ্যারিয়েন্ট ও অ্যাড-অন",
    "builder.step3": "৩. ব্রিফ ও টাইমলাইন",
    "builder.rush": "১০-মিনিট এক্সপ্রেস মাইক্রো-এডিট (শুধুমাত্র SRV-02 / SRV-05 / SRV-13)",
    "builder.subtotal": "সাবটোটাল",
    "builder.addons": "নির্বাচিত অ্যাড-অন",
    "builder.promo": "৫% লঞ্চ প্রোমো ছাড় (২০ নভেম্বর – ১৫ ডিসেম্বর ২০২৬)",
    "builder.total": "মোট আনুমানিক বাজেট",
    "builder.checkout": "পেমেন্টে এগিয়ে যান",
    "builder.quote": "স্মার্ট ব্রিফ জমা দিন ও কোটেশন চান",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (k, f) => f || k,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  React.useEffect(() => {
    const saved = window.localStorage.getItem("fs_locale") as Locale | null;
    if (saved === "en" || saved === "bn") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fs_locale", loc);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const t = (key: string, fallback?: string) => {
    return TRANSLATIONS[locale]?.[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocale() {
  return useContext(I18nContext);
}

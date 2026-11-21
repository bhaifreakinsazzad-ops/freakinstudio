import { PenTool, Sparkles, Layout, Film, type LucideIcon } from "lucide-react";
import {
  CANONICAL_DISCIPLINES as DISCIPLINE_CATEGORIES,
  CANONICAL_SERVICES,
  CANONICAL_VARIANTS as CANONICAL_SERVICE_VARIANTS,
  CANONICAL_BUNDLES,
  CANONICAL_ADDONS,
  CANONICAL_AI_MICRO_KITS,
  CANONICAL_CONCEPT_WORKS as CONCEPT_PORTFOLIO_WORKS,
  RATEBOOK_VERSION,
  RATEBOOK_APPROVED,
} from "@/lib/catalog";
import type { DemoProject, LangCode } from "../types";

export {
  CANONICAL_SERVICES,
  CANONICAL_SERVICE_VARIANTS,
  CANONICAL_BUNDLES,
  CANONICAL_ADDONS,
  CANONICAL_AI_MICRO_KITS,
  CONCEPT_PORTFOLIO_WORKS,
  RATEBOOK_VERSION,
  RATEBOOK_APPROVED,
};

export interface DisciplineMeta {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  shortLabel: string;
  summary: string;
  icon: LucideIcon;
}

const DISCIPLINE_ICON_MAP: Record<string, { shortLabel: string; icon: LucideIcon }> = {
  "DISC-01": { shortLabel: "Brand Identity", icon: PenTool },
  "DISC-02": { shortLabel: "Social & Ads", icon: Sparkles },
  "DISC-03": { shortLabel: "Print & Packaging", icon: Layout },
  "DISC-04": { shortLabel: "Motion & Reels", icon: Film },
};

export const DISCIPLINES: DisciplineMeta[] = DISCIPLINE_CATEGORIES.map((cat) => ({
  id: cat.id,
  code: cat.code || cat.id.replace("DISC-", ""),
  nameEn: cat.name,
  nameBn: cat.name_bn || cat.name,
  shortLabel: DISCIPLINE_ICON_MAP[cat.id]?.shortLabel || cat.name,
  summary: cat.description || "",
  icon: DISCIPLINE_ICON_MAP[cat.id]?.icon || Sparkles,
}));

export const TRANSLATIONS: Record<
  LangCode,
  {
    brandName: string;
    tagline: string;
    navExplore: string;
    navTools: string;
    navServices: string;
    navKits: string;
    navWorks: string;
    navBrief: string;
    navClient: string;
    navStudio: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    expressDisclaimer: string;
    intentPlaceholder: string;
    intentButton: string;
    timelineHeading: string;
    reducedMotionOn: string;
    reducedMotionOff: string;
    contactHeader: string;
  }
> = {
  en: {
    brandName: "FREAKIN'S STUDIO",
    tagline: "DESIGN. CREATE. PRODUCE. GROW.",
    navExplore: "Explore Orbit",
    navTools: "Free Tools (6)",
    navServices: "Services (13)",
    navKits: "AI & Kits",
    navWorks: "Concept Works",
    navBrief: "Smart Brief",
    navClient: "Client Office",
    navStudio: "Studio Pulse",
    heroBadge: "CREATIVE OFFICE OS 2.0 • ANIME.JS ORBIT + TIMELINE",
    heroTitle: "Create something useful right now.",
    heroSubtitle:
      "Free browser-native design utilities, zero-Puter-login AI trials, and 13 approved human creative services — choreographed in one transparent studio.",
    ctaPrimary: "Launch Free Tools",
    ctaSecondary: "Start Smart Brief",
    expressDisclaimer:
      "Express delivery from 10 min applies strictly to pre-checked single-file micro-edits upon studio slot confirmation.",
    intentPlaceholder:
      'Describe what you need (e.g., "3 Instagram ads for my Dhaka bakery" or "Quick logo vector cleanup")...',
    intentButton: "Trace Path",
    timelineHeading:
      "Editorial Production Standard — From Free Prep to Verified Delivery",
    reducedMotionOn: "Flat Grid (Reduced Motion)",
    reducedMotionOff: "Anime.js Orbit Active",
    contactHeader: "Official Studio Touchpoints",
  },
  bn: {
    brandName: "FREAKIN'S STUDIO",
    tagline: "DESIGN. CREATE. PRODUCE. GROW.",
    navExplore: "ক্রিয়েটিভ অরবিট",
    navTools: "ফ্রি টুলস (৬)",
    navServices: "সার্ভিস (১৩)",
    navKits: "AI ও কিটস",
    navWorks: "কনসেপ্ট পোর্টফোলিও",
    navBrief: "স্মার্ট ব্রিফ",
    navClient: "ক্লায়েন্ট অফিস",
    navStudio: "স্টুডিও পালস",
    heroBadge: "ক্রিয়েটিভ অফিস OS ২.০ • অরবিট + টাইমলাইন",
    heroTitle: "এখনই কাজের কিছু তৈরি করুন।",
    heroSubtitle:
      "অ্যাকাউন্ট ছাড়াই ব্রাউজার-নেটিভ ফ্রি টুল, Puter লগইন ছাড়া AI ট্রায়াল এবং আমাদের ১৩টি অনুমোদিত হিউম্যান ক্রিয়েটিভ সার্ভিস — এক প্ল্যাটফর্মে।",
    ctaPrimary: "ফ্রি টুল ব্যবহার করুন",
    ctaSecondary: "প্রজেক্ট ব্রিফ শুরু করুন",
    expressDisclaimer:
      "১০ মিনিটে ডেলিভারি শুধুমাত্র প্রস্তুত ফাইলসহ যোগ্য সিঙ্গেল-ফাইল মাইক্রো-এডিট এবং স্টুডিও স্লট কনফার্মেশনের ক্ষেত্রে প্রযোজ্য।",
    intentPlaceholder:
      'আপনার প্রয়োজন লিখুন (যেমন: "আমার দোকানের জন্য ৩টি সোশ্যাল পোস্ট লাগবে" বা "লোগো রিসাইজ")...',
    intentButton: "সঠিক পথ দেখুন",
    timelineHeading:
      "স্বচ্ছ প্রোডাকশন রেল — ফ্রি প্রস্তুতি থেকে ভেরিফায়েড ডেলিভারি",
    reducedMotionOn: "ফ্ল্যাট গ্রিড (Reduced Motion)",
    reducedMotionOff: "অরবিটাল মোশন চালু",
    contactHeader: "অফিসিয়াল যোগাযোগ",
  },
};

export const INITIAL_SANDBOX_PROJECTS: DemoProject[] = [
  {
    id: "DEMO-PRJ-104",
    title: "Kazi Artisan Coffee — Launch Packaging & Social Trio",
    clientName: "Rafiq Ahmed (DEMO CLIENT)",
    serviceId: "SRV-10",
    serviceName: "Packaging & Label Design",
    variantLabel: "Flat Pouch / Bottle Label",
    scopedHours: 7,
    addons: ["ADD-01", "ADD-03"],
    expressRequested: false,
    expressEligible: false,
    status: "proof_ready",
    assignedExpert: "Arafat Rahman (Lead Brand Designer)",
    revisionsIncluded: 2,
    revisionsUsed: 1,
    proofVersion: "v1.2",
    proofNotes:
      "DEMO SPECIMEN: Gold foil lockup adjusted per Revision Round 1.",
    annotations: [
      {
        id: "ANN-1",
        x: 34,
        y: 42,
        author: "Rafiq Ahmed (DEMO CLIENT)",
        text: "Please bump the Bangla roast subtitle 2pt larger for packaging clarity.",
      },
    ],
    siProposals: [
      {
        id: "SI-771",
        task: "Pre-Delivery Contrast & Margin Check",
        summary:
          "Verified Gold (#D9BD81) over Obsidian (#090A0A) exceeds 9.4:1 AAA contrast across fold edges.",
        status: "suggested",
        createdAt: "2026-11-21 10:15 +06",
      },
    ],
    events: [
      {
        id: "EVT-101",
        actorKind: "system",
        actorName: "System Automation",
        timestamp: "2026-11-20 14:10 +06",
        stateBefore: "request_draft",
        stateAfter: "request_submitted",
        summary: "DEMO brief submitted with 7h packaging scope.",
      },
      {
        id: "EVT-102",
        actorKind: "human",
        actorName: "Arafat Rahman (Lead Brand Designer)",
        timestamp: "2026-11-20 16:45 +06",
        stateBefore: "in_production",
        stateAfter: "proof_ready",
        summary: "Uploaded DEMO Proof v1.2 with gold foil separation layer notes.",
      },
    ],
  },
  {
    id: "DEMO-PRJ-105",
    title: "Noor Skincare — 10-Min Express Vector Color Swap",
    clientName: "Nadia Islam (DEMO CLIENT)",
    serviceId: "SRV-02",
    serviceName: "Logo Redesign / Vector Cleanup",
    variantLabel: "10-Min Express Micro Vector Fix",
    scopedHours: 1,
    addons: [],
    expressRequested: true,
    expressEligible: true,
    status: "quote_issued",
    assignedExpert: "Unassigned — Awaiting Studio Lead Triage",
    revisionsIncluded: 2,
    revisionsUsed: 0,
    proofVersion: "Pending",
    proofNotes: "DEMO: Clean vector AI master attached.",
    annotations: [],
    siProposals: [],
    events: [
      {
        id: "EVT-201",
        actorKind: "human",
        actorName: "Studio Operations Lead",
        timestamp: "2026-11-21 09:20 +06",
        stateBefore: "request_submitted",
        stateAfter: "quote_issued",
        summary:
          "Confirmed clean vector source; issued DEMO express micro-edit quote.",
      },
    ],
  },
];

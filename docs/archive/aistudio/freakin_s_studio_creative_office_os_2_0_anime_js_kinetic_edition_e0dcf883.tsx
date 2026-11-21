import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext
} from 'react';
import * as AnimeModule from 'animejs';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  Download,
  Copy,
  Check,
  Sliders,
  Palette,
  Eye,
  FileText,
  Box,
  Wand2,
  ShoppingBag,
  Shield,
  ShieldAlert,
  Bot,
  History,
  Send,
  RefreshCw,
  Globe,
  Menu,
  X,
  Lock,
  Zap,
  LayoutGrid,
  List,
  Phone,
  Mail,
  ExternalLink,
  Activity,
  Film,
  PenTool,
  Layout
} from 'lucide-react';

/**
 * ============================================================================
 * FREAKIN'S STUDIO — CREATIVE OFFICE OS 2.0 (ANIME.JS KINETIC EDITION)
 * Approved Visual Direction: Concept A (Creative Orbit) + Concept C (Production Timeline)
 * Official Brand Palette:
 *   - Obsidian:       #090A0A
 *   - Champagne Gold: #D9BD81
 *   - Ivory:          #F6F4EF
 *   - Graphite:       #232528
 *   - Tagline:        DESIGN. CREATE. PRODUCE. GROW.
 *   - Contacts:       WhatsApp +8801778307704 | Email bhaifreakinstudio@gmail.com | Web freakinstudio.space
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 0. UNIVERSAL ANIME.JS ADAPTER (SUPPORTS ANIME.JS v4 NAMED EXPORTS & v3 CJS/ESM)
// ----------------------------------------------------------------------------
const animeV4Animate = typeof AnimeModule.animate === 'function' ? AnimeModule.animate : null;
const animeV4Timeline = typeof AnimeModule.createTimeline === 'function' ? AnimeModule.createTimeline : null;
const animeV4Stagger = typeof AnimeModule.stagger === 'function' ? AnimeModule.stagger : null;
const animeV4Svg = AnimeModule.svg || null;
const animeV4Spring = typeof AnimeModule.createSpring === 'function' ? AnimeModule.createSpring : null;
const animeV3Default =
  typeof AnimeModule.default === 'function'
    ? AnimeModule.default
    : typeof AnimeModule.default?.default === 'function'
    ? AnimeModule.default.default
    : null;

function runKinetic(targets, params) {
  if (!targets) return null;
  try {
    if (animeV4Animate) {
      return animeV4Animate(targets, params);
    }
    if (animeV3Default) {
      const v3Params = { targets, ...params };
      if (params.y !== undefined && params.translateY === undefined) {
        v3Params.translateY = params.y;
        delete v3Params.y;
      }
      if (params.x !== undefined && params.translateX === undefined) {
        v3Params.translateX = params.x;
        delete v3Params.x;
      }
      if (typeof params.ease === 'string') {
        const easeMap = {
          outExpo: 'easeOutExpo',
          outCubic: 'easeOutCubic',
          outQuad: 'easeOutQuad',
          inOutQuad: 'easeInOutQuad',
          inOutCubic: 'easeInOutCubic',
          inOutSine: 'easeInOutSine',
          linear: 'linear'
        };
        v3Params.easing = easeMap[params.ease] || 'easeOutCubic';
        delete v3Params.ease;
      }
      return animeV3Default(v3Params);
    }
  } catch {
    // Graceful no-op fallback if animation runtime is unavailable
  }
  return null;
}

function getStagger(val, opts) {
  if (animeV4Stagger) return animeV4Stagger(val, opts);
  if (animeV3Default && typeof animeV3Default.stagger === 'function') {
    return animeV3Default.stagger(val, opts);
  }
  return (_el, i) => i * val;
}

function getSpringEase() {
  if (animeV4Spring) {
    try {
      return animeV4Spring({ stiffness: 280, damping: 16 });
    } catch {
      return 'outElastic(1, .6)';
    }
  }
  return 'easeOutElastic(1, .6)';
}

function drawSvgPaths(elements, duration = 1100, delayStep = 140) {
  if (!elements || elements.length === 0) return;
  try {
    if (animeV4Animate && animeV4Svg && typeof animeV4Svg.createDrawable === 'function') {
      const drawables = animeV4Svg.createDrawable(elements);
      animeV4Animate(drawables, {
        draw: ['0 0', '0 1'],
        duration,
        delay: getStagger(delayStep),
        ease: 'inOutQuad'
      });
      return;
    }
    if (animeV3Default) {
      const nodeList = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;
      nodeList.forEach((el) => {
        if (typeof el.getTotalLength === 'function') {
          const len = el.getTotalLength();
          el.style.strokeDasharray = `${len}`;
          el.style.strokeDashoffset = `${len}`;
        }
      });
      animeV3Default({
        targets: nodeList,
        strokeDashoffset: [animeV3Default.setDashoffset, 0],
        duration,
        delay: getStagger(delayStep),
        easing: 'easeInOutQuad'
      });
    }
  } catch {
    // Keep static stroke intact on fallback
  }
}

// ----------------------------------------------------------------------------
// 1. BILINGUAL LOCALIZATION DICTIONARY (ENGLISH & BANGLA)
// ----------------------------------------------------------------------------
const TRANSLATIONS = {
  en: {
    brandName: "FREAKIN'S STUDIO",
    tagline: 'DESIGN. CREATE. PRODUCE. GROW.',
    navExplore: 'Explore Orbit',
    navTools: 'Free Tools (6)',
    navServices: 'Services (13)',
    navKits: 'AI & Kits',
    navWorks: 'Concept Works',
    navBrief: 'Smart Brief',
    navClient: 'Client Office',
    navStudio: 'Studio Pulse',
    heroBadge: 'CREATIVE OFFICE OS 2.0 • ANIME.JS ORBIT + TIMELINE',
    heroTitle: 'Create something useful right now.',
    heroSubtitle:
      'Free browser-native design utilities, zero-Puter-login AI trials, and 13 approved human creative services — choreographed in one transparent studio.',
    ctaPrimary: 'Launch Free Tools',
    ctaSecondary: 'Start Smart Brief',
    expressDisclaimer:
      'Express delivery from 10 min applies strictly to pre-checked single-file micro-edits upon studio slot confirmation.',
    intentPlaceholder:
      'Describe what you need (e.g., "3 Instagram ads for my Dhaka bakery" or "Quick logo vector cleanup")...',
    intentButton: 'Trace Path',
    timelineHeading: 'Editorial Production Standard — From Free Prep to Verified Delivery',
    reducedMotionOn: 'Flat Grid (Reduced Motion)',
    reducedMotionOff: 'Anime.js Orbit Active',
    contactHeader: 'Official Studio Touchpoints'
  },
  bn: {
    brandName: "FREAKIN'S STUDIO",
    tagline: 'DESIGN. CREATE. PRODUCE. GROW.',
    navExplore: 'ক্রিয়েটিভ অরবিট',
    navTools: 'ফ্রি টুলস (৬)',
    navServices: 'সার্ভিস (১৩)',
    navKits: 'AI ও কিটস',
    navWorks: 'কনসেপ্ট পোর্টফোলিও',
    navBrief: 'স্মার্ট ব্রিফ',
    navClient: 'ক্লায়েন্ট অফিস',
    navStudio: 'স্টুডিও পালস',
    heroBadge: 'ক্রিয়েটিভ অফিস OS ২.০ • অরবিট + টাইমলাইন',
    heroTitle: 'এখনই কাজের কিছু তৈরি করুন।',
    heroSubtitle:
      'অ্যাকাউন্ট ছাড়াই ব্রাউজার-নেটিভ ফ্রি টুল, Puter লগইন ছাড়া AI ট্রায়াল এবং আমাদের ১৩টি অনুমোদিত হিউম্যান ক্রিয়েটিভ সার্ভিস — এক প্ল্যাটফর্মে।',
    ctaPrimary: 'ফ্রি টুল ব্যবহার করুন',
    ctaSecondary: 'প্রজেক্ট ব্রিফ শুরু করুন',
    expressDisclaimer:
      '১০ মিনিটে ডেলিভারি শুধুমাত্র প্রস্তুত ফাইলসহ যোগ্য সিঙ্গেল-ফাইল মাইক্রো-এডিট এবং স্টুডিও স্লট কনফার্মেশনের ক্ষেত্রে প্রযোজ্য।',
    intentPlaceholder:
      'আপনার প্রয়োজন লিখুন (যেমন: "আমার দোকানের জন্য ৩টি সোশ্যাল পোস্ট লাগবে" বা "লোগো রিসাইজ")...',
    intentButton: 'সঠিক পথ দেখুন',
    timelineHeading: 'স্বচ্ছ প্রোডাকশন রেল — ফ্রি প্রস্তুতি থেকে ভেরিফায়েড ডেলিভারি',
    reducedMotionOn: 'ফ্ল্যাট গ্রিড (Reduced Motion)',
    reducedMotionOff: 'অরবিটাল মোশন চালু',
    contactHeader: 'অফিসিয়াল যোগাযোগ'
  }
};

// ----------------------------------------------------------------------------
// 2. APPROVED CANONICAL CATALOG STRUCTURE (4 / 13 / 15 / 5 / 14 — NO INVENTED RATES)
// ----------------------------------------------------------------------------
const DISCIPLINES = [
  {
    id: 'DISC-01',
    nameEn: 'Brand & Visual Identity',
    nameBn: 'ব্র্যান্ড ও ভিজ্যুয়াল আইডেন্টিটি',
    code: '01',
    shortLabel: 'Brand Identity',
    icon: PenTool,
    summary: 'Foundational marks, typography systems, brand guidelines, and packaging identity.'
  },
  {
    id: 'DISC-02',
    nameEn: 'Social Media & Campaign Creative',
    nameBn: 'সোশ্যাল মিডিয়া ও ক্যাম্পেইন ক্রিয়েটিভ',
    code: '02',
    shortLabel: 'Social & Ads',
    icon: Sparkles,
    summary: 'High-clarity campaign visuals, carousel storytelling, ad creatives, and profile kits.'
  },
  {
    id: 'DISC-03',
    nameEn: 'Commercial Graphic & Print Design',
    nameBn: 'কমার্শিয়াল গ্রাফিক ও প্রিন্ট ডিজাইন',
    code: '03',
    shortLabel: 'Print & Decks',
    icon: Layout,
    summary: 'Print-ready packaging dielines, brochures, pitch decks, and event collateral.'
  },
  {
    id: 'DISC-04',
    nameEn: 'Motion, Reels & Short-Form Video',
    nameBn: 'মোশন, রিলস ও শর্ট-ফর্ম ভিডিও',
    code: '04',
    shortLabel: 'Motion & Reels',
    icon: Film,
    summary: 'Logo reveals, kinetic typography reels, and product showcase edits.'
  }
];

const CORE_SERVICES = [
  {
    id: 'SRV-01',
    disciplineId: 'DISC-01',
    titleEn: 'Primary Brand Mark & Logo System',
    titleBn: 'প্রাইমারি ব্র্যান্ড মার্ক ও লোগো সিস্টেম',
    estimatedHours: 8,
    formats: ['SVG', 'EPS', 'PNG (Transparent)', 'PDF Spec'],
    revisions: 2,
    expressEligible: false,
    included: ['2 distinct creative directions', 'Primary & monochrome lockups', 'Clear-space & color hex sheet'],
    excluded: ['Trademark legal filing', 'Full 30-page brand book (see SRV-03)']
  },
  {
    id: 'SRV-02',
    disciplineId: 'DISC-01',
    titleEn: 'Logo Cleanup, Vectorization & Micro-Edit',
    titleBn: 'লোগো ক্লিনআপ, ভেক্টরাইজেশন ও মাইক্রো-এডিট',
    estimatedHours: 1,
    formats: ['SVG', 'PDF', 'PNG'],
    revisions: 2,
    expressEligible: true,
    included: ['Precision vector redraw or single-file fix', 'Color code alignment', 'Print & web exports'],
    excluded: ['New brand concept exploration from scratch']
  },
  {
    id: 'SRV-03',
    disciplineId: 'DISC-01',
    titleEn: 'Compact Brand Identity Guidelines',
    titleBn: 'কম্প্যাক্ট ব্র্যান্ড আইডেন্টিটি গাইডলাইন',
    estimatedHours: 10,
    formats: ['Interactive PDF', 'Figma Token Sheet'],
    revisions: 2,
    expressEligible: false,
    included: ['Typography hierarchy (EN/BN)', 'Approved color ratios & contrast rules', 'Do / Do-Not usage examples'],
    excluded: ['Custom typeface engineering']
  },
  {
    id: 'SRV-04',
    disciplineId: 'DISC-02',
    titleEn: 'Social Campaign Static Post Set',
    titleBn: 'সোশ্যাল ক্যাম্পেইন স্ট্যাটিক পোস্ট সেট',
    estimatedHours: 4,
    formats: ['PNG', 'JPG', 'Editable Source'],
    revisions: 2,
    expressEligible: false,
    included: ['Platform safe-area framing', 'Bilingual headline typography', 'Cohesive grid art direction'],
    excluded: ['Paid ad media buying or account management']
  },
  {
    id: 'SRV-05',
    disciplineId: 'DISC-02',
    titleEn: 'Single Social Ad / Story Quick Resize & Polish',
    titleBn: 'সিঙ্গেল সোশ্যাল অ্যাড রিসাইজ ও পলিশ',
    estimatedHours: 1,
    formats: ['PNG', 'JPG'],
    revisions: 2,
    expressEligible: true,
    included: ['1 existing creative adapted or polished', 'Safe-zone alignment', '10-min slot eligible if assets ready'],
    excluded: ['Multi-slide carousel creation']
  },
  {
    id: 'SRV-06',
    disciplineId: 'DISC-02',
    titleEn: 'Educational / Product Carousel Deck',
    titleBn: 'প্রোডাক্ট ক্যারোসেল স্লাইড ডেক',
    estimatedHours: 5,
    formats: ['PNG Sequence', 'PDF'],
    revisions: 2,
    expressEligible: false,
    included: ['Up to 7 seamless slides', 'Visual pacing & hierarchy', 'Cover hook & closing CTA slide'],
    excluded: ['Long-form copywriting research']
  },
  {
    id: 'SRV-07',
    disciplineId: 'DISC-02',
    titleEn: 'Brand Social Profile & Cover Kit',
    titleBn: 'ব্র্যান্ড সোশ্যাল প্রোফাইল ও কভার কিট',
    estimatedHours: 3,
    formats: ['PNG', 'JPG'],
    revisions: 2,
    expressEligible: false,
    included: ['Avatar framing', 'Facebook, LinkedIn & YouTube banners', 'Highlight cover icons'],
    excluded: ['New logo creation']
  },
  {
    id: 'SRV-08',
    disciplineId: 'DISC-03',
    titleEn: 'Product Packaging & Label Design',
    titleBn: 'প্রোডাক্ট প্যাকেজিং ও লেবেল ডিজাইন',
    estimatedHours: 12,
    formats: ['Print CMYK PDF', 'AI/EPS Dieline', '3D Preview'],
    revisions: 2,
    expressEligible: false,
    included: ['Print-ready bleed & dieline alignment', 'Ingredient/compliance typography', '3D angle presentation'],
    excluded: ['Physical offset printing production']
  },
  {
    id: 'SRV-09',
    disciplineId: 'DISC-03',
    titleEn: 'Company Profile / Investor Pitch Deck',
    titleBn: 'কোম্পানি প্রোফাইল / পিচ ডেক ডিজাইন',
    estimatedHours: 10,
    formats: ['PDF', 'Editable Presentation'],
    revisions: 2,
    expressEligible: false,
    included: ['Up to 12 custom-designed slides', 'Data charts & clean layout grid', 'Consistent brand styling'],
    excluded: ['Financial modeling or business consultancy']
  },
  {
    id: 'SRV-10',
    disciplineId: 'DISC-03',
    titleEn: 'Print Flyer, Brochure or Menu Layout',
    titleBn: 'প্রিন্ট ফ্লায়ার, ব্রোশিওর বা মেনু লেআউট',
    estimatedHours: 5,
    formats: ['CMYK Print PDF', 'Web PDF'],
    revisions: 2,
    expressEligible: false,
    included: ['Print-ready margins & crop marks', 'Structured typography & photo placement'],
    excluded: ['On-site product photography']
  },
  {
    id: 'SRV-11',
    disciplineId: 'DISC-04',
    titleEn: 'Brand Logo Motion Sting / Reveal',
    titleBn: 'ব্র্যান্ড লোগো মোশন রিভিল',
    estimatedHours: 6,
    formats: ['MP4 (1080p/4K)', 'MOV Alpha'],
    revisions: 2,
    expressEligible: false,
    included: ['5–8 second custom motion choreography', 'Clean sound-ready timing', '16:9 and 9:16 exports'],
    excluded: ['Custom orchestral score composition']
  },
  {
    id: 'SRV-12',
    disciplineId: 'DISC-04',
    titleEn: 'Short-Form Reel / Promo Video Edit',
    titleBn: 'শর্ট-ফর্ম রিল / প্রোমো ভিডিও এডিট',
    estimatedHours: 6,
    formats: ['MP4 (9:16)', 'SRT Captions'],
    revisions: 2,
    expressEligible: false,
    included: ['Up to 45s dynamic pacing', 'Bilingual kinetic captions', 'Color & audio leveling'],
    excluded: ['On-location camera shoot']
  },
  {
    id: 'SRV-13',
    disciplineId: 'DISC-04',
    titleEn: 'Single-Clip Caption & Trim Micro-Edit',
    titleBn: 'সিঙ্গেল-ক্লিপ ক্যাপশন ও ট্রিম মাইক্রো-এডিট',
    estimatedHours: 1,
    formats: ['MP4'],
    revisions: 2,
    expressEligible: true,
    included: ['Trim, crop & clean subtitle overlay on 1 supplied clip', '10-min slot eligible if preflight passes'],
    excluded: ['Multi-camera raw footage assembly']
  }
];

const SERVICE_VARIANTS = [
  { id: 'VAR-01', serviceId: 'SRV-01', label: 'Essential Logo Mark (2 Concepts)', hoursMultiplier: 1.0 },
  { id: 'VAR-02', serviceId: 'SRV-01', label: 'Extended Logo Suite + Bilingual Lockup', hoursMultiplier: 1.35 },
  { id: 'VAR-03', serviceId: 'SRV-02', label: 'Express Single-File Vector Fix (10-Min Preflight)', hoursMultiplier: 1.0 },
  { id: 'VAR-04', serviceId: 'SRV-03', label: 'Core Brand Book (12 Pages)', hoursMultiplier: 1.0 },
  { id: 'VAR-05', serviceId: 'SRV-04', label: '3-Post Campaign Starter Pack', hoursMultiplier: 1.0 },
  { id: 'VAR-06', serviceId: 'SRV-04', label: '6-Post Multi-Platform Campaign Set', hoursMultiplier: 1.75 },
  { id: 'VAR-07', serviceId: 'SRV-05', label: 'Express 1-File Ad Adaptation (10-Min Preflight)', hoursMultiplier: 1.0 },
  { id: 'VAR-08', serviceId: 'SRV-06', label: '5-Slide Focused Carousel', hoursMultiplier: 0.85 },
  { id: 'VAR-09', serviceId: 'SRV-07', label: '3-Channel Profile & Banner Kit', hoursMultiplier: 1.0 },
  { id: 'VAR-10', serviceId: 'SRV-08', label: 'Single SKU Label / Box Dieline', hoursMultiplier: 1.0 },
  { id: 'VAR-11', serviceId: 'SRV-08', label: '3-SKU Product Line Packaging Family', hoursMultiplier: 2.2 },
  { id: 'VAR-12', serviceId: 'SRV-09', label: '10-Slide Executive Deck', hoursMultiplier: 1.0 },
  { id: 'VAR-13', serviceId: 'SRV-10', label: 'Bi-Fold / Tri-Fold Print Brochure', hoursMultiplier: 1.0 },
  { id: 'VAR-14', serviceId: 'SRV-11', label: 'Clean Geometric Logo Sting (6s)', hoursMultiplier: 1.0 },
  { id: 'VAR-15', serviceId: 'SRV-12', label: '30-Second Product Promo Reel', hoursMultiplier: 1.0 }
];

const COMMERCIAL_BUNDLES = [
  {
    id: 'BND-01',
    titleEn: 'New Venture Identity Launch Bundle',
    titleBn: 'নিউ ভেঞ্চার আইডেন্টিটি লঞ্চ বান্ডেল',
    componentServiceIds: ['SRV-01', 'SRV-03', 'SRV-07'],
    totalScopedHours: 21,
    revisions: 2,
    summary: 'Primary logo system, compact brand guidelines, and 3-channel social profile kit scoped together.'
  },
  {
    id: 'BND-02',
    titleEn: 'E-Commerce Product Launch Bundle',
    titleBn: 'ই-কমার্স প্রোডাক্ট লঞ্চ বান্ডেল',
    componentServiceIds: ['SRV-08', 'SRV-04', 'SRV-12'],
    totalScopedHours: 22,
    revisions: 2,
    summary: 'Packaging label design, 3-post launch creative set, and a 30s product promo reel.'
  },
  {
    id: 'BND-03',
    titleEn: 'Social Growth Monthly Creative Pack',
    titleBn: 'সোশ্যাল গ্রোথ ক্রিয়েটিভ প্যাক',
    componentServiceIds: ['SRV-04', 'SRV-06', 'SRV-12'],
    totalScopedHours: 15,
    revisions: 2,
    summary: 'Static campaign set, educational carousel deck, and short-form reel edit.'
  },
  {
    id: 'BND-04',
    titleEn: 'Founder Pitch & Brand Readiness Bundle',
    titleBn: 'ফাউন্ডার পিচ ও ব্র্যান্ড রেডিনেস বান্ডেল',
    componentServiceIds: ['SRV-01', 'SRV-09', 'SRV-10'],
    totalScopedHours: 23,
    revisions: 2,
    summary: 'Brand mark, 10-slide investor deck, and print-ready one-pager brochure.'
  },
  {
    id: 'BND-05',
    titleEn: 'Brand Refresh & Motion Identity Bundle',
    titleBn: 'ব্র্যান্ড রিফ্রেশ ও মোশন আইডেন্টিটি বান্ডেল',
    componentServiceIds: ['SRV-02', 'SRV-07', 'SRV-11'],
    totalScopedHours: 10,
    revisions: 2,
    summary: 'Logo vector refinement, refreshed social banners, and geometric logo motion reveal.'
  }
];

const OPTIONAL_ADDONS = [
  { id: 'ADD-01', name: 'Editable Source File Package (AI / PSD / Figma)', hours: 1.5, compatibleDisciplines: ['DISC-01', 'DISC-02', 'DISC-03'] },
  { id: 'ADD-02', name: 'Bangla + English Bilingual Adaptation Layer', hours: 1.5, compatibleDisciplines: ['DISC-01', 'DISC-02', 'DISC-03', 'DISC-04'] },
  { id: 'ADD-03', name: 'Extra Social Platform Ratio Set (Story + Banner)', hours: 1.0, compatibleDisciplines: ['DISC-02'] },
  { id: 'ADD-04', name: 'Print-House CMYK Pre-Press & Bleed Verification', hours: 1.0, compatibleDisciplines: ['DISC-01', 'DISC-03'] },
  { id: 'ADD-05', name: '3D Realistic Packaging / Merch Angle Render (2 Views)', hours: 2.0, compatibleDisciplines: ['DISC-01', 'DISC-03'] },
  { id: 'ADD-06', name: 'SRT Burned-In & Separate Subtitle Track (EN/BN)', hours: 1.0, compatibleDisciplines: ['DISC-04'] },
  { id: 'ADD-07', name: 'Transparent Alpha Channel Video Export (MOV)', hours: 0.5, compatibleDisciplines: ['DISC-04'] },
  { id: 'ADD-08', name: 'Social Media Avatar & Favicon Micro-Pack', hours: 1.0, compatibleDisciplines: ['DISC-01'] },
  { id: 'ADD-09', name: 'Color Palette & WCAG Contrast Spec Card', hours: 1.0, compatibleDisciplines: ['DISC-01', 'DISC-02'] },
  { id: 'ADD-10', name: 'Additional Consolidated Revision Round (+1 Round)', hours: 2.0, compatibleDisciplines: ['DISC-01', 'DISC-02', 'DISC-03', 'DISC-04'] },
  { id: 'ADD-11', name: 'Square + Vertical Dual Aspect Video Delivery', hours: 1.5, compatibleDisciplines: ['DISC-04'] },
  { id: 'ADD-12', name: 'Custom Icon Mini-Set (6 Geometric Brand Icons)', hours: 2.5, compatibleDisciplines: ['DISC-01', 'DISC-03'] },
  { id: 'ADD-13', name: 'QR Code & Print Variable Data Placement', hours: 0.5, compatibleDisciplines: ['DISC-03'] },
  { id: 'ADD-14', name: 'Priority Same-Day Studio Slot (Subject to Availability)', hours: 1.5, compatibleDisciplines: ['DISC-01', 'DISC-02', 'DISC-03', 'DISC-04'] }
];

const AI_MICRO_KITS = [
  {
    id: 'SKU-SHOP-49',
    nameEn: 'Shop Starter AI Kit',
    nameBn: 'শপ স্টার্টার AI কিট',
    proposedPriceBdt: 49,
    targetCostNote: 'Proposed Test Price • Target Max Variable Cost ৳9 (Unverified until live Puter metering)',
    includedOutputs: [
      '1 SEO-ready Product Title (EN/BN)',
      '1 Persuasive Product Listing Description',
      '3 Platform-Ready Social Captions',
      '3 Scroll-Stopping Ad Hooks',
      'Clean Markdown / Text Download'
    ],
    exclusions: ['Custom graphic layout or human designer retouching']
  },
  {
    id: 'SKU-CAMP-99',
    nameEn: 'Campaign Ready AI Kit',
    nameBn: 'ক্যাম্পেইন রেডি AI কিট',
    proposedPriceBdt: 99,
    targetCostNote: 'Proposed Test Price • Target Max Variable Cost ৳19 (Unverified until live Puter metering)',
    includedOutputs: [
      '5 Targeted Ad Hooks (Pain, Benefit, Curiosity)',
      '3 Conversion-Focused Social Captions',
      '2 Distinct Campaign Creative Angles',
      'Structured Creative Production Worksheet Export'
    ],
    exclusions: ['Final static/video media files']
  },
  {
    id: 'SKU-BRAND-199',
    nameEn: 'Brand Mini AI Kit',
    nameBn: 'ব্র্যান্ড মিনি AI কিট',
    proposedPriceBdt: 199,
    targetCostNote: 'Proposed Test Price • Target Max Variable Cost ৳45 (Unverified until live Puter metering)',
    includedOutputs: [
      'Editable Professional Brand Brief',
      '3 Brand Naming & Positioning Directions',
      '3 Tagline Variations',
      'HEX Palette & Typography Direction',
      'Social Bio & Printable Spec Export'
    ],
    exclusions: ['Vector logo artwork (upgradeable to SRV-01)']
  }
];

const CONCEPT_WORKS = [
  {
    id: 'CW-01',
    discipline: 'Brand & Visual Identity',
    title: 'Kazi Roast & Co. — Specialty Coffee Identity System',
    label: 'Concept Work — Not Client Work',
    summary: 'Speculative bilingual packaging, monogram stamp, and warm Obsidian/Gold roast tier system.',
    palette: ['#090A0A', '#D9BD81', '#F6F4EF', '#5C4326'],
    deliverables: ['Primary Monogram', '250g Pouch Dieline', 'Color & Typography Spec']
  },
  {
    id: 'CW-02',
    discipline: 'Social Media & Campaign Creative',
    title: 'Noor Artisans — Eid Craft Campaign Grid',
    label: 'Concept Work — Not Client Work',
    summary: 'Editorial social campaign exploring high-contrast Bangla serif typography and product framing.',
    palette: ['#141619', '#D9BD81', '#F6F4EF', '#8B3A2B'],
    deliverables: ['6-Post Campaign Grid', 'Story Safe-Area Templates']
  },
  {
    id: 'CW-03',
    discipline: 'Commercial Graphic & Print Design',
    title: 'Veloce Urban Mobility — Investor Pitch & Spec Folio',
    label: 'Concept Work — Not Client Work',
    summary: '12-slide Swiss-grid presentation deck and technical specification brochure.',
    palette: ['#090A0A', '#232528', '#D9BD81', '#F6F4EF'],
    deliverables: ['12-Slide Deck', 'Tri-Fold Print Spec']
  },
  {
    id: 'CW-04',
    discipline: 'Motion, Reels & Short-Form Video',
    title: 'Aura Botanicals — 30s Kinetic Product Reel',
    label: 'Concept Work — Not Client Work',
    summary: 'Rhythmic 9:16 short-form showcase with clean bilingual captions and logo sting.',
    palette: ['#090A0A', '#D9BD81', '#3B4D3B', '#F6F4EF'],
    deliverables: ['9:16 Master Reel', '6s Logo Motion Reveal']
  }
];

// ----------------------------------------------------------------------------
// 3. SHARED CLIENT <-> STUDIO STATE CONTEXT
// ----------------------------------------------------------------------------
const INITIAL_PROJECTS = [
  {
    id: 'PRJ-2026-104',
    title: 'Dhaka Artisan Bakery — 3-Post Launch Campaign',
    clientName: 'Sadia Islam (DEMO CLIENT)',
    serviceId: 'SRV-04',
    serviceName: 'Social Campaign Static Post Set',
    variantLabel: '3-Post Campaign Starter Pack',
    scopedHours: 4,
    addons: ['ADD-02'],
    expressRequested: false,
    expressEligible: false,
    status: 'proof_ready',
    assignedExpert: 'Nusrat Jahan — Senior Visual Designer',
    revisionsIncluded: 2,
    revisionsUsed: 0,
    proofVersion: 'v1.0',
    proofNotes: 'Initial 3-post layout prepared with Bangla + English headlines and warm gold accents.',
    annotations: [
      { id: 'ANN-1', x: 34, y: 28, author: 'Client (Demo)', text: 'Love the gold badge framing here—can we make the Dhaka delivery line slightly larger?' }
    ],
    siProposals: [
      {
        id: 'SI-901',
        task: 'Brief Completeness & Safe-Area Check',
        summary: 'Verified 1080×1350 IG portrait safe margins and checked Bangla Noto Sans legibility.',
        status: 'approved',
        createdAt: '2026-11-20 14:20 +06'
      },
      {
        id: 'SI-902',
        task: 'Draft 3 Alt Caption Hooks for Post #2',
        summary: 'Prepared 3 concise bilingual caption hooks matching the bakery launch tone.',
        status: 'suggested',
        createdAt: '2026-11-21 04:15 +06'
      }
    ],
    events: [
      {
        id: 'EVT-1',
        actorKind: 'system',
        actorName: 'System Automation',
        timestamp: '2026-11-20 11:05 +06',
        stateBefore: 'request_draft',
        stateAfter: 'request_submitted',
        summary: 'Smart brief submitted with 3 brand reference swatches.'
      },
      {
        id: 'EVT-2',
        actorKind: 'human',
        actorName: 'Arafat Rahman (Studio Lead)',
        timestamp: '2026-11-20 11:42 +06',
        stateBefore: 'request_submitted',
        stateAfter: 'quote_issued',
        summary: 'Scoped 4 billable hours + Bilingual Layer (ADD-02). Quote issued per Ratebook authority.'
      },
      {
        id: 'EVT-3',
        actorKind: 'human',
        actorName: 'Sadia Islam (Client Demo)',
        timestamp: '2026-11-20 12:10 +06',
        stateBefore: 'quote_issued',
        stateAfter: 'accepted',
        summary: 'Client accepted scope, 2 consolidated revision rounds, and hourly cap.'
      },
      {
        id: 'EVT-4',
        actorKind: 'human',
        actorName: 'Arafat Rahman (Studio Lead)',
        timestamp: '2026-11-20 12:25 +06',
        stateBefore: 'accepted',
        stateAfter: 'assigned',
        summary: 'Assigned to Nusrat Jahan (Senior Visual Designer).'
      },
      {
        id: 'EVT-5',
        actorKind: 'si',
        actorName: 'SI Assistant (Human Approved)',
        timestamp: '2026-11-20 14:25 +06',
        stateBefore: 'in_production',
        stateAfter: 'in_production',
        summary: 'Completed platform safe-area preflight check (approved by Nusrat Jahan).'
      },
      {
        id: 'EVT-6',
        actorKind: 'human',
        actorName: 'Nusrat Jahan (Senior Visual Designer)',
        timestamp: '2026-11-21 03:50 +06',
        stateBefore: 'in_production',
        stateAfter: 'proof_ready',
        summary: 'Uploaded Proof v1.0 for client review and pin annotation.'
      }
    ]
  },
  {
    id: 'PRJ-2026-105',
    title: 'Studio Emblem Vector Cleanup (10-Min Micro-Edit)',
    clientName: 'Tanvir Hasan (DEMO CLIENT)',
    serviceId: 'SRV-02',
    serviceName: 'Logo Cleanup, Vectorization & Micro-Edit',
    variantLabel: 'Express Single-File Vector Fix',
    scopedHours: 1,
    addons: [],
    expressRequested: true,
    expressEligible: true,
    status: 'request_submitted',
    assignedExpert: 'Unassigned — Awaiting Studio Triage',
    revisionsIncluded: 2,
    revisionsUsed: 0,
    proofVersion: 'Pending',
    proofNotes: 'Awaiting studio acceptance and 10-min express slot confirmation.',
    annotations: [],
    siProposals: [
      {
        id: 'SI-905',
        task: '10-Min Express Eligibility Verification',
        summary: 'Single SVG/PNG file detected; clean geometric paths confirm eligibility for 10-min express slot once accepted.',
        status: 'suggested',
        createdAt: '2026-11-21 04:45 +06'
      }
    ],
    events: [
      {
        id: 'EVT-10',
        actorKind: 'system',
        actorName: 'System Automation',
        timestamp: '2026-11-21 04:44 +06',
        stateBefore: 'request_draft',
        stateAfter: 'request_submitted',
        summary: 'Express micro-edit request submitted. Clock starts only after manual studio slot confirmation.'
      }
    ]
  }
];

const CreativeOfficeContext = createContext(null);

function useCreativeOffice() {
  const ctx = useContext(CreativeOfficeContext);
  if (!ctx) throw new Error('useCreativeOffice must be used within CreativeOfficeProvider');
  return ctx;
}

function getDhakaTimestamp() {
  try {
    const now = new Date();
    return (
      now.toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' +06'
    );
  } catch {
    return '2026-11-21 05:20 +06';
  }
}

// ----------------------------------------------------------------------------
// 4. ANIME.JS KINETIC HELPERS & BRAND MONOGRAM
// ----------------------------------------------------------------------------
function AnimatedNumber({ value, decimals = 0, suffix = '', reducedMotion = false }) {
  const [displayVal, setDisplayVal] = useState(value);
  const proxyRef = useRef({ val: value });

  useEffect(() => {
    if (reducedMotion) {
      setDisplayVal(value);
      proxyRef.current.val = value;
      return;
    }
    const anim = runKinetic(proxyRef.current, {
      val: value,
      duration: 550,
      ease: 'outExpo',
      onUpdate: () => {
        setDisplayVal(Number(proxyRef.current.val.toFixed(decimals)));
      },
      update: () => {
        setDisplayVal(Number(proxyRef.current.val.toFixed(decimals)));
      }
    });
    return () => {
      if (anim && typeof anim.pause === 'function') anim.pause();
    };
  }, [value, decimals, reducedMotion]);

  return (
    <span>
      {displayVal}
      {suffix}
    </span>
  );
}

function StudioMonogram({ size = 36, interactive = false, reducedMotion = false }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || !svgRef.current) return;
    const strokes = svgRef.current.querySelectorAll('.fs-monogram-stroke');
    drawSvgPaths(strokes, 1100, 140);
  }, [reducedMotion]);

  const handleHoverPulse = () => {
    if (reducedMotion || !svgRef.current) return;
    runKinetic(svgRef.current, {
      scale: [1, 1.1, 1],
      rotate: [0, -4, 0],
      duration: 480,
      ease: getSpringEase()
    });
  };

  return (
    <svg
      ref={svgRef}
      onMouseEnter={interactive ? handleHoverPulse : undefined}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Freakin's Studio Official Monogram"
      className="shrink-0"
    >
      <rect
        className="fs-monogram-stroke"
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="10"
        fill="#090A0A"
        stroke="#D9BD81"
        strokeWidth="1.75"
      />
      <path d="M14 13H34V17.5H19V22H31V26.5H19V35H14V13Z" fill="#D9BD81" />
      <path d="M24 29.5H34V35H24V29.5Z" fill="#F6F4EF" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// 5. INTERACTIVE ANIME.JS ORBITAL CONSTELLATION (CONCEPT A SPATIAL STAGE)
// ----------------------------------------------------------------------------
function InteractiveCreativeOrbitStage({
  reducedMotion,
  activeOrbitFocus,
  setActiveOrbitFocus,
  parsedIntent,
  onNavigateRoute,
  onSelectDisciplineForServices
}) {
  const stageRef = useRef(null);
  const [selectedSatellite, setSelectedSatellite] = useState('human');
  const [activeDisciplineCode, setActiveDisciplineCode] = useState('DISC-01');

  useEffect(() => {
    if (activeOrbitFocus !== 'all') {
      setSelectedSatellite(activeOrbitFocus);
    }
  }, [activeOrbitFocus]);

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const root = stageRef.current;

    drawSvgPaths(root.querySelectorAll('.orbit-ring-path'), 1300, 160);

    const outerRing = runKinetic(root.querySelectorAll('.orbit-calibration-ring'), {
      rotate: 360,
      duration: 48000,
      loop: true,
      ease: 'linear'
    });

    const innerRing = runKinetic(root.querySelectorAll('.orbit-inner-telemetry'), {
      rotate: -360,
      duration: 36000,
      loop: true,
      ease: 'linear'
    });

    const haloPulse = runKinetic(root.querySelectorAll('.intent-core-halo'), {
      scale: [0.92, 1.12, 0.92],
      opacity: [0.3, 0.75, 0.3],
      duration: 3000,
      loop: true,
      ease: 'inOutSine'
    });

    runKinetic(root.querySelectorAll('.discipline-orbit-chip'), {
      opacity: [0, 1],
      y: [12, 0],
      delay: getStagger(75, { start: 250 }),
      duration: 480,
      ease: 'outQuad'
    });

    return () => {
      [outerRing, innerRing, haloPulse].forEach((anim) => {
        if (anim && typeof anim.pause === 'function') anim.pause();
      });
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const root = stageRef.current;
    drawSvgPaths(root.querySelectorAll(`.beam-${selectedSatellite}`), 520, 0);
    runKinetic(root.querySelectorAll(`.sat-node-${selectedSatellite}`), {
      scale: [0.92, 1.08, 1],
      duration: 520,
      ease: getSpringEase()
    });
  }, [selectedSatellite, parsedIntent, reducedMotion]);

  const satellites = [
    {
      id: 'free',
      code: 'ORBIT I • LAYER B',
      title: 'Free Local Tools',
      metric: '6 Browser Utilities',
      detail: 'Resize, Compress, Palette, Contrast, Brief Template & 3D Preview — 0 KB uploaded.',
      route: 'tools',
      cta: 'Launch Free Tools',
      cx: 108,
      cy: 86
    },
    {
      id: 'ai',
      code: 'ORBIT II • LAYER C+D',
      title: 'Studio AI & Kits',
      metric: 'No Puter Login',
      detail: '5 AI Assistants + Proposed ৳49 / ৳99 / ৳199 utility packs via server gateway.',
      route: 'kits',
      cta: 'Open AI & Kits',
      cx: 332,
      cy: 86
    },
    {
      id: 'human',
      code: 'ORBIT III • STUDIO',
      title: 'Human Creative Studio',
      metric: '13 Core Services',
      detail: '4 Disciplines, 15 Variants, 5 Bundles, 14 Add-ons & 2 Consolidated Revisions.',
      route: 'services',
      cta: 'Explore 13 Services',
      cx: 220,
      cy: 312
    }
  ];

  const activeSatObj = satellites.find((s) => s.id === selectedSatellite) || satellites[2];

  return (
    <div
      ref={stageRef}
      className="rounded-3xl bg-[#111315] border border-[#D9BD81]/35 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#D9BD81]">
          <Activity className="w-3.5 h-3.5" />
          <span>{reducedMotion ? 'STATIC ORBIT MAP' : 'ANIME.JS CONSTELLATION'}</span>
        </span>
        <span className="text-[11px] font-mono text-[#F6F4EF]/65">Interactive Nodes</span>
      </div>

      {/* Interactive SVG Orbital Canvas */}
      <div className="relative w-full flex items-center justify-center">
        <svg
          viewBox="0 0 440 370"
          className="w-full max-w-[430px] h-auto overflow-visible select-none"
          role="img"
          aria-label="Interactive orbital map connecting Intent Core to Free Tools, Studio AI, and Human Creative Services"
        >
          {/* Outer Rotating Calibration Ring */}
          <g className="orbit-calibration-ring" style={{ transformOrigin: '220px 185px' }}>
            <circle
              cx="220"
              cy="185"
              r="160"
              fill="none"
              stroke="rgba(217, 189, 129, 0.24)"
              strokeWidth="1.25"
              strokeDasharray="3 9"
            />
          </g>

          {/* Inner Counter-Rotating Telemetry Ring */}
          <g className="orbit-inner-telemetry" style={{ transformOrigin: '220px 185px' }}>
            <circle
              cx="220"
              cy="185"
              r="62"
              fill="none"
              stroke="rgba(217, 189, 129, 0.3)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </g>

          {/* Primary Architectural Orbit Ring */}
          <circle
            className="orbit-ring-path"
            cx="220"
            cy="185"
            r="132"
            fill="none"
            stroke="rgba(217, 189, 129, 0.38)"
            strokeWidth="1.25"
          />

          {/* Kinetic Signal Beams from Center Core (220, 185) to Satellites */}
          {satellites.map((sat) => {
            const isSelected = sat.id === selectedSatellite;
            return (
              <line
                key={sat.id}
                className={`beam-${sat.id}`}
                x1="220"
                y1="185"
                x2={sat.cx}
                y2={sat.cy}
                stroke={isSelected ? '#D9BD81' : 'rgba(217, 189, 129, 0.22)'}
                strokeWidth={isSelected ? '2.5' : '1'}
                strokeDasharray={isSelected ? 'none' : '3 4'}
              />
            );
          })}

          {/* Central Intent Core Node */}
          <g transform="translate(220, 185)">
            <circle className="intent-core-halo" r="46" fill="rgba(217, 189, 129, 0.2)" />
            <circle r="35" fill="#090A0A" stroke="#D9BD81" strokeWidth="2" />
            <text
              y="-4"
              textAnchor="middle"
              fill="#D9BD81"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              INTENT
            </text>
            <text
              y="9"
              textAnchor="middle"
              fill="#F6F4EF"
              fontSize="8"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              CORE OS
            </text>
          </g>

          {/* Interactive Satellite Nodes */}
          {satellites.map((sat) => {
            const active = sat.id === selectedSatellite;
            return (
              <g
                key={sat.id}
                className={`sat-node-${sat.id} cursor-pointer`}
                style={{ transformOrigin: `${sat.cx}px ${sat.cy}px` }}
                onClick={() => {
                  setSelectedSatellite(sat.id);
                  setActiveOrbitFocus(sat.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${sat.title}: ${sat.metric}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSatellite(sat.id);
                    setActiveOrbitFocus(sat.id);
                  }
                }}
              >
                <rect
                  x={sat.cx - 72}
                  y={sat.cy - 28}
                  width="144"
                  height="56"
                  rx="14"
                  fill={active ? '#D9BD81' : '#090A0A'}
                  stroke="#D9BD81"
                  strokeWidth={active ? '2' : '1.25'}
                />
                <text
                  x={sat.cx}
                  y={sat.cy - 7}
                  textAnchor="middle"
                  fill={active ? '#090A0A' : '#D9BD81'}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {sat.code}
                </text>
                <text
                  x={sat.cx}
                  y={sat.cy + 10}
                  textAnchor="middle"
                  fill={active ? '#090A0A' : '#F6F4EF'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {sat.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Selected Orbit Readout Card */}
      <div className="p-4 rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold text-[#D9BD81]">
            {activeSatObj.code} • {activeSatObj.metric}
          </span>
          <button
            type="button"
            onClick={() => onNavigateRoute(activeSatObj.route)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold hover:brightness-105 transition min-h-[36px]"
          >
            <span>{activeSatObj.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-[#F6F4EF]/85 leading-relaxed">{activeSatObj.detail}</p>

        {/* Interactive 4 Creative Disciplines Selector */}
        <div className="pt-2.5 border-t border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#F6F4EF]/60">
            Jump Directly to Approved Discipline:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DISCIPLINES.map((d) => {
              const Icon = d.icon;
              const isDiscActive = activeDisciplineCode === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onMouseEnter={() => setActiveDisciplineCode(d.id)}
                  onClick={() => onSelectDisciplineForServices(d.id)}
                  className={`discipline-orbit-chip flex items-center gap-1.5 text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                    isDiscActive
                      ? 'bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40'
                      : 'bg-[#232528]/60 text-[#F6F4EF]/85 hover:bg-[#232528]'
                  }`}
                >
                  <Icon className="w-3 h-3 text-[#D9BD81] shrink-0" />
                  <span className="truncate">
                    {d.code}. {d.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 6. INTERACTIVE "OUR STUDIO CRAFT & B+C+D ENGINE" SHOWCASE
// ----------------------------------------------------------------------------
function StudioCraftInteractiveShowcase({ reducedMotion, onNavigateRoute }) {
  const [activeTab, setActiveTab] = useState('ladder');
  const [selectedStep, setSelectedStep] = useState(0);
  const [copiedToken, setCopiedToken] = useState('');
  const showcaseRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || !showcaseRef.current) return;
    runKinetic(showcaseRef.current.querySelectorAll('.craft-card-stagger'), {
      opacity: [0, 1],
      y: [14, 0],
      delay: getStagger(65),
      duration: 450,
      ease: 'outCubic'
    });
  }, [activeTab, reducedMotion]);

  const ladderSteps = [
    {
      code: 'LAYER B',
      title: 'Browser-Native Free Utilities',
      subtitle: 'Zero Login • Zero Upload • 100% Local Canvas',
      desc: 'Visitors resize creatives, compress assets, extract HEX palettes, and verify WCAG 2.2 contrast locally before spending anything.',
      route: 'tools',
      cta: 'Open 6 Local Tools'
    },
    {
      code: 'LAYER C',
      title: 'Studio-Sponsored Freemium AI',
      subtitle: 'No Puter Login Required • Server-Guarded',
      desc: 'Visitors test AI ad hooks, captions, and brief outlines via our server gateway without ever being forced to sign in to Puter.',
      route: 'kits',
      cta: 'Try No-Login AI'
    },
    {
      code: 'LAYER D',
      title: 'Low-Ticket AI Micro-Products',
      subtitle: 'Proposed ৳49 / ৳99 / ৳199 Utility Packs',
      desc: 'Transparent, fixed-output creative kits with verified webhook fulfillment and one-click upgrade paths to human designers.',
      route: 'kits',
      cta: 'Inspect Micro-Kits'
    },
    {
      code: 'HUMAN STUDIO',
      title: '13 Core Creative Services & Office',
      subtitle: '4 Disciplines • 5 Bundles • 14 Add-ons • 2 Revisions',
      desc: 'Scoped hourly engagements crafted by named human specialists, backed by event-driven timelines and pinned proofing.',
      route: 'services',
      cta: 'Explore 13 Services'
    }
  ];

  const brandTokens = [
    { name: 'Obsidian', hex: '#090A0A', role: 'Primary Stage & Authority', darkText: false },
    { name: 'Champagne Gold', hex: '#D9BD81', role: 'Brand Signature & Focus', darkText: true },
    { name: 'Ivory', hex: '#F6F4EF', role: 'Editorial & Reading Surface', darkText: true },
    { name: 'Graphite', hex: '#232528', role: 'Modular Panels & Dividers', darkText: false }
  ];

  return (
    <section
      ref={showcaseRef}
      className="rounded-3xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF] space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232528] pb-5">
        <div>
          <span className="text-xs font-mono font-bold text-[#D9BD81] uppercase tracking-wider">
            HOW FREAKIN&apos;S STUDIO OPERATES • INTERACTIVE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">
            Built Around Your Creative Momentum
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ladder', label: 'B + C + D Value Engine' },
            { id: 'dna', label: 'Official Brand Identity' },
            { id: 'workflow', label: 'Human + SI Governance' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-[#D9BD81] text-[#090A0A]'
                  : 'bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'ladder' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ladderSteps.map((st, idx) => {
            const active = selectedStep === idx;
            return (
              <div
                key={st.code}
                onClick={() => setSelectedStep(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedStep(idx);
                  }
                }}
                className={`craft-card-stagger p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                  active
                    ? 'bg-[#232528] border-[#D9BD81] shadow-lg'
                    : 'bg-[#121417] border-[#232528] hover:border-[#D9BD81]/50'
                }`}
              >
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-extrabold bg-[#D9BD81] text-[#090A0A]">
                    {st.code}
                  </span>
                  <h3 className="text-lg font-bold text-[#F6F4EF]">{st.title}</h3>
                  <div className="text-xs font-semibold text-[#D9BD81]">{st.subtitle}</div>
                  <p className="text-xs text-[#F6F4EF]/80 leading-relaxed pt-1">{st.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateRoute(st.route);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#D9BD81] hover:underline pt-2"
                >
                  <span>{st.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'dna' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <StudioMonogram size={48} interactive reducedMotion={reducedMotion} />
              <div>
                <div className="text-lg font-extrabold tracking-wider">FREAKIN&apos;S STUDIO</div>
                <div className="text-xs tracking-[0.2em] text-[#D9BD81]">DESIGN. CREATE. PRODUCE. GROW.</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#F6F4EF]/80 leading-relaxed">
              Every interface, proof sheet, and deliverable adheres strictly to our approved four-color architecture with WCAG 2.2 AA contrast and bilingual English + বাংলা typography. Click any swatch to copy its HEX token.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {brandTokens.map((tok) => (
              <button
                key={tok.hex}
                type="button"
                onClick={(e) => {
                  navigator.clipboard?.writeText(tok.hex);
                  setCopiedToken(tok.hex);
                  if (!reducedMotion) {
                    runKinetic(e.currentTarget, {
                      scale: [0.94, 1.05, 1],
                      duration: 400,
                      ease: getSpringEase()
                    });
                  }
                  setTimeout(() => setCopiedToken(''), 1600);
                }}
                style={{ backgroundColor: tok.hex }}
                className={`craft-card-stagger p-4 rounded-2xl border border-[#D9BD81]/40 text-left h-36 flex flex-col justify-between transition ${
                  tok.darkText ? 'text-[#090A0A]' : 'text-[#F6F4EF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold">{tok.hex}</span>
                  {copiedToken === tok.hex ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                </div>
                <div>
                  <div className="font-bold text-sm">{tok.name}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{tok.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              badge: 'HUMAN AUTHORITY',
              title: 'Manual Studio Control',
              points: [
                'Human leads scope hours & issue official quotes',
                'Named designers execute brand, social, print & motion work',
                '10-minute express slots confirmed manually after file preflight'
              ]
            },
            {
              badge: 'GATED SI ASSISTANT',
              title: 'Auditable Synthetic Intelligence',
              points: [
                'SI drafts checklists, copy hooks & QA contrast notes',
                'SI can NEVER approve money, deadlines, or final files',
                'Every SI output stays hidden until human approval'
              ]
            },
            {
              badge: 'ZERO FABRICATION',
              title: 'Event-Backed Truth',
              points: [
                'Progress comes from persisted events—no fake percentages',
                'Concept portfolio clearly labeled Concept Work',
                'Missing project IDs return truthful HTTP 404 guards'
              ]
            }
          ].map((col) => (
            <div key={col.badge} className="craft-card-stagger p-5 rounded-2xl bg-[#232528]/70 border border-[#F6F4EF]/10 space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#D9BD81] text-[#090A0A]">
                {col.badge}
              </span>
              <h3 className="text-lg font-bold text-[#F6F4EF]">{col.title}</h3>
              <ul className="space-y-2 text-xs text-[#F6F4EF]/85">
                {col.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D9BD81] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ----------------------------------------------------------------------------
// 7. LAYER B: REAL BROWSER-NATIVE CREATIVE TOOLS
// ----------------------------------------------------------------------------
function FreeCreativePlayground({ lang, reducedMotion, onBridgeToBrief, onBridgeToAi }) {
  const [activeTool, setActiveTool] = useState('resizer');
  const [sourceImageUrl, setSourceImageUrl] = useState(null);
  const [sourceFileName, setSourceFileName] = useState('freakins-sample-artboard.png');
  const [sourceDimensions, setSourceDimensions] = useState({ w: 1200, h: 1200 });
  const [statusMessage, setStatusMessage] = useState('');

  const [targetWidth, setTargetWidth] = useState(1080);
  const [targetHeight, setTargetHeight] = useState(1350);
  const [exportFormat, setExportFormat] = useState('image/png');

  const [quality, setQuality] = useState(0.78);
  const [compressedInfo, setCompressedInfo] = useState({ originalKb: 0, compressedKb: 0, dataUrl: '' });

  const [extractedPalette, setExtractedPalette] = useState([
    '#090A0A',
    '#D9BD81',
    '#F6F4EF',
    '#232528',
    '#8F7643',
    '#3D4045'
  ]);
  const [copiedHex, setCopiedHex] = useState('');

  const [fgColor, setFgColor] = useState('#D9BD81');
  const [bgColor, setBgColor] = useState('#090A0A');

  const [tplBrand, setTplBrand] = useState('');
  const [tplDiscipline, setTplDiscipline] = useState('Social Media & Campaign Creative');
  const [tplGoal, setTplGoal] = useState('');
  const [tplAudience, setTplAudience] = useState('');
  const [tplDeadline] = useState('Standard Milestone Schedule');

  const [rotY, setRotY] = useState(28);
  const [rotX, setRotX] = useState(-14);

  const workbenchRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || !workbenchRef.current) return;
    const root = workbenchRef.current;
    runKinetic(root.querySelectorAll('.tool-panel-enter'), {
      opacity: [0, 1],
      y: [10, 0],
      duration: 380,
      ease: 'outCubic'
    });
    runKinetic(root.querySelectorAll('.local-canvas-scanline'), {
      top: ['0%', '100%'],
      opacity: [0.85, 0],
      duration: 750,
      ease: 'inOutQuad'
    });
  }, [activeTool, sourceImageUrl, reducedMotion]);

  const generateBuiltInSample = useCallback(() => {
    const off = document.createElement('canvas');
    off.width = 1200;
    off.height = 1200;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090A0A';
    ctx.fillRect(0, 0, 1200, 1200);

    ctx.strokeStyle = '#232528';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1080, 1080);

    ctx.strokeStyle = '#D9BD81';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(600, 600, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(217, 189, 129, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 600, 270, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#D9BD81';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("FREAKIN'S STUDIO • LOCAL SPECIMEN", 600, 490);

    ctx.fillStyle = '#F6F4EF';
    ctx.font = 'bold 76px sans-serif';
    ctx.fillText('DESIGN. CREATE.', 600, 595);
    ctx.fillText('PRODUCE. GROW.', 600, 685);

    ctx.fillStyle = '#A8A295';
    ctx.font = '28px sans-serif';
    ctx.fillText('1200 × 1200 PX • 100% BROWSER CANVAS', 600, 770);

    const url = off.toDataURL('image/png');
    setSourceImageUrl(url);
    setSourceDimensions({ w: 1200, h: 1200 });
    setSourceFileName('freakins-local-specimen.png');
  }, []);

  useEffect(() => {
    generateBuiltInSample();
  }, [generateBuiltInSample]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusMessage('Please select a valid PNG, JPEG, or WebP image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl !== 'string') return;
      const img = new Image();
      img.onload = () => {
        setSourceImageUrl(dataUrl);
        setSourceDimensions({ w: img.width, h: img.height });
        setSourceFileName(file.name);
        setStatusMessage(`Loaded "${file.name}" (${img.width}×${img.height}px) locally in browser memory.`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!sourceImageUrl) return;
    const img = new Image();
    img.onload = () => {
      const pCanvas = document.createElement('canvas');
      const pCtx = pCanvas.getContext('2d');
      pCanvas.width = 64;
      pCanvas.height = 64;
      if (pCtx) {
        pCtx.drawImage(img, 0, 0, 64, 64);
        const data = pCtx.getImageData(0, 0, 64, 64).data;
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 24) * 24;
          const g = Math.round(data[i + 1] / 24) * 24;
          const b = Math.round(data[i + 2] / 24) * 24;
          const hex =
            '#' +
            [Math.min(255, r), Math.min(255, g), Math.min(255, b)]
              .map((v) => v.toString(16).padStart(2, '0'))
              .join('')
              .toUpperCase();
          buckets.set(hex, (buckets.get(hex) || 0) + 1);
        }
        const sorted = Array.from(buckets.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([hex]) => hex);
        if (sorted.length > 0) setExtractedPalette(sorted);
      }

      const cCanvas = document.createElement('canvas');
      cCanvas.width = img.width;
      cCanvas.height = img.height;
      const cCtx = cCanvas.getContext('2d');
      if (cCtx) {
        cCtx.drawImage(img, 0, 0);
        const originalData = cCanvas.toDataURL('image/png');
        const compressedData = cCanvas.toDataURL('image/jpeg', quality);
        const origKb = Math.max(1, Math.round((originalData.length * 3) / 4 / 1024));
        const compKb = Math.max(1, Math.round((compressedData.length * 3) / 4 / 1024));
        setCompressedInfo({ originalKb: origKb, compressedKb: compKb, dataUrl: compressedData });
      }
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl, quality]);

  const handleExportResized = () => {
    if (!sourceImageUrl) return;
    const img = new Image();
    img.onload = () => {
      const out = document.createElement('canvas');
      out.width = Math.max(32, Number(targetWidth) || 1080);
      out.height = Math.max(32, Number(targetHeight) || 1080);
      const ctx = out.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#090A0A';
      ctx.fillRect(0, 0, out.width, out.height);

      const scale = Math.max(out.width / img.width, out.height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (out.width - drawW) / 2;
      const dy = (out.height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);

      const ext = exportFormat === 'image/webp' ? 'webp' : exportFormat === 'image/jpeg' ? 'jpg' : 'png';
      const dataUrl = out.toDataURL(exportFormat, 0.92);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `freakins-${out.width}x${out.height}.${ext}`;
      a.click();
      setStatusMessage(`Exported ${out.width}×${out.height}px (${ext.toUpperCase()}) locally.`);
    };
    img.src = sourceImageUrl;
  };

  const handleExportCompressed = () => {
    if (!compressedInfo.dataUrl) return;
    const a = document.createElement('a');
    a.href = compressedInfo.dataUrl;
    a.download = `freakins-compressed-q${Math.round(quality * 100)}.jpg`;
    a.click();
    setStatusMessage(`Exported compressed JPEG (${compressedInfo.compressedKb} KB) locally.`);
  };

  const contrastMetrics = useMemo(() => {
    const parseHex = (hex) => {
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return [0, 0, 0];
      return [
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255
      ];
    };
    const luminance = ([r, g, b]) => {
      const channel = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const l1 = luminance(parseHex(fgColor));
    const l2 = luminance(parseHex(bgColor));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return {
      ratio: Number(ratio.toFixed(2)),
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaaNormal: ratio >= 7.0
    };
  }, [fgColor, bgColor]);

  const generatedTemplateMarkdown = useMemo(() => {
    return [
      `# Creative Production Brief — Freakin's Studio`,
      `- **Brand / Project:** ${tplBrand || '[Your Brand Name]'}`,
      `- **Discipline:** ${tplDiscipline}`,
      `- **Primary Objective:** ${tplGoal || '[Define campaign or brand goal]'}`,
      `- **Target Audience:** ${tplAudience || '[Define customer segment]'}`,
      `- **Delivery Window:** ${tplDeadline}`,
      `- **Extracted Brand Palette:** ${extractedPalette.join(', ')}`,
      `- **Revision Policy:** 2 Consolidated Revision Rounds Included`,
      ``,
      `## Required Assets & Notes`,
      `- Provide vector logo (SVG/EPS) or high-res PNG if existing.`,
      `- Express 10-min delivery applies only to eligible single-file micro-edits upon slot acceptance.`
    ].join('\n');
  }, [tplBrand, tplDiscipline, tplGoal, tplAudience, tplDeadline, extractedPalette]);

  const handleDownloadBriefTemplate = () => {
    const blob = new Blob([generatedTemplateMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freakins-creative-brief-template.md';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Downloaded structured Creative Brief Markdown locally.');
  };

  const toolsList = [
    { id: 'resizer', label: 'Image Resizer & Export', icon: Sliders },
    { id: 'compressor', label: 'Image Compressor', icon: Zap },
    { id: 'palette', label: 'Palette Extractor', icon: Palette },
    { id: 'contrast', label: 'WCAG Contrast Checker', icon: Eye },
    { id: 'briefTpl', label: 'Brief Template Builder', icon: FileText },
    { id: 'mockup3d', label: '3D Packaging Preview', icon: Box }
  ];

  return (
    <section ref={workbenchRef} aria-labelledby="playground-heading" className="space-y-6">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            <Shield className="w-3.5 h-3.5" />
            REAL LOCAL FUNCTIONALITY • ZERO LOGIN • ZERO SERVER UPLOAD
          </span>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm hover:brightness-105 transition min-h-[44px]">
            <Upload className="w-4 h-4" />
            <span>Upload Local Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
          </label>
        </div>
        <h2 id="playground-heading" className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === 'bn' ? 'ব্রাউজার-নেটিভ ফ্রি ক্রিয়েটিভ টুলস' : 'Browser-Native Free Creative Playground'}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#F6F4EF]/80 max-w-3xl">
          {lang === 'bn'
            ? 'আপনার ছবি বা ফাইল কখনোই সার্ভারে আপলোড হয় না। সরাসরি আপনার ব্রাউজারে রিসাইজ, কম্প্রেস, কালার প্যালেট এবং ব্রিফ তৈরি করুন।'
            : 'Every utility below runs 100% locally in your browser using HTML5 Canvas and deterministic math. Your images never leave your device.'}
        </p>

        <div role="tablist" aria-label="Free Creative Utilities" className="mt-6 flex flex-wrap gap-2">
          {toolsList.map((t) => {
            const Icon = t.icon;
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTool(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#D9BD81] ${
                  active
                    ? 'bg-[#D9BD81] text-[#090A0A] shadow-md'
                    : 'bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80 border border-[#F6F4EF]/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 px-4 py-2.5 rounded-xl bg-[#232528] border border-[#D9BD81]/40 text-xs sm:text-sm text-[#D9BD81] flex items-center justify-between"
          >
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="text-[#F6F4EF]/70 hover:text-[#F6F4EF] p-1" aria-label="Dismiss status">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tool Workbench Card */}
      <div className="tool-panel-enter rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 sm:p-8 text-[#090A0A] shadow-sm">
        {activeTool === 'resizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div>
                <h3 className="text-xl font-bold">Image Resizer & Platform Exporter</h3>
                <p className="text-sm text-[#232528] mt-1">
                  Source: <span className="font-mono text-xs bg-[#090A0A]/10 px-2 py-0.5 rounded">{sourceFileName}</span> ({sourceDimensions.w}×{sourceDimensions.h}px)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#232528] mb-2">
                  Quick Social & Web Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'IG Square (1080×1080)', w: 1080, h: 1080 },
                    { name: 'IG Portrait (1080×1350)', w: 1080, h: 1350 },
                    { name: 'Story / Reel (1080×1920)', w: 1080, h: 1920 },
                    { name: 'FB Cover (1640×624)', w: 1640, h: 624 }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setTargetWidth(preset.w);
                        setTargetHeight(preset.h);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition min-h-[44px] ${
                        targetWidth === preset.w && targetHeight === preset.h
                          ? 'bg-[#090A0A] text-[#D9BD81] border-[#090A0A]'
                          : 'bg-white text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="resize-w" className="block text-xs font-bold text-[#232528] mb-1">
                    Width (px)
                  </label>
                  <input
                    id="resize-w"
                    type="number"
                    min="32"
                    max="4096"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="resize-h" className="block text-xs font-bold text-[#232528] mb-1">
                    Height (px)
                  </label>
                  <input
                    id="resize-h"
                    type="number"
                    min="32"
                    max="4096"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="export-fmt" className="block text-xs font-bold text-[#232528] mb-1">
                  Output Format
                </label>
                <select
                  id="export-fmt"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base"
                >
                  <option value="image/png">PNG (Lossless Transparency)</option>
                  <option value="image/jpeg">JPEG (Universal Web)</option>
                  <option value="image/webp">WebP (Modern Lightweight)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportResized}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>Download Resized Asset ({targetWidth}×{targetHeight}px)</span>
              </button>
            </div>

            <div className="lg:col-span-7 relative bg-[#090A0A] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px] border border-[#232528] overflow-hidden">
              {!reducedMotion && (
                <div
                  aria-hidden="true"
                  className="local-canvas-scanline pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D9BD81] to-transparent"
                />
              )}
              <div className="text-xs font-mono text-[#D9BD81] mb-3">
                LIVE LOCAL PREVIEW • ASPECT {(targetWidth / Math.max(1, targetHeight)).toFixed(2)}:1
              </div>
              {sourceImageUrl && (
                <div
                  style={{
                    aspectRatio: `${Math.max(1, targetWidth)} / ${Math.max(1, targetHeight)}`,
                    maxHeight: '280px',
                    maxWidth: '100%',
                    transition: reducedMotion ? 'none' : 'aspect-ratio 240ms ease'
                  }}
                  className="overflow-hidden rounded-lg border-2 border-[#D9BD81]/60 shadow-lg bg-[#232528] flex items-center justify-center"
                >
                  <img src={sourceImageUrl} alt="Local resize preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTool === 'compressor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl font-bold">Client-Side Image Compressor</h3>
              <p className="text-sm text-[#232528]">
                Adjust JPEG compression quality in real time and compare local byte savings before exporting.
              </p>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <label htmlFor="quality-range">Compression Quality</label>
                  <span className="font-mono text-[#090A0A]">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="quality-range"
                  type="range"
                  min="0.15"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[#090A0A] h-3 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-[#232528]/15">
                <div>
                  <div className="text-xs text-[#232528]">Original Est.</div>
                  <div className="text-lg font-bold font-mono">
                    <AnimatedNumber value={compressedInfo.originalKb} suffix=" KB" reducedMotion={reducedMotion} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#232528]">Compressed</div>
                  <div className="text-lg font-bold font-mono text-emerald-700">
                    <AnimatedNumber value={compressedInfo.compressedKb} suffix=" KB" reducedMotion={reducedMotion} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#232528]">Reduction</div>
                  <div className="text-lg font-bold font-mono">
                    <AnimatedNumber
                      value={Math.max(
                        0,
                        Math.round(
                          ((compressedInfo.originalKb - compressedInfo.compressedKb) /
                            Math.max(1, compressedInfo.originalKb)) *
                            100
                        )
                      )}
                      suffix="%"
                      reducedMotion={reducedMotion}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCompressed}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>Export Compressed Image ({compressedInfo.compressedKb} KB)</span>
              </button>
            </div>

            <div className="lg:col-span-6 bg-[#090A0A] rounded-2xl p-6 flex flex-col items-center justify-center">
              {compressedInfo.dataUrl && (
                <img
                  src={compressedInfo.dataUrl}
                  alt="Compressed output preview"
                  className="max-h-[260px] rounded-xl border border-[#D9BD81]/40 object-contain"
                />
              )}
            </div>
          </div>
        )}

        {activeTool === 'palette' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Deterministic Color Palette Extractor</h3>
                <p className="text-sm text-[#232528]">
                  Sampled directly from pixels in <span className="font-mono text-xs">{sourceFileName}</span>. Click any swatch to copy HEX.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onBridgeToBrief(`Palette Swatches: ${extractedPalette.join(', ')}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
              >
                <span>Attach Palette to Smart Brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {extractedPalette.map((hex, i) => (
                <button
                  key={hex}
                  type="button"
                  onClick={(e) => {
                    navigator.clipboard?.writeText(hex);
                    setCopiedHex(hex);
                    setFgColor(hex);
                    if (!reducedMotion) {
                      runKinetic(e.currentTarget, {
                        scale: [0.95, 1.04, 1],
                        duration: 380,
                        ease: getSpringEase()
                      });
                    }
                    setTimeout(() => setCopiedHex(''), 1800);
                  }}
                  className="group rounded-2xl overflow-hidden border border-[#232528]/20 bg-white text-left shadow-sm hover:border-[#090A0A] transition focus:outline-none focus:ring-2 focus:ring-[#D9BD81]"
                >
                  <div style={{ backgroundColor: hex }} className="h-24 w-full flex items-end p-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold">{hex}</span>
                    {copiedHex === hex ? (
                      <Check className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#232528]/60 group-hover:text-[#090A0A]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTool === 'contrast' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl font-bold">WCAG 2.2 Brand Contrast Checker</h3>
              <p className="text-sm text-[#232528]">
                Verify legibility for English & Bangla typography before sending brand assets to print or social feeds.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#232528]/20">
                  <label htmlFor="fg-picker" className="block text-xs font-bold uppercase text-[#232528] mb-2">
                    Text / Foreground
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="fg-picker"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                      className="w-12 h-11 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full font-mono text-sm px-2.5 py-2 border border-[#232528]/20 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#232528]/20">
                  <label htmlFor="bg-picker" className="block text-xs font-bold uppercase text-[#232528] mb-2">
                    Surface / Background
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="bg-picker"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                      className="w-12 h-11 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full font-mono text-sm px-2.5 py-2 border border-[#232528]/20 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFgColor('#D9BD81');
                    setBgColor('#090A0A');
                  }}
                  className="px-3 py-2 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[40px]"
                >
                  Load Freakin&apos;s Gold / Obsidian
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFgColor('#090A0A');
                    setBgColor('#F6F4EF');
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[40px]"
                >
                  Load Obsidian / Ivory
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div
                style={{ backgroundColor: bgColor, color: fgColor }}
                className="p-6 rounded-2xl border border-[#232528]/30 shadow-inner space-y-2 transition-colors duration-200"
              >
                <div className="text-xs font-mono uppercase tracking-widest opacity-80">
                  CONTRAST RATIO: <AnimatedNumber value={contrastMetrics.ratio} decimals={2} suffix=" : 1" reducedMotion={reducedMotion} />
                </div>
                <div className="text-2xl font-bold">DESIGN. CREATE. PRODUCE. GROW.</div>
                <p className="text-base">
                  আপনার ব্যবসার জন্য মানসম্মত ডিজাইন ও ক্রিয়েটিভ সলিউশন — Readable bilingual specimen text.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-3 rounded-xl border font-bold text-xs ${contrastMetrics.aaLarge ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-rose-50 border-rose-600 text-rose-900'}`}>
                  AA Large (3.0:1): {contrastMetrics.aaLarge ? 'PASS' : 'FAIL'}
                </div>
                <div className={`p-3 rounded-xl border font-bold text-xs ${contrastMetrics.aaNormal ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-rose-50 border-rose-600 text-rose-900'}`}>
                  AA Body (4.5:1): {contrastMetrics.aaNormal ? 'PASS' : 'FAIL'}
                </div>
                <div className={`p-3 rounded-xl border font-bold text-xs ${contrastMetrics.aaaNormal ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-amber-50 border-amber-600 text-amber-900'}`}>
                  AAA Body (7.0:1): {contrastMetrics.aaaNormal ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'briefTpl' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold">Offline Creative Brief Template Generator</h3>
              <p className="text-sm text-[#232528]">
                Build a clean, structured creative brief locally—no AI quota or account required.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">Brand or Store Name</label>
                <input
                  type="text"
                  value={tplBrand}
                  onChange={(e) => setTplBrand(e.target.value)}
                  placeholder="e.g., Kazi Roast & Co."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">Creative Discipline</label>
                <select
                  value={tplDiscipline}
                  onChange={(e) => setTplDiscipline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">Primary Deliverable & Goal</label>
                <input
                  type="text"
                  value={tplGoal}
                  onChange={(e) => setTplGoal(e.target.value)}
                  placeholder="e.g., 3 social campaign posts for seasonal launch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">Target Audience</label>
                <input
                  type="text"
                  value={tplAudience}
                  onChange={(e) => setTplAudience(e.target.value)}
                  placeholder="e.g., Urban young professionals in Dhaka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between bg-[#090A0A] text-[#F6F4EF] p-5 rounded-2xl border border-[#232528]">
              <div>
                <div className="text-xs font-mono text-[#D9BD81] mb-2">STRUCTURED MARKDOWN OUTPUT</div>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-[#232528]/60 p-4 rounded-xl border border-[#F6F4EF]/10 overflow-x-auto">
                  {generatedTemplateMarkdown}
                </pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBriefTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .MD Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBridgeToBrief(tplGoal || tplBrand || 'Structured Creative Brief')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#D9BD81]/40 font-semibold text-sm min-h-[44px]"
                >
                  <span>Send to Studio Brief Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'mockup3d' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#090A0A] text-[#D9BD81] text-xs font-bold">
                <Box className="w-3.5 h-3.5" />
                <span>{reducedMotion ? 'STATIC 2D FALLBACK (REDUCED MOTION)' : 'INTERACTIVE 3D SPECIMEN STAGE'}</span>
              </div>
              <h3 className="text-xl font-bold">Brand Packaging & Card Specimen</h3>
              <p className="text-sm text-[#232528]">
                Applies your extracted palette (<span className="font-mono">{extractedPalette[0]}</span> &{' '}
                <span className="font-mono">{extractedPalette[1] || '#D9BD81'}</span>) onto a physical box specimen.
              </p>

              {!reducedMotion && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex justify-between text-xs font-bold mb-1">
                      <span>Horizontal Angle</span>
                      <span className="font-mono">{rotY}°</span>
                    </label>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={rotY}
                      onChange={(e) => setRotY(Number(e.target.value))}
                      className="w-full accent-[#090A0A]"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold mb-1">
                      <span>Vertical Tilt</span>
                      <span className="font-mono">{rotX}°</span>
                    </label>
                    <input
                      type="range"
                      min="-35"
                      max="35"
                      value={rotX}
                      onChange={(e) => setRotX(Number(e.target.value))}
                      className="w-full accent-[#090A0A]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#090A0A] rounded-2xl p-8 flex items-center justify-center min-h-[300px] overflow-hidden">
              <div
                style={{
                  transform: reducedMotion ? 'none' : `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                  transition: reducedMotion ? 'none' : 'transform 150ms ease-out',
                  backgroundColor: extractedPalette[0] || '#090A0A',
                  borderColor: extractedPalette[1] || '#D9BD81'
                }}
                className="w-60 h-72 rounded-2xl border-2 p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <StudioMonogram size={32} reducedMotion={reducedMotion} />
                  <span style={{ color: extractedPalette[1] || '#D9BD81' }} className="text-[10px] font-mono tracking-widest uppercase">
                    EDITION 01
                  </span>
                </div>
                <div>
                  <div style={{ color: extractedPalette[1] || '#D9BD81' }} className="text-xs font-bold uppercase tracking-wider">
                    {tplBrand || "FREAKIN'S STUDIO"}
                  </div>
                  <div className="text-lg font-bold text-[#F6F4EF] mt-1 leading-snug">
                    Crafted Packaging Specimen
                  </div>
                </div>
                <div className="pt-3 border-t border-white/15 flex justify-between text-[10px] font-mono text-[#F6F4EF]/70">
                  <span>CMYK + GOLD FOIL</span>
                  <span>SRV-08</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#232528]/15 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-[#232528]">
            <span className="font-bold text-[#090A0A]">Keep editing free forever</span> — or bridge your work to Studio AI copy or a human designer.
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBridgeToAi}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#090A0A] text-[#090A0A] text-sm font-bold hover:bg-[#090A0A] hover:text-[#D9BD81] transition min-h-[44px]"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate Ad Hooks (Demo AI)</span>
            </button>
            <button
              type="button"
              onClick={() => onBridgeToBrief(`Asset prepared in Free Playground (${sourceFileName})`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-sm font-bold hover:brightness-105 transition min-h-[44px]"
            >
              <span>Finish with a Human Expert</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 8. LAYER C & D: DEMO AI ASSISTANTS + AI MICRO-KITS
// ----------------------------------------------------------------------------
function StudioAiAndKitsView({ reducedMotion, onSelectBriefTopic }) {
  const { aiEnabled, guestQuotaRemaining, consumeGuestQuota, addAdminLog } = useCreativeOffice();
  const [selectedAssistant, setSelectedAssistant] = useState('hooks');
  const [aiPrompt, setAiPrompt] = useState('Artisanal sourdough & cold brew café in Banani, Dhaka');
  const [aiOutput, setAiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKitModal, setSelectedKitModal] = useState(null);
  const outputRef = useRef(null);

  const assistants = [
    { id: 'brief', label: 'AI Creative Brief Assistant' },
    { id: 'hooks', label: 'AI Ad Hook Generator' },
    { id: 'captions', label: 'AI Caption Generator' },
    { id: 'product', label: 'Product Description Assistant' },
    { id: 'brand', label: 'Brand Concept Generator' }
  ];

  const handleRunDemoAi = () => {
    if (!aiEnabled) {
      setAiOutput(
        'STUDIO AI PAUSED: Studio Admin has activated the emergency AI kill switch. All browser-native Free Tools remain 100% operational.'
      );
      return;
    }
    if (guestQuotaRemaining <= 0) {
      setAiOutput(
        'DAILY GUEST TRIAL LIMIT REACHED (3/3 used): Continue using our unlimited Free Local Tools or explore a proposed AI Micro-Kit below.'
      );
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      consumeGuestQuota();
      addAdminLog(`Guest session ran Demo AI Adapter (${selectedAssistant}) via simulated server gateway (no Puter login).`);
      const topic = aiPrompt.trim() || 'Modern Dhaka Lifestyle Brand';
      const responses = {
        brief: `[DEMO AI BRIEF OUTPUT — ${topic}]\n• Objective: Launch high-trust visual campaign highlighting craft quality and fast local delivery.\n• Recommended Core Service: SRV-04 (Social Campaign Static Post Set) + ADD-02 (Bilingual EN/BN Layer).\n• Visual Direction: High-contrast Obsidian & Champagne Gold framing with natural product photography.\n• Included Revisions: 2 Consolidated Rounds.`,
        hooks: `[DEMO AI AD HOOKS — ${topic}]\n1. "Stop scrolling if you care about real craft in Dhaka — here is what goes into ${topic}."\n2. "Why settle for generic templates when ${topic} was built for people who notice details?"\n3. "From first glance to doorstep delivery: experience ${topic} the right way."`,
        captions: `[DEMO AI SOCIAL CAPTIONS — ${topic}]\n• Option A (EN): Crafted with precision, delivered fresh. Discover ${topic} today. #FreakinsStudio #DhakaCraft\n• Option B (BN): নিখুঁত মান ও আধুনিক ডিজাইনের সমন্বয় — ${topic} এখন আপনার হাতের নাগালে।`,
        product: `[DEMO AI PRODUCT LISTING — ${topic}]\nHeadline: ${topic} — Signature Edition\nSummary: Thoughtfully produced for everyday reliability and unmistakable aesthetic appeal. Ready for immediate order with transparent specifications.`,
        brand: `[DEMO AI BRAND CONCEPT — ${topic}]\n• Archetype: The Precision Artisan\n• Tagline Direction: "Crafted for Clarity. Built to Endure."\n• Suggested Palette: Deep Obsidian (#090A0A), Warm Gold (#D9BD81), Crisp Ivory (#F6F4EF).`
      };
      setAiOutput(responses[selectedAssistant]);
      setIsGenerating(false);
      if (!reducedMotion && outputRef.current) {
        runKinetic(outputRef.current, {
          opacity: [0.3, 1],
          y: [8, 0],
          duration: 380,
          ease: 'outCubic'
        });
      }
    }, 320);
  };

  return (
    <section className="space-y-10">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            <Bot className="w-3.5 h-3.5" />
            DEMO AI ADAPTER • ZERO PUTER LOGIN REQUIRED
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#232528] text-[#F6F4EF]">
            Guest Trials Remaining: <strong className="text-[#D9BD81]">{guestQuotaRemaining} / 3</strong>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold">Studio-Sponsored Creative AI Assistants</h2>
        <p className="text-sm text-[#F6F4EF]/80 mt-1 max-w-3xl">
          Visitors never see a Puter sign-in prompt. In production, requests route through{' '}
          <code className="text-[#D9BD81]">/api/ai/generate</code> using a server-owned{' '}
          <code className="text-[#D9BD81]">me.puter</code> gateway with daily spend caps.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {assistants.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAssistant(a.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[44px] ${
                selectedAssistant === a.id
                  ? 'bg-[#D9BD81] text-[#090A0A]'
                  : 'bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <label htmlFor="ai-topic-input" className="block text-xs font-bold uppercase tracking-wider text-[#D9BD81]">
              Describe Your Brand, Product, or Campaign
            </label>
            <textarea
              id="ai-topic-input"
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full rounded-xl bg-[#232528] border border-[#F6F4EF]/15 p-3.5 text-base text-[#F6F4EF] focus:outline-none focus:border-[#D9BD81]"
            />
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleRunDemoAi}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm hover:brightness-105 transition min-h-[48px] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Running Demo AI Adapter...' : 'Generate Draft (No Puter Login)'}</span>
            </button>
          </div>

          <div
            ref={outputRef}
            className="lg:col-span-7 rounded-xl bg-[#232528]/60 border border-[#F6F4EF]/10 p-5 flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="text-xs font-mono text-[#D9BD81] mb-2">STRUCTURED ASSISTANT OUTPUT</div>
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-[#F6F4EF]/95 leading-relaxed">
                {aiOutput || 'Select an assistant and click "Generate Draft" to preview structured output without Puter sign-in.'}
              </pre>
            </div>
            {aiOutput && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-[#F6F4EF]/60">Generated via Demo AI Adapter</span>
                <button
                  type="button"
                  onClick={() => onSelectBriefTopic(aiPrompt)}
                  className="text-xs font-bold text-[#D9BD81] hover:underline inline-flex items-center gap-1"
                >
                  <span>Turn into Human Studio Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold text-[#090A0A]">AI Micro-Product Kits (Layer D Commerce Demo)</h3>
            <p className="text-sm text-[#232528]">
              Fixed-scope downloadable utility packs. Prices shown are owner-proposed test tiers pending live payment webhook verification.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#090A0A] text-[#D9BD81]">
            BACKEND INTEGRATION REQUIRED FOR LIVE CHECKOUT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_MICRO_KITS.map((kit) => (
            <article
              key={kit.id}
              className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 flex flex-col justify-between shadow-sm hover:border-[#090A0A] transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#090A0A] text-[#D9BD81]">
                    {kit.id}
                  </span>
                  <span className="text-xs font-semibold text-[#232528]">Proposed Test Price</span>
                </div>
                <h4 className="text-xl font-bold text-[#090A0A] mt-3">{kit.nameEn}</h4>
                <div className="text-sm text-[#232528]">{kit.nameBn}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#090A0A]">৳{kit.proposedPriceBdt}</span>
                  <span className="text-xs text-[#232528]">one-time pack</span>
                </div>
                <p className="mt-2 text-[11px] text-[#232528]/80 bg-white p-2.5 rounded-lg border border-[#232528]/10">
                  {kit.targetCostNote}
                </p>

                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#090A0A] mb-2">Included Outputs:</div>
                  <ul className="space-y-1.5 text-sm text-[#232528]">
                    {kit.includedOutputs.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#090A0A] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#232528]/15 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedKitModal(kit)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Inspect Kit Contract & Demo Flow</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedKitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kit-modal-title"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="max-w-lg w-full rounded-2xl bg-[#F6F4EF] border-2 border-[#D9BD81] p-6 text-[#090A0A] space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#232528]">VERIFIED OUTPUT CONTRACT • {selectedKitModal.id}</span>
                <h4 id="kit-modal-title" className="text-xl font-bold mt-1">
                  {selectedKitModal.nameEn} (৳{selectedKitModal.proposedPriceBdt} Proposed)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKitModal(null)}
                className="p-2 rounded-lg hover:bg-black/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-400 text-xs text-amber-950 space-y-1">
              <div className="font-bold">Honest Commerce Gate (No Fake Checkout):</div>
              <p>
                Per Studio governance, live payment is disabled until a supported merchant webhook, idempotent credit reservation ledger, and measured Puter cost floor are connected by the Chief Developer.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-[#232528] mb-1">Explicit Exclusions:</div>
              <ul className="text-xs text-[#232528] list-disc pl-5">
                {selectedKitModal.exclusions.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedKitModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[#232528]/30 text-sm font-semibold min-h-[44px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = selectedKitModal.nameEn;
                  setSelectedKitModal(null);
                  onSelectBriefTopic(`Upgrade from ${title} to Human Studio Polish`);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
              >
                Request Human Expert Version Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ----------------------------------------------------------------------------
// 9. APPROVED MARKETPLACE: 4 DISCIPLINES / 13 SERVICES / 15 VARIANTS / 5 BUNDLES / 14 ADD-ONS
// ----------------------------------------------------------------------------
function ServiceCatalogAndEstimator({ lang, reducedMotion, initialDiscipline = 'ALL', onConfigureBrief }) {
  const [selectedDiscipline, setSelectedDiscipline] = useState(initialDiscipline);
  const [activeServiceId, setActiveServiceId] = useState('SRV-01');
  const [selectedVariantId, setSelectedVariantId] = useState('VAR-01');
  const [selectedAddonIds, setSelectedAddonIds] = useState(['ADD-02']);
  const [promoCheckDate, setPromoCheckDate] = useState('2026-11-21');
  const catalogRef = useRef(null);
  const lensRef = useRef(null);

  useEffect(() => {
    if (initialDiscipline) setSelectedDiscipline(initialDiscipline);
  }, [initialDiscipline]);

  const filteredServices = useMemo(() => {
    if (selectedDiscipline === 'ALL') return CORE_SERVICES;
    return CORE_SERVICES.filter((s) => s.disciplineId === selectedDiscipline);
  }, [selectedDiscipline]);

  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.some((s) => s.id === activeServiceId)) {
      setActiveServiceId(filteredServices[0].id);
    }
  }, [filteredServices, activeServiceId]);

  useEffect(() => {
    if (reducedMotion || !catalogRef.current) return;
    runKinetic(catalogRef.current.querySelectorAll('.service-card-item'), {
      opacity: [0, 1],
      y: [14, 0],
      delay: getStagger(40),
      duration: 420,
      ease: 'outCubic'
    });
  }, [selectedDiscipline, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !lensRef.current) return;
    runKinetic(lensRef.current, {
      opacity: [0.65, 1],
      scale: [0.985, 1],
      duration: 340,
      ease: 'outQuad'
    });
  }, [activeServiceId, reducedMotion]);

  const activeService = useMemo(
    () => CORE_SERVICES.find((s) => s.id === activeServiceId) || CORE_SERVICES[0],
    [activeServiceId]
  );

  const availableVariants = useMemo(
    () => SERVICE_VARIANTS.filter((v) => v.serviceId === activeService.id),
    [activeService]
  );

  useEffect(() => {
    if (availableVariants.length > 0 && !availableVariants.some((v) => v.id === selectedVariantId)) {
      setSelectedVariantId(availableVariants[0].id);
    }
  }, [availableVariants, selectedVariantId]);

  const activeVariant = useMemo(
    () => availableVariants.find((v) => v.id === selectedVariantId) || availableVariants[0],
    [availableVariants, selectedVariantId]
  );

  const compatibleAddons = useMemo(
    () => OPTIONAL_ADDONS.filter((a) => a.compatibleDisciplines.includes(activeService.disciplineId)),
    [activeService]
  );

  useEffect(() => {
    setSelectedAddonIds((prev) => prev.filter((id) => compatibleAddons.some((a) => a.id === id)));
  }, [compatibleAddons]);

  const toggleAddon = (id) => {
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const totalScopedHours = useMemo(() => {
    const base = activeService.estimatedHours * (activeVariant ? activeVariant.hoursMultiplier : 1);
    const addonHrs = selectedAddonIds.reduce((sum, id) => {
      const found = OPTIONAL_ADDONS.find((a) => a.id === id);
      return sum + (found ? found.hours : 0);
    }, 0);
    return Number((base + addonHrs).toFixed(1));
  }, [activeService, activeVariant, selectedAddonIds]);

  const isPromoActive = useMemo(() => {
    return promoCheckDate >= '2026-11-20' && promoCheckDate <= '2026-12-15';
  }, [promoCheckDate]);

  return (
    <section ref={catalogRef} className="space-y-8">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            APPROVED CATALOG STRUCTURE • 4 DISCIPLINES • 13 SERVICES • 15 VARIANTS • 5 BUNDLES • 14 ADD-ONS
          </span>
          <span className="text-xs font-mono text-[#D9BD81]">
            Ratebook v8/v8.1 Server Authority Pending
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          {lang === 'bn' ? 'অনুমোদিত ক্রিয়েটিভ সার্ভিস ও স্কোপ এস্টিমেটর' : 'Approved Creative Marketplace & Scope Estimator'}
        </h2>
        <p className="text-sm text-[#F6F4EF]/80 mt-2 max-w-3xl">
          Legacy 60-service marketing/software entries have been purged. Select any of the 13 core creative services below to inspect deliverables, revision rounds, compatible add-ons, and scoped billable hours.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDiscipline('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition ${
              selectedDiscipline === 'ALL'
                ? 'bg-[#D9BD81] text-[#090A0A]'
                : 'bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80'
            }`}
          >
            All 13 Core Services
          </button>
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition ${
                selectedDiscipline === d.id
                  ? 'bg-[#D9BD81] text-[#090A0A]'
                  : 'bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80'
              }`}
            >
              {d.code}. {lang === 'bn' ? d.nameBn : d.nameEn}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          {filteredServices.map((srv) => {
            const selected = srv.id === activeService.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setActiveServiceId(srv.id)}
                className={`service-card-item w-full text-left p-4 rounded-2xl border transition min-h-[64px] focus:outline-none focus:ring-2 focus:ring-[#D9BD81] ${
                  selected
                    ? 'bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81] shadow-md'
                    : 'bg-[#F6F4EF] text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-mono font-bold ${selected ? 'text-[#D9BD81]' : 'text-[#232528]'}`}>
                    {srv.id} • ~{srv.estimatedHours}h Base Scope
                  </span>
                  {srv.expressEligible && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-600/30">
                      10-Min Micro-Edit Eligible
                    </span>
                  )}
                </div>
                <div className="font-bold text-base mt-1">{lang === 'bn' ? srv.titleBn : srv.titleEn}</div>
                <div className={`text-xs mt-1 ${selected ? 'text-[#F6F4EF]/70' : 'text-[#232528]'}`}>
                  Formats: {srv.formats.join(', ')} • {srv.revisions} Consolidated Revisions
                </div>
              </button>
            );
          })}
        </div>

        <div
          ref={lensRef}
          className="lg:col-span-7 rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 sm:p-8 text-[#090A0A] space-y-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#232528]/15 pb-5">
            <div>
              <div className="text-xs font-mono font-bold text-[#232528]">
                SERVICE LENS • {activeService.id} ({activeService.disciplineId})
              </div>
              <h3 className="text-2xl font-bold mt-1">{activeService.titleEn}</h3>
              <div className="text-sm text-[#232528]">{activeService.titleBn}</div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-bold">
                {activeService.revisions} Consolidated Revisions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#232528]/15">
              <div className="text-xs font-bold uppercase text-emerald-800 mb-2">Included in Scope</div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#090A0A]">
                {activeService.included.map((inc) => (
                  <li key={inc} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#232528]/15">
              <div className="text-xs font-bold uppercase text-[#232528] mb-2">Explicit Exclusions</div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#232528]">
                {activeService.excluded.map((exc) => (
                  <li key={exc} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {availableVariants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#232528] mb-2">
                Scoped Service Variant ({availableVariants.length} available for {activeService.id})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition min-h-[44px] ${
                      selectedVariantId === v.id
                        ? 'bg-[#090A0A] text-[#D9BD81] border-[#090A0A]'
                        : 'bg-white text-[#090A0A] border-[#232528]/20'
                    }`}
                  >
                    <div>{v.label}</div>
                    <div className="font-mono opacity-80 mt-0.5">
                      {(activeService.estimatedHours * v.hoursMultiplier).toFixed(1)} Scoped Hours
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#232528]">
                Compatible Optional Add-Ons ({compatibleAddons.length} of 14 eligible)
              </span>
              <span className="text-[11px] text-[#232528]">Incompatible add-ons hidden to prevent double billing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {compatibleAddons.map((addon) => {
                const checked = selectedAddonIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                      checked ? 'bg-[#090A0A] text-[#F6F4EF] border-[#090A0A]' : 'bg-white text-[#090A0A] border-[#232528]/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                      className="mt-0.5 accent-[#D9BD81]"
                    />
                    <span className="flex-1">
                      <span className="font-mono font-bold">{addon.id}</span>: {addon.name} (+{addon.hours}h)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#090A0A] text-[#F6F4EF] p-5 space-y-3 border border-[#D9BD81]/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono text-[#D9BD81]">ESTIMATED SCOPED EFFORT</div>
                <div className="text-2xl font-extrabold">
                  <AnimatedNumber value={totalScopedHours} decimals={1} suffix=" Approved Billable Hours" reducedMotion={reducedMotion} />
                </div>
              </div>
              <div className="text-right">
                <label htmlFor="promo-date" className="block text-[11px] text-[#F6F4EF]/70">
                  Test Launch Window Date (Asia/Dhaka)
                </label>
                <input
                  id="promo-date"
                  type="date"
                  value={promoCheckDate}
                  onChange={(e) => setPromoCheckDate(e.target.value)}
                  className="mt-1 px-2.5 py-1 rounded bg-[#232528] text-xs font-mono text-[#D9BD81] border border-[#D9BD81]/30"
                />
              </div>
            </div>

            <div className="text-xs flex items-center justify-between pt-2 border-t border-white/10">
              <span>5% Launch Promo (20 Nov – 15 Dec 2026):</span>
              <span className={`font-bold ${isPromoActive ? 'text-emerald-400' : 'text-amber-300'}`}>
                {isPromoActive ? 'ELIGIBLE (5% Aggregate Discount Active)' : 'EXPIRED — Standard Ratebook Applies'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#232528] text-xs text-[#F6F4EF]/90 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#D9BD81] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#D9BD81]">Zero Invented Rates Policy:</strong> Exact BDT hourly line rates are imported exclusively from the owner-approved canonical <code className="text-[#D9BD81]">Ratebook v8/v8.1</code> on the server. Total ={' '}
                <code className="text-[#D9BD81]">(Approved Hours × Canonical Rate) {isPromoActive ? '− 5%' : ''}</code>.
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onConfigureBrief({
                  serviceId: activeService.id,
                  variantLabel: activeVariant?.label || 'Standard Scope',
                  addons: selectedAddonIds,
                  scopedHours: totalScopedHours
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm hover:brightness-105 transition min-h-[48px]"
            >
              <span>Lock Scope & Continue to 3-Step Smart Brief</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Approved Commercial Bundles */}
      <div className="space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-[#090A0A]">5 Approved Commercial Bundles (Component-Hour Sum)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMMERCIAL_BUNDLES.map((bnd) => (
            <div key={bnd.id} className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-5 flex flex-col justify-between hover:border-[#090A0A] transition">
              <div>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#232528]">
                  <span>{bnd.id}</span>
                  <span>{bnd.totalScopedHours} Combined Hours</span>
                </div>
                <h4 className="text-lg font-bold text-[#090A0A] mt-2">{bnd.titleEn}</h4>
                <p className="text-xs text-[#232528] mt-1">{bnd.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {bnd.componentServiceIds.map((cid) => (
                    <span key={cid} className="px-2 py-0.5 rounded bg-[#090A0A] text-[#D9BD81] text-[11px] font-mono">
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onConfigureBrief({
                    serviceId: bnd.componentServiceIds[0],
                    variantLabel: `${bnd.id}: ${bnd.titleEn}`,
                    addons: [],
                    scopedHours: bnd.totalScopedHours
                  })
                }
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
              >
                Request Bundle Quote ({bnd.totalScopedHours}h Scope)
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 10. PROGRESSIVE 3-STEP SMART BRIEF BUILDER
// ----------------------------------------------------------------------------
function SmartBriefBuilder({ prefill, onSubmitted }) {
  const { createProjectFromBrief } = useCreativeOffice();
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState(prefill?.topic || '');
  const [serviceId, setServiceId] = useState(prefill?.serviceId || 'SRV-04');
  const [variantLabel, setVariantLabel] = useState(prefill?.variantLabel || '3-Post Campaign Starter Pack');
  const [selectedAddons, setSelectedAddons] = useState(prefill?.addons || ['ADD-02']);
  const [notes, setNotes] = useState('');
  const [hasReadySourceFile, setHasReadySourceFile] = useState(false);
  const [wantsExpress10Min, setWantsExpress10Min] = useState(false);

  useEffect(() => {
    if (prefill?.topic) setProjectTitle(prefill.topic);
    if (prefill?.serviceId) setServiceId(prefill.serviceId);
    if (prefill?.variantLabel) setVariantLabel(prefill.variantLabel);
    if (prefill?.addons) setSelectedAddons(prefill.addons);
  }, [prefill]);

  const selectedService = useMemo(
    () => CORE_SERVICES.find((s) => s.id === serviceId) || CORE_SERVICES[0],
    [serviceId]
  );

  const expressPreflightPassed = selectedService.expressEligible && hasReadySourceFile;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = createProjectFromBrief({
      title: projectTitle.trim() || `${selectedService.titleEn} Request`,
      clientName: clientName.trim() || 'Guest Reviewer (DEMO CLIENT)',
      serviceId: selectedService.id,
      serviceName: selectedService.titleEn,
      variantLabel,
      scopedHours: selectedService.estimatedHours,
      addons: selectedAddons,
      expressRequested: wantsExpress10Min,
      expressEligible: expressPreflightPassed,
      notes
    });
    onSubmitted(newId);
  };

  return (
    <section className="max-w-3xl mx-auto rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 sm:p-8 text-[#090A0A] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-[#232528]/15">
        <div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#090A0A] text-[#D9BD81]">
            PROGRESSIVE SMART BRIEF • STEP {step} OF 3
          </span>
          <h2 className="text-2xl font-bold mt-2">Start Your Creative Project</h2>
        </div>
        <div className="flex gap-1.5" aria-label="Wizard Progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2.5 w-10 rounded-full transition-colors ${s <= step ? 'bg-[#090A0A]' : 'bg-[#232528]/20'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="brief-service" className="block text-xs font-bold uppercase text-[#232528] mb-1.5">
                1. Choose Approved Core Service (13 Services)
              </label>
              <select
                id="brief-service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#232528]/30 text-base font-semibold"
              >
                {CORE_SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.titleEn} (~{s.estimatedHours}h base)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="brief-title" className="block text-xs font-bold uppercase text-[#232528] mb-1.5">
                2. Project / Campaign Headline
              </label>
              <input
                id="brief-title"
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., Ramadan Gift Box Packaging & Social Launch"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#232528]/30 text-base"
              />
            </div>

            <div>
              <label htmlFor="brief-client" className="block text-xs font-bold uppercase text-[#232528] mb-1.5">
                3. Your Name / Brand (Demo Workspace Label)
              </label>
              <input
                id="brief-client"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Rahim Uddin — Kazi Roast"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#232528]/30 text-base"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm min-h-[48px]"
              >
                <span>Next: Express Preflight & References</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white border border-[#232528]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#090A0A]">
                  10-Minute Express Delivery Preflight Check
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    selectedService.expressEligible ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {selectedService.expressEligible ? 'Service Supports Micro-Express' : 'Standard Milestone Service'}
                </span>
              </div>
              <p className="text-xs text-[#232528]">
                Express delivery from 10 minutes applies ONLY to pre-checked single-file micro-edits (SRV-02, SRV-05, SRV-13) with ready source files and confirmed studio slot acceptance.
              </p>

              <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadySourceFile}
                  onChange={(e) => setHasReadySourceFile(e.target.checked)}
                  className="accent-[#090A0A] w-4 h-4"
                />
                <span>I have clean, ready-to-edit source files attached</span>
              </label>

              {selectedService.expressEligible && (
                <label className="flex items-center gap-2.5 text-sm font-bold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsExpress10Min}
                    onChange={(e) => setWantsExpress10Min(e.target.checked)}
                    className="accent-[#090A0A] w-4 h-4"
                  />
                  <span>Request 10-Minute Express Slot (Clock starts only upon Studio acceptance)</span>
                </label>
              )}
            </div>

            <div>
              <label htmlFor="brief-notes" className="block text-xs font-bold uppercase text-[#232528] mb-1.5">
                Creative Direction, Copy & Extracted Swatches
              </label>
              <textarea
                id="brief-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste target dimensions, Bangla/English copy, or color codes..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#232528]/30 text-base"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-[#232528]/30 text-sm font-bold min-h-[48px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm min-h-[48px]"
              >
                <span>Review Scope Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[#090A0A] text-[#F6F4EF] space-y-2.5">
              <div className="text-xs font-mono text-[#D9BD81]">SCOPE & GOVERNANCE RECEIPT (DEMO)</div>
              <div className="text-lg font-bold">{projectTitle || selectedService.titleEn}</div>
              <div className="text-xs text-[#F6F4EF]/80">
                Service: <strong>{selectedService.id} — {selectedService.titleEn}</strong> ({selectedService.estimatedHours}h base scope)
              </div>
              <div className="text-xs text-[#F6F4EF]/80">
                Revisions: <strong>2 Consolidated Revision Rounds</strong> • Ratebook Authority: <strong>Server Recalculated</strong>
              </div>
              <div className="text-xs text-[#D9BD81]">
                Express Status: {wantsExpress10Min && expressPreflightPassed ? 'Eligible for 10-Min Slot Triage' : 'Standard Milestone Delivery'}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-[#232528]/30 text-sm font-bold min-h-[48px]"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-extrabold text-sm hover:brightness-105 transition min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request to Live Studio Demo</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 11. CLIENT WORKSPACE DEMO (WITH ANIME.JS PROOF PIN SONAR & PRODUCTION RAIL)
// ----------------------------------------------------------------------------
function ClientWorkspaceDemo({ initialProjectId, reducedMotion, onSwitchToStudio }) {
  const {
    projects,
    clientAcceptQuote,
    clientAddAnnotation,
    clientRequestRevision,
    clientApproveFinalVersion
  } = useCreativeOffice();

  const [selectedId, setSelectedId] = useState(initialProjectId || projects[0]?.id);
  const [simulateMissing404, setSimulateMissing404] = useState(false);
  const [pinText, setPinText] = useState('');
  const [pendingCoords, setPendingCoords] = useState({ x: 52, y: 44 });
  const [revisionSummary, setRevisionSummary] = useState('');
  const railRef = useRef(null);
  const proofStageRef = useRef(null);

  useEffect(() => {
    if (initialProjectId) {
      setSelectedId(initialProjectId);
      setSimulateMissing404(false);
    }
  }, [initialProjectId]);

  const project = useMemo(() => projects.find((p) => p.id === selectedId), [projects, selectedId]);

  useEffect(() => {
    if (reducedMotion || !railRef.current) return;
    runKinetic(railRef.current.querySelectorAll('.rail-stage-node'), {
      opacity: [0.6, 1],
      y: [6, 0],
      delay: getStagger(35),
      duration: 360,
      ease: 'outQuad'
    });
  }, [project?.status, selectedId, reducedMotion]);

  const lifecycleStages = [
    { key: 'request_submitted', label: 'Brief Submitted' },
    { key: 'quote_issued', label: 'Quote Issued' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'assigned', label: 'Human Assigned' },
    { key: 'in_production', label: 'In Production' },
    { key: 'proof_ready', label: 'Proof Ready' },
    { key: 'approved', label: 'Client Approved' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const handleProofCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingCoords({ x, y });
    if (!reducedMotion && proofStageRef.current) {
      runKinetic(proofStageRef.current.querySelectorAll('.active-target-pin'), {
        scale: [0.4, 1.4, 1],
        duration: 450,
        ease: getSpringEase()
      });
      runKinetic(proofStageRef.current.querySelectorAll('.pin-sonar-ring'), {
        scale: [0.5, 2.4],
        opacity: [0.9, 0],
        duration: 650,
        ease: 'outCubic'
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-5 sm:p-6 text-[#F6F4EF] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D9BD81] text-[#090A0A]">
              DEMO DATA • CLIENT OFFICE
            </span>
            <span className="text-xs text-[#F6F4EF]/70">
              Synced live with Studio Pulse Admin
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">Client Production & Proofing Workspace</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Select Client Project"
            value={simulateMissing404 ? 'MISSING-ID' : selectedId}
            onChange={(e) => {
              if (e.target.value === 'MISSING-ID') {
                setSimulateMissing404(true);
              } else {
                setSimulateMissing404(false);
                setSelectedId(e.target.value);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#D9BD81]/40 text-sm font-semibold min-h-[44px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}: {p.title}
              </option>
            ))}
            <option value="MISSING-ID">Test Missing ID (/office/projects/invalid-404)</option>
          </select>

          <button
            type="button"
            onClick={onSwitchToStudio}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-sm font-bold min-h-[44px]"
          >
            <span>Open Studio Admin View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {simulateMissing404 || !project ? (
        <div className="rounded-2xl bg-[#F6F4EF] border-2 border-[#232528]/30 p-10 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-[#090A0A] text-[#D9BD81]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="text-xs font-mono font-bold uppercase text-[#232528]">HTTP 404 • TRUTHFUL MISSING RECORD GUARD</div>
          <h3 className="text-2xl font-bold text-[#090A0A]">Project Record Not Found</h3>
          <p className="text-sm text-[#232528] max-w-md mx-auto">
            Per Gate 0 audit rules, Freakin&apos;s Studio never fabricates synthetic projects or mock deliverables when a project ID does not exist or fails RLS ownership checks.
          </p>
          <button
            type="button"
            onClick={() => {
              setSimulateMissing404(false);
              setSelectedId(projects[0]?.id);
            }}
            className="px-5 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
          >
            Return to Valid Demo Project ({projects[0]?.id})
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div ref={railRef} className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 text-[#090A0A]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#232528]">{project.id} • {project.serviceId}</span>
                <h3 className="text-xl font-bold">{project.title}</h3>
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#090A0A] text-[#D9BD81]">
                Assigned: {project.assignedExpert}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {lifecycleStages.map((st, idx) => {
                const currentIdx = lifecycleStages.findIndex((x) => x.key === project.status);
                const isRevision = project.status === 'revision_requested' && st.key === 'proof_ready';
                const completed = idx <= currentIdx || (project.status === 'revision_requested' && idx <= 5);
                return (
                  <div
                    key={st.key}
                    className={`rail-stage-node p-3 rounded-xl border text-xs transition ${
                      isRevision
                        ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold'
                        : completed
                        ? 'bg-[#090A0A] text-[#D9BD81] border-[#090A0A] font-bold'
                        : 'bg-white text-[#232528]/60 border-[#232528]/15'
                    }`}
                  >
                    <div className="font-mono text-[10px]">0{idx + 1}</div>
                    <div className="mt-1">{isRevision ? 'Revision Active' : st.label}</div>
                  </div>
                );
              })}
            </div>

            {project.status === 'quote_issued' && (
              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-500 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-amber-950">
                  <strong>Formal Studio Quote Issued:</strong> {project.scopedHours} scoped hours ({project.variantLabel}) • 2 consolidated revisions included.
                </div>
                <button
                  type="button"
                  onClick={() => clientAcceptQuote(project.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
                >
                  Accept Scope & Quote
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div ref={proofStageRef} className="lg:col-span-7 rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 text-[#090A0A] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-bold">Proofing Stage ({project.proofVersion})</h4>
                  <p className="text-xs text-[#232528]">
                    Click anywhere on the proof frame to drop an annotation pin. Revisions used:{' '}
                    <strong>{project.revisionsUsed} / {project.revisionsIncluded}</strong>.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#090A0A] text-[#D9BD81]">
                  STATUS: {project.status.toUpperCase()}
                </span>
              </div>

              <div
                onClick={handleProofCanvasClick}
                role="button"
                tabIndex={0}
                aria-label="Interactive creative proof canvas. Click to position feedback pin."
                className="relative w-full h-72 rounded-2xl bg-[#090A0A] border-2 border-[#D9BD81]/50 overflow-hidden cursor-crosshair flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <StudioMonogram size={44} reducedMotion={reducedMotion} />
                <div className="text-xs font-mono text-[#D9BD81] mt-3">
                  DEMONSTRATION CREATIVE ARTIFACT • {project.proofVersion}
                </div>
                <div className="text-lg font-bold text-[#F6F4EF] mt-1 max-w-md">{project.title}</div>
                <p className="text-xs text-[#F6F4EF]/75 mt-2 max-w-md">{project.proofNotes}</p>

                {project.annotations.map((ann, idx) => (
                  <div
                    key={ann.id}
                    style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                    title={`${ann.author}: ${ann.text}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#D9BD81] text-[#090A0A] font-extrabold text-xs flex items-center justify-center border-2 border-[#090A0A] shadow-lg"
                  >
                    {idx + 1}
                  </div>
                ))}

                <div
                  style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
                  className="pin-sonar-ring absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#D9BD81] pointer-events-none opacity-0"
                />
                <div
                  style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
                  className="active-target-pin absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border border-white pointer-events-none"
                >
                  +
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={pinText}
                  onChange={(e) => setPinText(e.target.value)}
                  placeholder={`Add pin note at (${pendingCoords.x}%, ${pendingCoords.y}%)...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!pinText.trim()) return;
                    clientAddAnnotation(project.id, pendingCoords.x, pendingCoords.y, pinText.trim());
                    setPinText('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
                >
                  Save Pin Note
                </button>
              </div>

              {project.annotations.length > 0 && (
                <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#232528]/15">
                  <div className="text-xs font-bold uppercase text-[#232528]">Pinned Proof Comments:</div>
                  {project.annotations.map((ann, i) => (
                    <div key={ann.id} className="text-xs text-[#090A0A] flex items-start gap-2">
                      <span className="font-mono font-bold bg-[#D9BD81] px-1.5 rounded">#{i + 1}</span>
                      <span>
                        <strong>{ann.author}</strong> ({ann.x}%, {ann.y}%): {ann.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-[#232528]/15 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={revisionSummary}
                    onChange={(e) => setRevisionSummary(e.target.value)}
                    placeholder="Consolidated revision summary (uses 1 of 2 included rounds)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-sm"
                  />
                  <button
                    type="button"
                    disabled={project.revisionsUsed >= project.revisionsIncluded}
                    onClick={() => {
                      clientRequestRevision(
                        project.id,
                        revisionSummary.trim() || 'Consolidated visual adjustment requested on current proof.'
                      );
                      setRevisionSummary('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#090A0A] text-[#090A0A] text-sm font-bold hover:bg-black/5 disabled:opacity-40 min-h-[44px]"
                  >
                    Request Revision ({project.revisionsUsed}/{project.revisionsIncluded})
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => clientApproveFinalVersion(project.id)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D9BD81] text-[#090A0A] font-extrabold text-sm hover:brightness-105 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve {project.proofVersion} for Final Delivery</span>
                  </button>

                  {project.status === 'delivered' && (
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 text-white text-xs font-bold">
                      <Download className="w-4 h-4" />
                      <span>Final Deliverable Package Ready (Verified Handover)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-[#090A0A] border border-[#232528] p-6 text-[#F6F4EF] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-[#D9BD81]" />
                  <span>Verified Activity Log</span>
                </h4>
                <span className="text-[11px] font-mono text-[#D9BD81]">NO FAKE TIMERS</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {project.events
                  .slice()
                  .reverse()
                  .map((ev) => (
                    <div key={ev.id} className="p-3.5 rounded-xl bg-[#232528]/70 border border-[#F6F4EF]/10 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ev.actorKind === 'human'
                              ? 'bg-[#D9BD81] text-[#090A0A]'
                              : ev.actorKind === 'si'
                              ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                              : 'bg-white/10 text-[#F6F4EF]/80'
                          }`}
                        >
                          {ev.actorKind === 'human'
                            ? 'Human Expert'
                            : ev.actorKind === 'si'
                            ? 'SI Assistant'
                            : 'System Automation'}
                        </span>
                        <span className="text-[11px] font-mono text-[#F6F4EF]/60">{ev.timestamp}</span>
                      </div>
                      <div className="text-xs font-bold text-[#F6F4EF]">{ev.actorName}</div>
                      <p className="text-xs text-[#F6F4EF]/85 leading-relaxed">{ev.summary}</p>
                      <div className="text-[10px] font-mono text-[#D9BD81]">
                        {ev.stateBefore} → {ev.stateAfter}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ----------------------------------------------------------------------------
// 12. STUDIO ADMINISTRATION — STUDIO PULSE COMMAND CENTER (/studio)
// ----------------------------------------------------------------------------
function StudioAdminDemo({ onSwitchToClient }) {
  const {
    projects,
    adminIssueQuote,
    adminAssignExpert,
    adminAdvanceStage,
    adminGenerateSiProposal,
    adminDecideSiProposal,
    aiEnabled,
    setAiEnabled,
    dailyBudgetBdt,
    setDailyBudgetBdt,
    adminLogs,
    resetDemoState
  } = useCreativeOffice();

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id);
  const [expertChoice, setExpertChoice] = useState('Arafat Rahman — Lead Brand Designer');
  const [proofMessage, setProofMessage] = useState('Updated proof uploaded per client pin annotations.');

  useEffect(() => {
    if (!projects.some((p) => p.id === selectedProjectId) && projects[0]) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 p-6 text-[#F6F4EF] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D9BD81] text-[#090A0A]">
              DEMO DATA • STUDIO PULSE ADMIN
            </span>
            <span className="text-xs text-[#F6F4EF]/75">
              Manual Human Control over Intake, Quotes, Experts, SI Proposals & AI Kill Switch
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1">Studio Operations Command Center</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#F6F4EF]/15 text-xs font-bold min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchToClient(activeProject?.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-xs sm:text-sm font-bold min-h-[44px]"
          >
            <span>Inspect in Client Office</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#232528] px-1">
            Studio Request & Production Queue ({projects.length})
          </div>
          {projects.map((p) => {
            const active = p.id === activeProject?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left p-4 rounded-2xl border transition min-h-[68px] ${
                  active
                    ? 'bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81] shadow-md'
                    : 'bg-[#F6F4EF] text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={active ? 'text-[#D9BD81]' : 'text-[#232528]'}>{p.id}</span>
                  <span className="uppercase font-bold">{p.status}</span>
                </div>
                <div className="font-bold text-sm mt-1">{p.title}</div>
                <div className={`text-xs mt-1 ${active ? 'text-[#F6F4EF]/70' : 'text-[#232528]'}`}>
                  {p.clientName} • {p.scopedHours}h
                </div>
                {p.expressRequested && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-600/30">
                    10-Min Express Requested ({p.expressEligible ? 'Preflight OK' : 'Review Required'})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeProject && (
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/25 p-6 text-[#090A0A] space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#232528]/15 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#232528]">
                    MANUAL PRODUCTION CONTROLS • {activeProject.id}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{activeProject.title}</h3>
                  <p className="text-xs text-[#232528]">
                    Client: {activeProject.clientName} | Service: {activeProject.serviceId} ({activeProject.scopedHours}h)
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-mono font-bold">
                  STAGE: {activeProject.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
                  <div className="text-xs font-bold uppercase text-[#232528]">1. Quote & Scope Authority</div>
                  <p className="text-xs text-[#232528]">
                    Issue formal quote ({activeProject.scopedHours}h per Ratebook v8/v8.1) to client workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => adminIssueQuote(activeProject.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                  >
                    Issue Formal Quote to Client
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
                  <div className="text-xs font-bold uppercase text-[#232528]">2. Assign Human Expert</div>
                  <select
                    aria-label="Select Human Expert"
                    value={expertChoice}
                    onChange={(e) => setExpertChoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#232528]/25 text-xs font-semibold"
                  >
                    <option>Arafat Rahman — Lead Brand Designer</option>
                    <option>Nusrat Jahan — Senior Visual Designer</option>
                    <option>Tanvir Ahmed — Motion & Edit Specialist</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => adminAssignExpert(activeProject.id, expertChoice)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                  >
                    Assign Expert & Start Production
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#232528]/15 space-y-3">
                <div className="text-xs font-bold uppercase text-[#232528]">
                  3. Manual Proof Dispatch & Final Delivery Gate
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={proofMessage}
                    onChange={(e) => setProofMessage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#232528]/25 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => adminAdvanceStage(activeProject.id, 'proof_ready', proofMessage)}
                    className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                  >
                    Publish New Proof Version
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      adminAdvanceStage(
                        activeProject.id,
                        'delivered',
                        'Human QA passed. Final deliverable package unlocked in Client Office.'
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold min-h-[44px]"
                  >
                    Mark Final Delivered
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090A0A] text-[#F6F4EF] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-[#D9BD81]">SI ASSISTANT HUMAN APPROVAL GATE</div>
                    <p className="text-xs text-[#F6F4EF]/75">
                      SI Assistant drafts cannot reach clients or alter billing without explicit human sign-off.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminGenerateSiProposal(activeProject.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40 text-xs font-bold min-h-[40px]"
                  >
                    + Run Scoped SI Assist Draft
                  </button>
                </div>

                <div className="space-y-2">
                  {activeProject.siProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-3 rounded-xl bg-[#232528] border border-white/10 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#D9BD81]">{prop.task}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40">
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#F6F4EF]/85">{prop.summary}</p>
                      </div>

                      {prop.status === 'suggested' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => adminDecideSiProposal(activeProject.id, prop.id, 'approved')}
                            className="px-3 py-2 rounded-lg bg-[#D9BD81] text-[#090A0A] text-xs font-bold min-h-[40px]"
                          >
                            Approve & Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => adminDecideSiProposal(activeProject.id, prop.id, 'rejected')}
                            className="px-3 py-2 rounded-lg bg-rose-900/60 text-rose-200 text-xs font-bold min-h-[40px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 text-[#F6F4EF] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-[#D9BD81]">PUTER SERVER GATEWAY & COST GUARDRAILS (SIMULATED)</div>
                  <h4 className="text-lg font-bold mt-0.5">Owner Budget Cap & Emergency AI Kill Switch</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold min-h-[44px] transition ${
                    aiEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {aiEnabled ? 'AI Gateway: ACTIVE (Click to Pause)' : 'AI Gateway: PAUSED (Kill Switch On)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#232528]">
                  <div className="text-[#F6F4EF]/70">Daily Studio AI Cap (BDT)</div>
                  <input
                    type="number"
                    value={dailyBudgetBdt}
                    onChange={(e) => setDailyBudgetBdt(Number(e.target.value))}
                    className="mt-1 w-full px-2.5 py-1.5 rounded bg-[#090A0A] text-[#D9BD81] font-mono font-bold border border-[#D9BD81]/30"
                  />
                </div>
                <div className="p-3.5 rounded-xl bg-[#232528]">
                  <div className="text-[#F6F4EF]/70">Visitor Puter Login</div>
                  <div className="mt-1.5 font-bold text-emerald-400">NEVER REQUIRED (me.puter Server Only)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#232528]">
                  <div className="text-[#F6F4EF]/70">Browser-Native Tools</div>
                  <div className="mt-1.5 font-bold text-[#D9BD81]">ALWAYS ONLINE (Zero API Dependency)</div>
                </div>
              </div>

              {adminLogs.length > 0 && (
                <div className="text-xs font-mono text-[#F6F4EF]/70 bg-[#232528]/50 p-3 rounded-xl">
                  Latest Gateway Audit: {adminLogs[0]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 13. MAIN APPLICATION ROOT (CONCEPT A CREATIVE ORBIT + CONCEPT C TIMELINE)
// ----------------------------------------------------------------------------
export default function App() {
  const [lang, setLang] = useState('en');
  const [activeRoute, setActiveRoute] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
    }
  }, []);

  const [intentInput, setIntentInput] = useState('');
  const [activeOrbitFocus, setActiveOrbitFocus] = useState('all');
  const [selectedServiceDiscipline, setSelectedServiceDiscipline] = useState('ALL');
  const [briefPrefill, setBriefPrefill] = useState(null);
  const [activeClientProjectId, setActiveClientProjectId] = useState('PRJ-2026-104');
  const [activeEditorialStage, setActiveEditorialStage] = useState(0);
  const [selectedConceptModal, setSelectedConceptModal] = useState(null);

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [guestQuotaRemaining, setGuestQuotaRemaining] = useState(3);
  const [dailyBudgetBdt, setDailyBudgetBdt] = useState(1500);
  const [adminLogs, setAdminLogs] = useState([
    'System initialized with approved 4/13/15/5/14 catalog and zero-fabrication guardrails.'
  ]);

  const heroRootRef = useRef(null);
  const timelineRailRef = useRef(null);
  const t = TRANSLATIONS[lang];

  // Orchestrate Hero Entrance Timeline with Anime.js
  useEffect(() => {
    if (activeRoute !== 'home' || reducedMotion || !heroRootRef.current) return;
    const items = heroRootRef.current.querySelectorAll('.hero-stagger-item');
    if (animeV4Timeline) {
      try {
        const tl = animeV4Timeline({ defaults: { ease: 'outExpo', duration: 650 } });
        tl.add(items, {
          opacity: [0, 1],
          y: [18, 0],
          delay: getStagger(75)
        });
        return;
      } catch {
        // Fallback below
      }
    }
    runKinetic(items, {
      opacity: [0, 1],
      y: [18, 0],
      delay: getStagger(75),
      duration: 650,
      ease: 'outExpo'
    });
  }, [activeRoute, reducedMotion]);

  // Animate Concept C Editorial Production Rail SVG connector on home view
  useEffect(() => {
    if (activeRoute !== 'home' || reducedMotion || !timelineRailRef.current) return;
    const lines = timelineRailRef.current.querySelectorAll('.editorial-rail-connector');
    drawSvgPaths(lines, 1200, 0);
  }, [activeRoute, reducedMotion]);

  const parsedIntent = useMemo(() => {
    const raw = intentInput.trim().toLowerCase();
    if (!raw) return null;
    const isExpress =
      raw.includes('10 min') ||
      raw.includes('quick') ||
      raw.includes('resize') ||
      raw.includes('cleanup') ||
      raw.includes('দ্রুত');
    const isBrand =
      raw.includes('logo') || raw.includes('brand') || raw.includes('packaging') || raw.includes('লোগো');
    const isVideo =
      raw.includes('reel') || raw.includes('video') || raw.includes('motion') || raw.includes('ভিডিও');
    return {
      detectedDiscipline: isVideo
        ? 'Motion, Reels & Short-Form Video'
        : isBrand
        ? 'Brand & Visual Identity'
        : 'Social Media & Campaign Creative',
      expressCandidate: isExpress,
      freeToolRec: isExpress ? 'Image Resizer & Platform Exporter' : 'Color Palette & Contrast Checker',
      aiKitRec: isBrand ? 'Brand Mini AI Kit (৳199 Proposed)' : 'Campaign Ready AI Kit (৳99 Proposed)',
      humanServiceRec: isExpress
        ? 'SRV-02 / SRV-05 Single-File Micro-Edit'
        : isBrand
        ? 'SRV-01 Primary Brand Mark & Logo System'
        : 'SRV-04 Social Campaign Static Post Set'
    };
  }, [intentInput]);

  const officeContextValue = useMemo(
    () => ({
      projects,
      aiEnabled,
      setAiEnabled,
      guestQuotaRemaining,
      consumeGuestQuota: () => setGuestQuotaRemaining((q) => Math.max(0, q - 1)),
      dailyBudgetBdt,
      setDailyBudgetBdt,
      adminLogs,
      addAdminLog: (msg) => setAdminLogs((prev) => [`[${getDhakaTimestamp()}] ${msg}`, ...prev.slice(0, 9)]),
      resetDemoState: () => {
        setProjects(INITIAL_PROJECTS);
        setGuestQuotaRemaining(3);
        setAiEnabled(true);
      },
      createProjectFromBrief: (payload) => {
        const newId = `PRJ-2026-${106 + projects.length}`;
        const newProj = {
          id: newId,
          title: payload.title,
          clientName: payload.clientName,
          serviceId: payload.serviceId,
          serviceName: payload.serviceName,
          variantLabel: payload.variantLabel,
          scopedHours: payload.scopedHours,
          addons: payload.addons,
          expressRequested: payload.expressRequested,
          expressEligible: payload.expressEligible,
          status: 'request_submitted',
          assignedExpert: 'Unassigned — Awaiting Studio Triage',
          revisionsIncluded: 2,
          revisionsUsed: 0,
          proofVersion: 'Pending',
          proofNotes: payload.notes || 'Submitted via Progressive Smart Brief Builder.',
          annotations: [],
          siProposals: [
            {
              id: `SI-${Math.floor(100 + Math.random() * 899)}`,
              task: 'Initial Scope & Asset Checklist Draft',
              summary: `Structured production checklist prepared for ${payload.serviceId} (${payload.scopedHours}h base).`,
              status: 'suggested',
              createdAt: getDhakaTimestamp()
            }
          ],
          events: [
            {
              id: `EVT-${Date.now()}`,
              actorKind: 'system',
              actorName: 'System Automation',
              timestamp: getDhakaTimestamp(),
              stateBefore: 'request_draft',
              stateAfter: 'request_submitted',
              summary: `Client submitted Smart Brief (${payload.variantLabel}).`
            }
          ]
        };
        setProjects((prev) => [newProj, ...prev]);
        return newId;
      },
      adminIssueQuote: (projectId) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: 'quote_issued',
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: 'human',
                      actorName: 'Arafat Rahman (Studio Lead)',
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: 'quote_issued',
                      summary: `Issued formal quote for ${p.scopedHours} billable hours per canonical Ratebook authority.`
                    }
                  ]
                }
          )
        );
      },
      adminAssignExpert: (projectId, expertName) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: 'in_production',
                  assignedExpert: expertName,
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: 'human',
                      actorName: 'Arafat Rahman (Studio Lead)',
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: 'in_production',
                      summary: `Assigned project to ${expertName} and started active production.`
                    }
                  ]
                }
          )
        );
      },
      adminAdvanceStage: (projectId, nextStatus, summaryText) => {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const nextVer =
              nextStatus === 'proof_ready'
                ? p.proofVersion === 'Pending'
                  ? 'v1.0'
                  : `v${(parseFloat(p.proofVersion.replace('v', '')) + 1).toFixed(1)}`
                : p.proofVersion;
            return {
              ...p,
              status: nextStatus,
              proofVersion: nextVer,
              proofNotes: summaryText,
              events: [
                ...p.events,
                {
                  id: `EVT-${Date.now()}`,
                  actorKind: 'human',
                  actorName: p.assignedExpert.includes('Unassigned') ? 'Arafat Rahman (Studio Lead)' : p.assignedExpert,
                  timestamp: getDhakaTimestamp(),
                  stateBefore: p.status,
                  stateAfter: nextStatus,
                  summary: summaryText
                }
              ]
            };
          })
        );
      },
      adminGenerateSiProposal: (projectId) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  siProposals: [
                    {
                      id: `SI-${Math.floor(100 + Math.random() * 899)}`,
                      task: 'Pre-Delivery Quality & Bilingual Copy Check',
                      summary: 'Checked typography contrast, safe-area margins, and 2-round revision compliance.',
                      status: 'suggested',
                      createdAt: getDhakaTimestamp()
                    },
                    ...p.siProposals
                  ]
                }
          )
        );
      },
      adminDecideSiProposal: (projectId, proposalId, decision) => {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const target = p.siProposals.find((x) => x.id === proposalId);
            return {
              ...p,
              siProposals: p.siProposals.map((x) => (x.id === proposalId ? { ...x, status: decision } : x)),
              events:
                decision === 'approved' && target
                  ? [
                      ...p.events,
                      {
                        id: `EVT-${Date.now()}`,
                        actorKind: 'si',
                        actorName: 'SI Assistant (Human Approved)',
                        timestamp: getDhakaTimestamp(),
                        stateBefore: p.status,
                        stateAfter: p.status,
                        summary: `Approved SI output: ${target.task} — ${target.summary}`
                      }
                    ]
                  : p.events
            };
          })
        );
      },
      clientAcceptQuote: (projectId) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: 'accepted',
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: 'human',
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: 'accepted',
                      summary: 'Client accepted formal quote and authorized production scope.'
                    }
                  ]
                }
          )
        );
      },
      clientAddAnnotation: (projectId, x, y, text) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  annotations: [...p.annotations, { id: `ANN-${Date.now()}`, x, y, author: p.clientName, text }]
                }
          )
        );
      },
      clientRequestRevision: (projectId, summary) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: 'revision_requested',
                  revisionsUsed: Math.min(p.revisionsIncluded, p.revisionsUsed + 1),
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: 'human',
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: 'revision_requested',
                      summary: `Client requested consolidated revision (${p.revisionsUsed + 1}/${p.revisionsIncluded}): ${summary}`
                    }
                  ]
                }
          )
        );
      },
      clientApproveFinalVersion: (projectId) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: 'approved',
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: 'human',
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: 'approved',
                      summary: `Client formally approved ${p.proofVersion} for final handover.`
                    }
                  ]
                }
          )
        );
      }
    }),
    [projects, aiEnabled, guestQuotaRemaining, dailyBudgetBdt, adminLogs]
  );

  const navItems = [
    { id: 'home', label: t.navExplore },
    { id: 'tools', label: t.navTools },
    { id: 'services', label: t.navServices },
    { id: 'kits', label: t.navKits },
    { id: 'works', label: t.navWorks },
    { id: 'start', label: t.navBrief },
    { id: 'office', label: t.navClient },
    { id: 'studio', label: t.navStudio }
  ];

  const editorialStages = [
    {
      num: '01',
      title: 'Free Local Utility Prep',
      desc: 'Resize, compress, extract brand swatches, and check WCAG contrast locally before spending anything.',
      actionLabel: 'Open 6 Free Tools',
      route: 'tools'
    },
    {
      num: '02',
      title: 'Scoped Brief & Ratebook Quote',
      desc: 'Submit a 3-step brief; our human team verifies scope, express eligibility, and canonical Ratebook hours.',
      actionLabel: 'Start Smart Brief',
      route: 'start'
    },
    {
      num: '03',
      title: 'Human Craft + Gated SI Assist',
      desc: 'Named designers execute your work. SI Assistant drafts remain hidden until human approval.',
      actionLabel: 'Inspect Studio Pulse',
      route: 'studio'
    },
    {
      num: '04',
      title: 'Pinned Proof & Verified Handover',
      desc: 'Drop pin annotations on proofs, use up to 2 consolidated revisions, and approve final delivery.',
      actionLabel: 'Inspect Client Office',
      route: 'office'
    }
  ];

  return (
    <CreativeOfficeContext.Provider value={officeContextValue}>
      <div className="min-h-screen bg-[#F6F4EF] text-[#090A0A] flex flex-col selection:bg-[#D9BD81] selection:text-[#090A0A]">
        {/* Persistent Top Command Navigation */}
        <header className="sticky top-0 z-40 bg-[#090A0A]/95 backdrop-blur border-b border-[#232528] text-[#F6F4EF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveRoute('home')}
              className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#D9BD81] rounded-lg p-1"
            >
              <StudioMonogram size={36} interactive reducedMotion={reducedMotion} />
              <div>
                <div className="font-extrabold tracking-wider text-sm sm:text-base text-[#F6F4EF]">
                  {t.brandName}
                </div>
                <div className="text-[10px] tracking-[0.18em] text-[#D9BD81] hidden sm:block">
                  {t.tagline}
                </div>
              </div>
            </button>

            <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const active = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveRoute(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                      active
                        ? 'bg-[#D9BD81] text-[#090A0A]'
                        : 'text-[#F6F4EF]/85 hover:text-[#F6F4EF] hover:bg-[#232528]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                title="Toggle Reduced Motion / Flat Grid Mode"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#F6F4EF]/15 text-xs font-semibold min-h-[40px]"
              >
                {reducedMotion ? (
                  <List className="w-3.5 h-3.5 text-[#D9BD81]" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 text-[#D9BD81]" />
                )}
                <span>{reducedMotion ? 'Flat Grid' : 'Anime Orbit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                aria-label="Switch Language between English and Bangla"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40 text-xs font-extrabold min-h-[40px]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
                className="xl:hidden p-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav aria-label="Mobile Navigation" className="xl:hidden bg-[#090A0A] border-t border-[#232528] px-4 py-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveRoute(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-3 rounded-xl text-left text-xs font-bold min-h-[44px] ${
                    activeRoute === item.id ? 'bg-[#D9BD81] text-[#090A0A]' : 'bg-[#232528] text-[#F6F4EF]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className="col-span-2 px-3.5 py-3 rounded-xl text-left text-xs font-bold bg-[#232528]/60 text-[#D9BD81] border border-[#D9BD81]/30 min-h-[44px]"
              >
                {reducedMotion ? t.reducedMotionOn : t.reducedMotionOff}
              </button>
            </nav>
          )}
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
          {activeRoute === 'home' && (
            <div ref={heroRootRef} className="space-y-12">
              {/* Concept A: Kinetic Orbital Discovery Hero */}
              <section className="rounded-3xl bg-[#090A0A] border border-[#232528] p-6 sm:p-10 lg:p-12 text-[#F6F4EF] relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Left 7 Cols: 5-Second Value Promise + Live Intent Canvas */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="hero-stagger-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#232528] border border-[#D9BD81]/35 text-[#D9BD81] text-xs font-bold tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t.heroBadge}</span>
                    </div>

                    <h1 className="hero-stagger-item text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#F6F4EF]">
                      {t.heroTitle}
                    </h1>

                    <p className="hero-stagger-item text-base sm:text-lg text-[#F6F4EF]/85 max-w-2xl leading-relaxed">
                      {t.heroSubtitle}
                    </p>

                    <div className="hero-stagger-item flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveRoute('tools')}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-extrabold text-sm hover:brightness-105 transition min-h-[48px]"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>{t.ctaPrimary}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRoute('start')}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#D9BD81]/40 font-bold text-sm hover:bg-[#232528]/80 transition min-h-[48px]"
                      >
                        <span>{t.ctaSecondary}</span>
                        <ArrowRight className="w-4 h-4 text-[#D9BD81]" />
                      </button>
                    </div>

                    {/* Central Intent Canvas */}
                    <div className="hero-stagger-item p-4 sm:p-5 rounded-2xl bg-[#232528]/85 border border-[#D9BD81]/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#D9BD81]">INTENT CANVAS • EN / বাংলা</span>
                        <span className="text-[#F6F4EF]/70">Fires signal beam to matching orbit</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={intentInput}
                          onChange={(e) => setIntentInput(e.target.value)}
                          placeholder={t.intentPlaceholder}
                          aria-label="Describe your creative goal"
                          className="flex-1 px-4 py-3 rounded-xl bg-[#090A0A] border border-[#F6F4EF]/20 text-sm sm:text-base text-[#F6F4EF] placeholder:text-[#F6F4EF]/45 focus:outline-none focus:border-[#D9BD81]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!intentInput.trim()) {
                              setIntentInput('Need 3 social ads for my Dhaka bakery');
                            }
                            setActiveOrbitFocus('human');
                          }}
                          className="px-5 py-3 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm min-h-[48px] shrink-0"
                        >
                          {t.intentButton}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { text: 'Need 3 social ads for my Dhaka bakery', focus: 'human' },
                          { text: 'Quick logo cleanup in 10 min', focus: 'free' },
                          { text: 'আমার দোকানের জন্য পোস্ট লাগবে', focus: 'ai' }
                        ].map((sample) => (
                          <button
                            key={sample.text}
                            type="button"
                            onClick={() => {
                              setIntentInput(sample.text);
                              setActiveOrbitFocus(sample.focus);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#090A0A]/80 text-[#F6F4EF]/80 hover:text-[#D9BD81] border border-white/10"
                          >
                            {sample.text}
                          </button>
                        ))}
                      </div>

                      {parsedIntent && (
                        <div className="p-3.5 rounded-xl bg-[#090A0A] border border-[#D9BD81]/50 text-xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-[#D9BD81]">
                              Detected Discipline: {parsedIntent.detectedDiscipline}
                            </span>
                            {parsedIntent.expressCandidate && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                Potential 10-Min Micro-Edit Slot
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveRoute('tools')}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">PATH 1 • FREE</div>
                              <div className="font-bold mt-0.5">{parsedIntent.freeToolRec}</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveRoute('kits')}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">PATH 2 • AI KIT</div>
                              <div className="font-bold mt-0.5">{parsedIntent.aiKitRec}</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBriefPrefill({ topic: intentInput });
                                setActiveRoute('start');
                              }}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">PATH 3 • HUMAN STUDIO</div>
                              <div className="font-bold mt-0.5">{parsedIntent.humanServiceRec}</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="hero-stagger-item text-xs text-[#F6F4EF]/70 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D9BD81] shrink-0" />
                      <span>{t.expressDisclaimer}</span>
                    </p>
                  </div>

                  {/* Right 5 Cols: Live Anime.js Interactive Orbital Stage */}
                  <div className="lg:col-span-5">
                    <InteractiveCreativeOrbitStage
                      reducedMotion={reducedMotion}
                      activeOrbitFocus={activeOrbitFocus}
                      setActiveOrbitFocus={setActiveOrbitFocus}
                      parsedIntent={parsedIntent}
                      onNavigateRoute={(r) => setActiveRoute(r)}
                      onSelectDisciplineForServices={(discId) => {
                        setSelectedServiceDiscipline(discId);
                        setActiveRoute('services');
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Interactive Studio Craft & B+C+D Engine Showcase */}
              <StudioCraftInteractiveShowcase
                reducedMotion={reducedMotion}
                onNavigateRoute={(r) => setActiveRoute(r)}
              />

              {/* Concept C Editorial Production Timeline Section */}
              <section ref={timelineRailRef} className="rounded-3xl bg-white border border-[#232528]/15 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232528]/15 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#232528]">CONCEPT C EDITORIAL TRANSPARENCY</span>
                    <h2 className="text-2xl font-bold text-[#090A0A] mt-1">{t.timelineHeading}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRoute('office')}
                      className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                    >
                      Client Workspace Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRoute('studio')}
                      className="px-4 py-2.5 rounded-xl border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[44px]"
                    >
                      Studio Pulse Admin Demo
                    </button>
                  </div>
                </div>

                {/* Anime.js SVG Connector Line */}
                <svg viewBox="0 0 1000 12" className="hidden lg:block w-full h-3 overflow-visible" aria-hidden="true">
                  <line
                    className="editorial-rail-connector"
                    x1="20"
                    y1="6"
                    x2="980"
                    y2="6"
                    stroke="#D9BD81"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {editorialStages.map((step, idx) => {
                    const isFocused = activeEditorialStage === idx;
                    return (
                      <div
                        key={step.num}
                        onClick={() => setActiveEditorialStage(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveEditorialStage(idx);
                          }
                        }}
                        className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                          isFocused
                            ? 'bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81] shadow-lg'
                            : 'bg-[#F6F4EF] text-[#090A0A] border-[#232528]/15 hover:border-[#090A0A]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-mono font-extrabold text-[#090A0A] bg-[#D9BD81] inline-block px-2.5 py-0.5 rounded">
                            STAGE {step.num}
                          </div>
                          <h3 className="text-base font-bold">{step.title}</h3>
                          <p className={`text-xs leading-relaxed ${isFocused ? 'text-[#F6F4EF]/80' : 'text-[#232528]'}`}>
                            {step.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRoute(step.route);
                          }}
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold pt-2 ${
                            isFocused ? 'text-[#D9BD81]' : 'text-[#090A0A]'
                          } hover:underline`}
                        >
                          <span>{step.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Inline Live Free Playground Preview */}
              <FreeCreativePlayground
                lang={lang}
                reducedMotion={reducedMotion}
                onBridgeToBrief={(topic) => {
                  setBriefPrefill({ topic });
                  setActiveRoute('start');
                }}
                onBridgeToAi={() => setActiveRoute('kits')}
              />
            </div>
          )}

          {activeRoute === 'tools' && (
            <FreeCreativePlayground
              lang={lang}
              reducedMotion={reducedMotion}
              onBridgeToBrief={(topic) => {
                setBriefPrefill({ topic });
                setActiveRoute('start');
              }}
              onBridgeToAi={() => setActiveRoute('kits')}
            />
          )}

          {activeRoute === 'services' && (
            <ServiceCatalogAndEstimator
              lang={lang}
              reducedMotion={reducedMotion}
              initialDiscipline={selectedServiceDiscipline}
              onConfigureBrief={(cfg) => {
                setBriefPrefill(cfg);
                setActiveRoute('start');
              }}
            />
          )}

          {activeRoute === 'kits' && (
            <StudioAiAndKitsView
              reducedMotion={reducedMotion}
              onSelectBriefTopic={(topic) => {
                setBriefPrefill({ topic });
                setActiveRoute('start');
              }}
            />
          )}

          {activeRoute === 'works' && (
            <section className="space-y-6">
              <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
                  HONEST PORTFOLIO GOVERNANCE • ZERO FABRICATED METRICS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3">Curated Creative Concept Showcase</h2>
                <p className="text-sm text-[#F6F4EF]/80 mt-1 max-w-3xl">
                  Every specimen below is explicitly labeled <strong className="text-[#D9BD81]">Concept Work — Not Client Work</strong>. Unverified ROAS figures, fake view counts, and synthetic testimonials have been permanently excluded.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CONCEPT_WORKS.map((work) => (
                  <article
                    key={work.id}
                    className="rounded-2xl bg-white border border-[#232528]/20 overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#090A0A] transition"
                  >
                    <div className="bg-[#090A0A] p-6 text-[#F6F4EF] space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-[#D9BD81]">{work.discipline}</span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {work.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{work.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {work.palette.map((hex) => (
                          <div key={hex} className="flex items-center gap-1.5 bg-[#232528] px-2 py-1 rounded text-[11px] font-mono">
                            <span style={{ backgroundColor: hex }} className="w-3 h-3 rounded-full border border-white/20" />
                            <span>{hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-sm text-[#232528]">{work.summary}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {work.deliverables.map((del) => (
                          <span key={del} className="px-2.5 py-1 rounded-lg bg-[#F6F4EF] text-xs font-semibold text-[#090A0A]">
                            {del}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedConceptModal(work)}
                          className="text-xs font-bold text-[#232528] hover:text-[#090A0A] underline"
                        >
                          Inspect Concept Artboard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBriefPrefill({ topic: `Inspired by ${work.title}` });
                            setActiveRoute('start');
                          }}
                          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#090A0A] hover:underline"
                        >
                          <span>Commission Similar Scope</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {selectedConceptModal && (
                <div
                  role="dialog"
                  aria-modal="true"
                  className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                >
                  <div className="max-w-lg w-full rounded-2xl bg-[#090A0A] border-2 border-[#D9BD81] p-6 text-[#F6F4EF] space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300">
                          {selectedConceptModal.label}
                        </span>
                        <h3 className="text-xl font-bold mt-2">{selectedConceptModal.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedConceptModal(null)}
                        className="p-2 rounded-lg hover:bg-white/10"
                        aria-label="Close specimen"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[#F6F4EF]/85">{selectedConceptModal.summary}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedConceptModal.palette.map((hex) => (
                        <div key={hex} className="rounded-xl overflow-hidden border border-white/15">
                          <div style={{ backgroundColor: hex }} className="h-14 w-full" />
                          <div className="p-1.5 text-center font-mono text-[10px] bg-[#232528]">{hex}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedConceptModal(null)}
                        className="px-4 py-2 rounded-xl bg-[#232528] text-xs font-bold min-h-[40px]"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = selectedConceptModal.title;
                          setSelectedConceptModal(null);
                          setBriefPrefill({ topic: `Inspired by ${title}` });
                          setActiveRoute('start');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold min-h-[40px]"
                      >
                        Start Brief with This Direction
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeRoute === 'start' && (
            <SmartBriefBuilder
              prefill={briefPrefill}
              onSubmitted={(newProjectId) => {
                setActiveClientProjectId(newProjectId);
                setActiveRoute('office');
              }}
            />
          )}

          {activeRoute === 'office' && (
            <ClientWorkspaceDemo
              initialProjectId={activeClientProjectId}
              reducedMotion={reducedMotion}
              onSwitchToStudio={() => setActiveRoute('studio')}
            />
          )}

          {activeRoute === 'studio' && (
            <StudioAdminDemo
              onSwitchToClient={(projId) => {
                if (projId) setActiveClientProjectId(projId);
                setActiveRoute('office');
              }}
            />
          )}
        </main>

        {/* Authoritative Studio Footer */}
        <footer className="bg-[#090A0A] text-[#F6F4EF] border-t border-[#232528] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <StudioMonogram size={34} reducedMotion={reducedMotion} />
                <div>
                  <div className="font-extrabold tracking-wider text-sm">{t.brandName}</div>
                  <div className="text-[10px] tracking-[0.18em] text-[#D9BD81]">{t.tagline}</div>
                </div>
              </div>
              <p className="text-xs text-[#F6F4EF]/75 max-w-sm leading-relaxed">
                Creative Office OS 2.0 Frontend Reference. Combining browser-native free utilities, Puter-login-free AI trials, and human-governed creative production.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#D9BD81]">{t.contactHeader}</div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <Phone className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>WhatsApp: +8801778307704</span>
              </div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <Mail className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>Email: bhaifreakinstudio@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <ExternalLink className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>Web: freakinstudio.space (studio subdomain proposed)</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#D9BD81]">Governance & Status</div>
              <p className="text-[#F6F4EF]/70">
                Canonical Ratebook v8/v8.1 & live payment webhooks require server integration before production launch.
              </p>
              <div className="text-[11px] font-mono text-[#D9BD81]">
                Obsidian #090A0A • Gold #D9BD81 • Ivory #F6F4EF • Graphite #232528
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CreativeOfficeContext.Provider>
  );
}
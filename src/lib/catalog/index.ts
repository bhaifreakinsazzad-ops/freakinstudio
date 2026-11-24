import type {
  AddOn,
  AIMicroKit,
  CommercialBundle,
  ConceptWork,
  Service,
  ServiceCategory,
  ServiceVariant,
  ServiceWithAddOns,
} from "@/types/domain";
import legacyCategoriesData from "../../../supabase/seed/data/service-categories.json";
import legacyServicesData from "../../../supabase/seed/data/services.json";

/**
 * FREAKIN'S STUDIO — CREATIVE OFFICE OS 2.0 CANONICAL CATALOG
 * Approved Architecture:
 * - 4 Creative Disciplines (DISC-01 to DISC-04)
 * - 13 Core Services (SRV-01 to SRV-13)
 * - 15 Scoped Variants (VAR-01 to VAR-15)
 * - 5 Commercial Bundles (BND-01 to BND-05)
 * - 14 Optional Add-ons (ADD-01 to ADD-14)
 * - 3 AI Micro-Kits (SKU-SHOP-49, SKU-CAMP-99, SKU-BRAND-199)
 * - 4 Truthful Concept Works (CW-01 to CW-04)
 *
 * Commercial Integrity Note:
 * - Reference hourly baseline (1,500 BDT/hr / $15 USD/hr) is preserved for estimation.
 * - Default pricing_status is 'quote_required' until Owner Ratebook v8/v8.1 is
 *   explicitly approved in Supabase (pricing_status = 'approved' AND ratebook_approved = true).
 */

export const CANONICAL_HOURLY_RATE_BDT = 1500;
export const CANONICAL_HOURLY_RATE_USD = 15;
export const RATEBOOK_VERSION = "v2.0-pending-ratebook-v8_1";
export const RATEBOOK_APPROVED = false;

export const CANONICAL_DISCIPLINES: ServiceCategory[] = [
  {
    id: "DISC-01",
    code: "01",
    name: "Brand & Visual Identity",
    name_bn: "ব্র্যান্ড ও ভিজ্যুয়াল আইডেন্টিটি",
    description:
      "Logo systems, brand refresh, visual guidelines, and stationery lockups.",
    summary:
      "Logo systems, brand refresh, visual guidelines, and stationery lockups.",
    display_order: 1,
    created_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "DISC-02",
    code: "02",
    name: "Social Media & Campaign Creative",
    name_bn: "সোশ্যাল মিডিয়া ও ক্যাম্পেইন ক্রিয়েটিভ",
    description:
      "Social post graphics, carousel storytelling, performance ad creatives, and profile branding kits.",
    summary:
      "Social post graphics, carousel storytelling, performance ad creatives, and profile branding kits.",
    display_order: 2,
    created_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "DISC-03",
    code: "03",
    name: "Commercial Graphic & Print Design",
    name_bn: "কমার্শিয়াল গ্রাফিক ও প্রিন্ট ডিজাইন",
    description:
      "Posters, flyers, brochures, packaging dielines, labels, and executive presentation decks.",
    summary:
      "Posters, flyers, brochures, packaging dielines, labels, and executive presentation decks.",
    display_order: 3,
    created_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "DISC-04",
    code: "04",
    name: "Motion, Reels & Short-Form Video",
    name_bn: "মোশন, রিলস ও শর্ট-ফর্ম ভিডিও",
    description:
      "Reels/Shorts editing, animated social ads, logo intros, and kinetic promo graphics.",
    summary:
      "Reels/Shorts editing, animated social ads, logo intros, and kinetic promo graphics.",
    display_order: 4,
    created_at: "2026-11-01T00:00:00Z",
  },
];

export const CANONICAL_SERVICES: Service[] = [
  {
    id: "SRV-01",
    code: "SRV-01",
    category_id: "DISC-01",
    discipline_id: "DISC-01",
    title: "Logo Design & Mark Creation",
    title_bn: "লোগো ডিজাইন ও মার্ক তৈরি",
    base_bdt: 9000,
    base_usd: 90,
    estimated_hours: 6,
    days: 3,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Primary logomark & wordmark lockup",
      "Monochrome & dark/light variants",
      "2 consolidated revision rounds",
    ],
    excluded: [
      "Trademark legal filing",
      "Full multi-page brand book (see SRV-03)",
    ],
    formats: ["SVG", "PDF", "PNG", "AI/EPS"],
    summary:
      "Bespoke geometric monogram and primary brand mark engineered for scalability across digital and physical surfaces.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-02",
    code: "SRV-02",
    category_id: "DISC-01",
    discipline_id: "DISC-01",
    title: "Logo Redesign / Vector Cleanup",
    title_bn: "লোগো রিডিজাইন ও ভেক্টর ক্লিনআপ",
    base_bdt: 3000,
    base_usd: 30,
    estimated_hours: 2,
    days: 1,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: true,
    express_rule:
      "10-Min Express eligible ONLY for single-file vector trace/color fix with ready source file.",
    included: [
      "Precision bezier vector reconstruction",
      "High-DPI transparent exports",
      "2 consolidated revision rounds",
    ],
    excluded: ["Complete conceptual rebrand"],
    formats: ["SVG", "EPS", "PNG"],
    summary:
      "Precision vectorization, geometry correction, and format rescue for existing brand marks.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-03",
    code: "SRV-03",
    category_id: "DISC-01",
    discipline_id: "DISC-01",
    title: "Brand Identity Starter System",
    title_bn: "ব্র্যান্ড আইডেন্টিটি স্টার্টার সিস্টেম",
    base_bdt: 15000,
    base_usd: 150,
    estimated_hours: 10,
    days: 5,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Logo suite (Primary, Secondary, Submark)",
      "Color palette (HEX/RGB/CMYK) & type hierarchy",
      "Mini brand usage sheet",
    ],
    excluded: ["Packaging structural dielines", "Paid font licenses"],
    formats: ["PDF Brand Sheet", "SVG", "PNG"],
    summary:
      "Foundational visual identity system uniting logomark, color architecture, and typographic rules.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-04",
    code: "SRV-04",
    category_id: "DISC-01",
    discipline_id: "DISC-01",
    title: "Business Card & Stationery Suite",
    title_bn: "বিজনেস কার্ড ও স্টেশনারি সুইট",
    base_bdt: 4500,
    base_usd: 45,
    estimated_hours: 3,
    days: 2,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Double-sided print-ready business card",
      "A4 letterhead & envelope layout",
      "3mm bleed & crop mark pre-press setup",
    ],
    excluded: ["Physical printing & shipping costs"],
    formats: ["Print PDF (CMYK)", "AI"],
    summary:
      "Tactile executive stationery and print-ready corporate card layouts with foil/emboss callouts.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-05",
    code: "SRV-05",
    category_id: "DISC-02",
    discipline_id: "DISC-02",
    title: "Social Media Single Post Creative",
    title_bn: "সোশ্যাল মিডিয়া সিঙ্গেল পোস্ট ক্রিয়েটিভ",
    base_bdt: 3000,
    base_usd: 30,
    estimated_hours: 2,
    days: 1,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: true,
    express_rule:
      "10-Min Express eligible ONLY for text/price swap or crop adaptation on existing studio file.",
    included: [
      "1 static key visual (1:1 or 4:5)",
      "Brand-aligned typography & layout",
      "2 consolidated revision rounds",
    ],
    excluded: ["3D modeling", "Media buying management"],
    formats: ["PNG", "JPG"],
    summary:
      "High-contrast single-frame social graphic tailored for organic engagement or product announcements.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-06",
    code: "SRV-06",
    category_id: "DISC-02",
    discipline_id: "DISC-02",
    title: "Carousel & Story Design Set",
    title_bn: "ক্যারোসেল ও স্টোরি ডিজাইন সেট",
    base_bdt: 6000,
    base_usd: 60,
    estimated_hours: 4,
    days: 2,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Up to 6 seamless swipe carousel frames",
      "2 matching 9:16 story adaptations",
      "2 consolidated revision rounds",
    ],
    excluded: ["Long-form blog copywriting"],
    formats: ["PNG Sequence", "PDF (LinkedIn)"],
    summary:
      "Seamless multi-slide narrative carousels designed for Instagram, LinkedIn, and Facebook retention.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-07",
    code: "SRV-07",
    category_id: "DISC-02",
    discipline_id: "DISC-02",
    title: "Paid Ad Creative Variations",
    title_bn: "পেইড অ্যাড ক্রিয়েটিভ ভ্যারিয়েশন",
    base_bdt: 7500,
    base_usd: 75,
    estimated_hours: 5,
    days: 2,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "3 visual hook variations for A/B testing",
      "Feed (4:5) & Story (9:16) aspect ratios",
      "Conversion-focused CTA hierarchy",
    ],
    excluded: ["Ad account media spend & campaign management"],
    formats: ["PNG", "JPG"],
    summary:
      "Performance-engineered static ad variations built to test hooks, value props, and visual contrast.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-08",
    code: "SRV-08",
    category_id: "DISC-02",
    discipline_id: "DISC-02",
    title: "Social Channel Banner & Profile Kit",
    title_bn: "সোশ্যাল চ্যানেল ব্যানার ও প্রোফাইল কিট",
    base_bdt: 4500,
    base_usd: 45,
    estimated_hours: 3,
    days: 2,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Profile avatar lockup",
      "Cover banners for FB, LinkedIn, YouTube, X",
      "Highlight cover icons (set of 5)",
    ],
    excluded: ["Social community management"],
    formats: ["PNG", "JPG"],
    summary:
      "Cohesive multi-platform header and avatar system calibrated for desktop and mobile safe zones.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-09",
    code: "SRV-09",
    category_id: "DISC-03",
    discipline_id: "DISC-03",
    title: "Poster, Flyer & Print Collateral",
    title_bn: "পোস্টার, ফ্লায়ার ও প্রিন্ট ডিজাইন",
    base_bdt: 4500,
    base_usd: 45,
    estimated_hours: 3,
    days: 2,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Single or double-sided print layout",
      "CMYK 300 DPI pre-press PDF with bleeds",
      "1 digital web-sharing preview",
    ],
    excluded: ["Physical offset/digital printing"],
    formats: ["PDF/X-1a", "JPG"],
    summary:
      "Editorial-grade promotional posters, event flyers, and retail inserts ready for commercial press.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-10",
    code: "SRV-10",
    category_id: "DISC-03",
    discipline_id: "DISC-03",
    title: "Packaging & Label Design",
    title_bn: "প্যাকেজিং ও লেবেল ডিজাইন",
    base_bdt: 10500,
    base_usd: 105,
    estimated_hours: 7,
    days: 4,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Print-ready label or box dieline artwork",
      "Ingredient/barcode compliance placement",
      "3D perspective presentation mockup",
    ],
    excluded: [
      "Custom structural CAD molding",
      "Laboratory regulatory certification",
    ],
    formats: ["AI", "Print PDF", "PNG Mockup"],
    summary:
      "Shelf-commanding product labels, pouches, and rigid box graphics with accurate dieline separation.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-11",
    code: "SRV-11",
    category_id: "DISC-03",
    discipline_id: "DISC-03",
    title: "Presentation & Pitch Deck Design",
    title_bn: "প্রেজেন্টেশন ও পিচ ডেক ডিজাইন",
    base_bdt: 12000,
    base_usd: 120,
    estimated_hours: 8,
    days: 4,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Up to 12 custom-designed master slides",
      "Data visualization & chart restyling",
      "Editable PPTX/Figma handover",
    ],
    excluded: ["Financial modeling & market research"],
    formats: ["PPTX", "PDF"],
    summary:
      "Executive investor pitch decks and corporate sales presentations structured for clarity and persuasion.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-12",
    code: "SRV-12",
    category_id: "DISC-04",
    discipline_id: "DISC-04",
    title: "Short-Form Video / Reel Edit",
    title_bn: "শর্ট-ফর্ম ভিডিও / রিল এডিট",
    base_bdt: 7500,
    base_usd: 75,
    estimated_hours: 5,
    days: 3,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: false,
    included: [
      "Up to 60s vertical 9:16 edit from client footage",
      "Dynamic kinetic captions & sound design",
      "Color correction & royalty-free audio bed",
    ],
    excluded: ["On-location camera shoot", "Paid celebrity voiceover"],
    formats: ["MP4 (H.264 1080p)"],
    summary:
      "High-retention vertical video editing for Reels, TikTok, and YouTube Shorts with kinetic typography.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "SRV-13",
    code: "SRV-13",
    category_id: "DISC-04",
    discipline_id: "DISC-04",
    title: "Motion Graphic Ad & Logo Animation",
    title_bn: "মোশন গ্রাফিক অ্যাড ও লোগো অ্যানিমেশন",
    base_bdt: 9000,
    base_usd: 90,
    estimated_hours: 6,
    days: 3,
    revisions: 2,
    pricing_status: "quote_required",
    express_eligible: true,
    express_rule:
      "10-Min Express eligible ONLY for end-slate text/CTA update on existing studio motion project.",
    included: [
      "10s–20s 2D motion ad or logo reveal",
      "Custom easing curves & sound FX",
      "16:9 and 9:16 export renders",
    ],
    excluded: ["Character rigging", "Cinema 3D fluid simulation"],
    formats: ["MP4", "MOV"],
    summary:
      "Sleek kinetic logo reveals and animated promotional loops engineered for digital ad placements.",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  },
];

export const CANONICAL_VARIANTS: ServiceVariant[] = [
  {
    id: "VAR-01",
    serviceId: "SRV-01",
    title: "Single Concept Wordmark",
    titleBn: "সিঙ্গেল কনসেপ্ট ওয়ার্ডমার্ক",
    scopeSummary: "1 focused direction + vector lockups",
    estimatedHours: 4,
    hourMultiplier: 0.75,
  },
  {
    id: "VAR-02",
    serviceId: "SRV-01",
    title: "Dual Concept Mark + Monogram",
    titleBn: "ডুয়াল কনসেপ্ট মার্ক + মনোগ্রাম",
    scopeSummary: "2 concepts + custom FS-grade monogram",
    estimatedHours: 6,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-03",
    serviceId: "SRV-02",
    title: "10-Min Express Micro Vector Fix",
    titleBn: "১০-মিনিট এক্সপ্রেস ভেক্টর ফিক্স",
    scopeSummary: "Pre-checked single file color/path tweak",
    estimatedHours: 1,
    hourMultiplier: 0.5,
  },
  {
    id: "VAR-04",
    serviceId: "SRV-03",
    title: "Core Identity Sheet (6 Pages)",
    titleBn: "কোর আইডেন্টিটি শিট (৬ পেজ)",
    scopeSummary: "Logo, palette, typography & clearspace",
    estimatedHours: 10,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-05",
    serviceId: "SRV-03",
    title: "Extended Identity Book (12 Pages)",
    titleBn: "এক্সটেন্ডেড আইডেন্টিটি বুক (১২ পেজ)",
    scopeSummary: "Includes social grids, tone & mockups",
    estimatedHours: 14,
    hourMultiplier: 1.4,
  },
  {
    id: "VAR-06",
    serviceId: "SRV-04",
    title: "Card + Letterhead Duo",
    titleBn: "কার্ড + লেটারহেড ডুয়ো",
    scopeSummary: "2 core corporate print items",
    estimatedHours: 3,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-07",
    serviceId: "SRV-05",
    title: "Single Platform Post (1:1 or 4:5)",
    titleBn: "সিঙ্গেল প্ল্যাটফর্ম পোস্ট",
    scopeSummary: "1 static high-impact visual",
    estimatedHours: 2,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-08",
    serviceId: "SRV-06",
    title: "6-Slide Carousel Set",
    titleBn: "৬-স্লাইড ক্যারোসেল সেট",
    scopeSummary: "Seamless storytelling swipe deck",
    estimatedHours: 4,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-09",
    serviceId: "SRV-06",
    title: "10-Slide Authority Carousel",
    titleBn: "১০-স্লাইড অথরিটি ক্যারোসেল",
    scopeSummary: "Deep-dive educational/product swipe deck",
    estimatedHours: 6,
    hourMultiplier: 1.5,
  },
  {
    id: "VAR-10",
    serviceId: "SRV-07",
    title: "3-Hook Ad Test Pack",
    titleBn: "৩-হুক অ্যাড টেস্ট প্যাক",
    scopeSummary: "3 distinct headline/visual ad angles",
    estimatedHours: 5,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-11",
    serviceId: "SRV-09",
    title: "Single-Sided Poster / Flyer",
    titleBn: "সিঙ্গেল-সাইডেড পোস্টার / ফ্লায়ার",
    scopeSummary: "A3/A4/A5 pre-press layout",
    estimatedHours: 3,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-12",
    serviceId: "SRV-10",
    title: "Flat Pouch / Bottle Label",
    titleBn: "ফ্ল্যাট পাউচ / বোতল লেবেল",
    scopeSummary: "Single SKU wrap label + 3D preview",
    estimatedHours: 7,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-13",
    serviceId: "SRV-10",
    title: "Rigid Box Full Dieline + Foil Spec",
    titleBn: "রিজিড বক্স ডাইলাইন + ফয়েল স্পেক",
    scopeSummary: "Outer box + UV/foil separation layers",
    estimatedHours: 10,
    hourMultiplier: 1.4,
  },
  {
    id: "VAR-14",
    serviceId: "SRV-11",
    title: "12-Slide Executive Deck",
    titleBn: "১২-স্লাইড এক্সিকিউটিভ ডেক",
    scopeSummary: "Core pitch narrative & chart polish",
    estimatedHours: 8,
    hourMultiplier: 1.0,
  },
  {
    id: "VAR-15",
    serviceId: "SRV-12",
    title: "Up to 60s Vertical Reel Edit",
    titleBn: "৬০ সেকেন্ড পর্যন্ত রিল এডিট",
    scopeSummary: "Paced cuts, captions & audio mastering",
    estimatedHours: 5,
    hourMultiplier: 1.0,
  },
];

export const CANONICAL_BUNDLES: CommercialBundle[] = [
  {
    id: "BND-01",
    title: "Brand Launch Starter Pack",
    titleBn: "ব্র্যান্ড লঞ্চ স্টার্টার প্যাক",
    includedServiceIds: ["SRV-01", "SRV-04", "SRV-08"],
    estimatedHours: 11,
    turnaroundDays: "5–6 Days",
    revisions: 2,
    summary:
      "Complete day-one identity foundation: custom logomark, executive stationery, and multi-channel social profile kit.",
    deliverables: [
      "Primary Logo & Monogram (SVG/PDF/PNG)",
      "Business Card & Letterhead Print Masters",
      "Social Avatar & Cover Banners",
    ],
    baseBdt: 11 * CANONICAL_HOURLY_RATE_BDT,
    baseUsd: 11 * CANONICAL_HOURLY_RATE_USD,
    pricingStatus: "quote_required",
  },
  {
    id: "BND-02",
    title: "Social Growth Monthly Pulse",
    titleBn: "সোশ্যাল গ্রোথ মান্থলি পালস",
    includedServiceIds: ["SRV-05", "SRV-06", "SRV-12"],
    estimatedHours: 16,
    turnaroundDays: "7–10 Days",
    revisions: 2,
    summary:
      "Consistent social authority package combining 4 single post visuals, 2 multi-slide carousels, and 2 edited short-form Reels.",
    deliverables: [
      "4 Static Campaign Posts",
      "2 Seamless Carousels (up to 6 slides each)",
      "2 Kinetic 9:16 Reels (up to 60s)",
    ],
    baseBdt: 16 * CANONICAL_HOURLY_RATE_BDT,
    baseUsd: 16 * CANONICAL_HOURLY_RATE_USD,
    pricingStatus: "quote_required",
  },
  {
    id: "BND-03",
    title: "Performance Ad Campaign Pod",
    titleBn: "পারফরম্যান্স অ্যাড ক্যাম্পেইন পড",
    includedServiceIds: ["SRV-07", "SRV-13"],
    estimatedHours: 11,
    turnaroundDays: "4–5 Days",
    revisions: 2,
    summary:
      "Built for media buyers: 3 static A/B hook creatives paired with 1 high-converting motion graphic ad loop.",
    deliverables: [
      "3 Static Ad Angles (4:5 & 9:16)",
      "1 Motion Graphic Ad (15s, MP4)",
      "Hook & CTA Hierarchy Checklist",
    ],
    baseBdt: 11 * CANONICAL_HOURLY_RATE_BDT,
    baseUsd: 11 * CANONICAL_HOURLY_RATE_USD,
    pricingStatus: "quote_required",
  },
  {
    id: "BND-04",
    title: "Retail Packaging & Shelf Suite",
    titleBn: "রিটেইল প্যাকেজিং ও শেলফ সুইট",
    includedServiceIds: ["SRV-03", "SRV-10", "SRV-09"],
    estimatedHours: 18,
    turnaroundDays: "7–9 Days",
    revisions: 2,
    summary:
      "Physical commerce flagship combining starter brand identity, print-ready packaging dieline, and retail POS flyer.",
    deliverables: [
      "Starter Identity & Color Spec",
      "Primary Packaging Dieline & 3D Mockup",
      "Retail Display Card / Insert Flyer",
    ],
    baseBdt: 18 * CANONICAL_HOURLY_RATE_BDT,
    baseUsd: 18 * CANONICAL_HOURLY_RATE_USD,
    pricingStatus: "quote_required",
  },
  {
    id: "BND-05",
    title: "Founder Pitch & Fundraising Kit",
    titleBn: "ফাউন্ডার পিচ ও ফান্ডরেইজিং কিট",
    includedServiceIds: ["SRV-03", "SRV-11"],
    estimatedHours: 16,
    turnaroundDays: "6–8 Days",
    revisions: 2,
    summary:
      "Investor-ready visual narrative pairing a cohesive brand identity sheet with a 12-slide executive pitch deck.",
    deliverables: [
      "Brand Identity System Sheet",
      "12-Slide Custom Investor Deck (PPTX + PDF)",
      "Data Chart & Diagram Templates",
    ],
    baseBdt: 16 * CANONICAL_HOURLY_RATE_BDT,
    baseUsd: 16 * CANONICAL_HOURLY_RATE_USD,
    pricingStatus: "quote_required",
  },
];

export const CANONICAL_ADDONS: AddOn[] = [
  {
    id: "ADD-01",
    code: "ADD-01",
    label: "Editable Open Source Files (AI / PSD / FIG)",
    label_bn: "এডিটেবল সোর্স ফাইল (AI / PSD / FIG)",
    unit_price_bdt: 2 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 2 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 2,
    compatible_services: [
      "SRV-01",
      "SRV-03",
      "SRV-04",
      "SRV-05",
      "SRV-06",
      "SRV-07",
      "SRV-08",
      "SRV-09",
      "SRV-10",
      "SRV-11",
    ],
    summary: "Packaged working layers with organized artboards.",
  },
  {
    id: "ADD-02",
    code: "ADD-02",
    label: "Extra Aspect Ratio Adaptation (9:16 / 16:9 / 1:1)",
    label_bn: "অতিরিক্ত অ্যাসপেক্ট রেশিও অ্যাডাপ্টেশন",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: ["SRV-05", "SRV-06", "SRV-07", "SRV-12", "SRV-13"],
    summary: "Re-layout of approved master into an additional platform dimension.",
  },
  {
    id: "ADD-03",
    code: "ADD-03",
    label: "Bilingual Copy Layout (Bangla + English)",
    label_bn: "দ্বিভাষিক কপি লেআউট (বাংলা + ইংরেজি)",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: [
      "SRV-05",
      "SRV-06",
      "SRV-07",
      "SRV-09",
      "SRV-10",
      "SRV-11",
    ],
    summary: "Dual-language typographic pairing for local & global audiences.",
  },
  {
    id: "ADD-04",
    code: "ADD-04",
    label: "Additional Consolidated Revision Round (+1)",
    label_bn: "অতিরিক্ত রিভিশন রাউন্ড (+১)",
    unit_price_bdt: 1.5 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1.5 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1.5,
    compatible_services: [
      "SRV-01",
      "SRV-02",
      "SRV-03",
      "SRV-04",
      "SRV-05",
      "SRV-06",
      "SRV-07",
      "SRV-08",
      "SRV-09",
      "SRV-10",
      "SRV-11",
      "SRV-12",
      "SRV-13",
    ],
    summary: "Extends standard 2-revision policy by 1 structured feedback cycle.",
  },
  {
    id: "ADD-05",
    code: "ADD-05",
    label: "Print Pre-Press Foil & Spot-UV Separation",
    label_bn: "প্রিন্ট ফয়েল ও স্পট-ইউভি সেপারেশন",
    unit_price_bdt: 1.5 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1.5 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1.5,
    compatible_services: ["SRV-04", "SRV-09", "SRV-10"],
    summary: "Dedicated vector spot plates for metallic foil and embossing.",
  },
  {
    id: "ADD-06",
    code: "ADD-06",
    label: "3D Studio Mockup Render Pack (3 Angles)",
    label_bn: "থ্রিডি স্টুডিও মকআপ রেন্ডার প্যাক",
    unit_price_bdt: 2 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 2 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 2,
    compatible_services: ["SRV-01", "SRV-03", "SRV-04", "SRV-10"],
    summary: "High-resolution hero renders for e-commerce and launch PR.",
  },
  {
    id: "ADD-07",
    code: "ADD-07",
    label: "Animated Subtitles & SRT Caption File",
    label_bn: "অ্যানিমেটেড সাবটাইটেল ও SRT ফাইল",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: ["SRV-12", "SRV-13"],
    summary: "Burned-in kinetic captions plus clean SRT sidecar file.",
  },
  {
    id: "ADD-08",
    code: "ADD-08",
    label: "Custom Thumbnail & Cover Frame",
    label_bn: "কাস্টম থাম্বনেইল ও কভার ফ্রেম",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: ["SRV-12", "SRV-13"],
    summary: "High-CTR static cover frame matched to video aesthetic.",
  },
  {
    id: "ADD-09",
    code: "ADD-09",
    label: "Extra 4 Presentation Slides",
    label_bn: "অতিরিক্ত ৪টি প্রেজেন্টেশন স্লাইড",
    unit_price_bdt: 2.5 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 2.5 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 2.5,
    compatible_services: ["SRV-11"],
    summary: "Expands 12-slide base deck with 4 additional bespoke slides.",
  },
  {
    id: "ADD-10",
    code: "ADD-10",
    label: "Extra 2 Carousel Slides",
    label_bn: "অতিরিক্ত ২টি ক্যারোসেল স্লাইড",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: ["SRV-06"],
    summary: "Extends carousel story depth with 2 additional seamless frames.",
  },
  {
    id: "ADD-11",
    code: "ADD-11",
    label: "Social Post Caption & Hashtag Matrix",
    label_bn: "সোশ্যাল ক্যাপশন ও হ্যাশট্যাগ ম্যাট্রিক্স",
    unit_price_bdt: 1 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1,
    compatible_services: ["SRV-05", "SRV-06", "SRV-07"],
    summary: "Human-edited conversion copy and CTA hooks for your visual.",
  },
  {
    id: "ADD-12",
    code: "ADD-12",
    label: "SKU Flavor / Colorway Variant Adaptation",
    label_bn: "এসকেইউ ফ্লেভার / কালারওয়ে ভ্যারিয়েন্ট",
    unit_price_bdt: 2 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 2 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 2,
    compatible_services: ["SRV-10"],
    summary: "Adapts master packaging dieline to a second product flavor/scent.",
  },
  {
    id: "ADD-13",
    code: "ADD-13",
    label: "Brand Color Accessibility & WCAG Audit Sheet",
    label_bn: "ব্র্যান্ড কালার অ্যাক্সেসিবিলিটি ও WCAG শিট",
    unit_price_bdt: 1.5 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 1.5 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 1.5,
    compatible_services: ["SRV-01", "SRV-03"],
    summary: "Contrast matrix verifying AA/AAA digital legibility.",
  },
  {
    id: "ADD-14",
    code: "ADD-14",
    label: "Priority Same-Day Studio Slot (Subject to Confirmation)",
    label_bn: "প্রায়োরিটি সেম-ডে স্টুডিও স্লট (কনফার্মেশন সাপেক্ষে)",
    unit_price_bdt: 2 * CANONICAL_HOURLY_RATE_BDT,
    unit_price_usd: 2 * CANONICAL_HOURLY_RATE_USD,
    extra_hours: 2,
    compatible_services: ["SRV-02", "SRV-04", "SRV-05", "SRV-08", "SRV-09"],
    summary:
      "Reserves dedicated evening/same-day queue after studio slot verification.",
  },
];

export const CANONICAL_AI_MICRO_KITS: AIMicroKit[] = [
  {
    sku: "SKU-SHOP-49",
    title: "Shop Starter AI Kit",
    titleBn: "শপ স্টার্টার এআই কিট",
    priceBdt: 49,
    priceUsd: 1,
    statusLabel: "Proposed Micro-Product Test Tier • Demo Contract Preview",
    checkoutEnabled: false,
    targetAudience:
      "F-Commerce & Boutique D2C Sellers launching a new product SKU.",
    includedOutputs: [
      "5 Structured Product Benefit Bullets (EN + BN)",
      "3 Facebook/Instagram Launch Captions with CTA",
      "1 Color & Lighting Art Direction Prompt Sheet",
      "1 Pre-Sized 1080×1350 Promo Layout Wireframe Guide",
    ],
    explicitExclusions: [
      "Does NOT include custom human logo design or vector redraw",
      "Does NOT include live media buying or boost budget",
      "Does NOT process real payment until verified server webhook is connected",
    ],
    samplePreview:
      'SKU-SHOP-49 Output Sample → [Hero Hook]: "Crafted in Dhaka, finished in Champagne Gold." | [CTA]: "Tap WhatsApp +8801778307704 to reserve Batch 01."',
  },
  {
    sku: "SKU-CAMP-99",
    title: "Campaign Ready AI Kit",
    titleBn: "ক্যাম্পেইন রেডি এআই কিট",
    priceBdt: 99,
    priceUsd: 2,
    statusLabel: "Proposed Micro-Product Test Tier • Demo Contract Preview",
    checkoutEnabled: false,
    targetAudience:
      "Growth Marketers & Agencies preparing a seasonal or flash-sale campaign.",
    includedOutputs: [
      "6 A/B Paid Ad Hooks (Problem, Proof, Authority angles)",
      "6-Slide Carousel Copy Script & Visual Frame Blueprint",
      "15-Second Vertical Reel Shot-by-Shot Storyboard Script",
      "Campaign UTM & Conversion Checklist (.MD export)",
    ],
    explicitExclusions: [
      "Does NOT include human video editing (see SRV-12)",
      "Does NOT include custom 3D animation renders",
      "Demo checkout only — no unverified payment capture",
    ],
    samplePreview:
      "SKU-CAMP-99 Output Sample → [Slide 1]: Why 78% of social ads fail in 2 seconds | [Reel 00:03]: Snap zoom to product texture + gold lower-third.",
  },
  {
    sku: "SKU-BRAND-199",
    title: "Brand Mini AI Kit",
    titleBn: "ব্র্যান্ড মিনি এআই কিট",
    priceBdt: 199,
    priceUsd: 3,
    statusLabel: "Proposed Micro-Product Test Tier • Demo Contract Preview",
    checkoutEnabled: false,
    targetAudience:
      "Early Founders clarifying brand positioning before commissioning SRV-01 or SRV-03.",
    includedOutputs: [
      "Brand Positioning Statement & Archetype Brief",
      "Curated 4-Color HEX Palette with WCAG Contrast Ratios",
      "Typography Pairing Recommendation (Display + Body + Mono)",
      "Ready-to-Submit Freakin's Studio Smart Brief JSON/MD",
    ],
    explicitExclusions: [
      "Does NOT replace human trademark design or print pre-press (SRV-01/SRV-03)",
      "Does NOT include open .AI/.EPS logomark files",
      "Demo checkout only — upgrades cleanly into human studio credit",
    ],
    samplePreview:
      "SKU-BRAND-199 Output Sample → [Archetype]: The Precision Creator | [Palette]: #090A0A Obsidian, #D9BD81 Champagne Gold, #F6F4EF Ivory | [Contrast]: 16.8:1 AAA.",
  },
];

export const CANONICAL_CONCEPT_WORKS: ConceptWork[] = [
  {
    id: "CW-01",
    disciplineId: "DISC-01",
    serviceId: "SRV-03",
    title: "Obsidian Horology — Monogram & Identity System",
    categoryLabel: "Brand & Visual Identity",
    truthBadge: "CONCEPT WORK — NOT CLIENT WORK",
    deliverables: [
      "Geometric Monogram SVG",
      "12-Page Identity Specification",
      "Foil Stationery Dieline",
    ],
    formats: ["SVG", "PDF/X-1a", "AI"],
    visualTheme:
      "Architectural timepiece studio study exploring micro-serif hairlines and hot-stamped champagne gold foil on 600gsm cotton obsidian board.",
    accentHex: "#D9BD81",
    rationale:
      "Demonstrates Freakin's Studio precision bezier geometry, dark-mode contrast discipline, and print foil separation without claiming fabricated client revenue metrics.",
    imageUrl: "/images/portfolio/brand-identity.jpg",
  },
  {
    id: "CW-02",
    disciplineId: "DISC-03",
    serviceId: "SRV-10",
    title: "Sylhet Botanicals — Rigid Box & Apothecary Label",
    categoryLabel: "Commercial Graphic & Print",
    truthBadge: "CONCEPT WORK — NOT CLIENT WORK",
    deliverables: [
      "Rigid Box Structural Dieline",
      "Amber Bottle Wrap Label",
      "Spot-UV Separation Plate",
    ],
    formats: ["AI", "CMYK Print PDF", "3D GLTF/PNG"],
    visualTheme:
      "Tactile luxury packaging study combining bilingual English/Bangla botanical typography with high-contrast apothecary grid labeling.",
    accentHex: "#C5A059",
    rationale:
      "Illustrates pre-press bleed accuracy, barcode clearance, and luxury shelf presence for South Asian D2C wellness brands.",
    imageUrl: "/images/portfolio/luxury-packaging.jpg",
  },
  {
    id: "CW-03",
    disciplineId: "DISC-02",
    serviceId: "SRV-07",
    title: "Veloce Audio — Performance Ad & Carousel Matrix",
    categoryLabel: "Social & Campaign Creative",
    truthBadge: "CONCEPT WORK — NOT CLIENT WORK",
    deliverables: [
      "3 Hook Ad Variations (4:5 & 9:16)",
      "6-Frame Seamless Carousel",
      "Typography Hierarchy Guide",
    ],
    formats: ["PNG", "Figma Spec"],
    visualTheme:
      "High-contrast acoustic hardware campaign study engineered around focal-point lighting and thumb-stopping headline contrast.",
    accentHex: "#E2C792",
    rationale:
      "Showcases visual hook differentiation and safe-zone compliance across Meta and LinkedIn placements without inventing fake ROAS numbers.",
    imageUrl: "/images/portfolio/ad-campaign.jpg",
  },
  {
    id: "CW-04",
    disciplineId: "DISC-04",
    serviceId: "SRV-13",
    title: "Pulse Fintech — Kinetic Reel & Logo Reveal Study",
    categoryLabel: "Motion, Reels & Short-Form Video",
    truthBadge: "CONCEPT WORK — NOT CLIENT WORK",
    deliverables: [
      "15s 9:16 Kinetic Promo Cut",
      "4s Vector Logo Sting",
      "Burned-In Caption Style Guide",
    ],
    formats: ["MP4 (1080p 60fps)", "SRT"],
    visualTheme:
      "Rhythmic motion study utilizing spring-physics typography, clean UI card transitions, and audio-synced frame cuts.",
    accentHex: "#D9BD81",
    rationale:
      "Highlights studio motion pacing and legible kinetic subtitling for mobile-first financial and tech storytelling.",
    imageUrl: "/images/portfolio/video-motion.jpg",
  },
];

// Build service -> compatible add-ons map from the 14 canonical add-ons
const CANONICAL_SERVICE_ADDONS_MAP: Record<string, string[]> = {};
for (const srv of CANONICAL_SERVICES) {
  CANONICAL_SERVICE_ADDONS_MAP[srv.id] = CANONICAL_ADDONS.filter((addon) =>
    addon.compatible_services?.includes(srv.id)
  ).map((addon) => addon.id);
}

// Legacy compatibility lookup (for historical A01..G07 orders/quotes in DB)
const LEGACY_CATEGORIES: ServiceCategory[] =
  legacyCategoriesData as ServiceCategory[];
const LEGACY_SERVICES: Service[] = (
  legacyServicesData as Omit<Service, "created_at" | "updated_at">[]
).map((s) => ({
  ...s,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export type AddOnFamily =
  | "Strategy & Research"
  | "Content & Copywriting"
  | "Creative Production"
  | "Distribution & Adaptation"
  | "Operations & Handover"
  | "Commercial & Extended Scope";

export function getAddOnFamily(label: string): AddOnFamily {
  const lower = label.toLowerCase();
  if (
    lower.includes("strategy") ||
    lower.includes("audit") ||
    lower.includes("wcag") ||
    lower.includes("accessibility") ||
    lower.includes("research")
  ) {
    return "Strategy & Research";
  }
  if (
    lower.includes("copy") ||
    lower.includes("caption") ||
    lower.includes("subtitle") ||
    lower.includes("bilingual") ||
    lower.includes("hashtag")
  ) {
    return "Content & Copywriting";
  }
  if (
    lower.includes("adaptation") ||
    lower.includes("aspect ratio") ||
    lower.includes("variant") ||
    lower.includes("slide") ||
    lower.includes("thumbnail")
  ) {
    return "Distribution & Adaptation";
  }
  if (
    lower.includes("source") ||
    lower.includes("revision") ||
    lower.includes("priority") ||
    lower.includes("same-day") ||
    lower.includes("foil") ||
    lower.includes("pre-press")
  ) {
    return "Operations & Handover";
  }
  if (
    lower.includes("buyout") ||
    lower.includes("license") ||
    lower.includes("retainer")
  ) {
    return "Commercial & Extended Scope";
  }
  return "Creative Production";
}

export interface ServiceConfigSchema {
  formatOptions: string[];
  aspectRatioOptions: string[];
  durationOptions?: string[];
  quantityLabel: string;
  rushAvailable: boolean;
  express10MinEligible: boolean;
  expressRule?: string;
}

export function getServiceConfigSchema(serviceId: string): ServiceConfigSchema {
  const srv = CANONICAL_SERVICES.find((s) => s.id === serviceId);
  const discId = srv?.category_id || serviceId;

  if (discId === "DISC-04" || serviceId.startsWith("C")) {
    return {
      formatOptions: [
        "MP4 (H.264 1080p)",
        "MOV Master",
        "9:16 + 16:9 Dual Render",
      ],
      aspectRatioOptions: [
        "9:16 Vertical (Reels / Shorts / TikTok)",
        "16:9 Widescreen (YouTube / Web)",
        "1:1 Square (Feed)",
      ],
      durationOptions: ["Up to 15s", "15s – 30s", "30s – 60s"],
      quantityLabel: "Number of Video / Motion Deliverables",
      rushAvailable: false,
      express10MinEligible: Boolean(srv?.express_eligible),
      expressRule: srv?.express_rule ?? undefined,
    };
  }

  if (discId === "DISC-01" || serviceId.startsWith("B")) {
    return {
      formatOptions: [
        "Vector Master Suite (AI, EPS, SVG, PDF)",
        "Brand System PDF + Vector Exports",
        "Print-Ready CMYK Stationery Package",
      ],
      aspectRatioOptions: [
        "Universal Scalable Vector",
        "A4 / Standard Print Ratio",
        "16:9 Presentation Layout",
      ],
      quantityLabel: "Identity System Scope Units",
      rushAvailable: false,
      express10MinEligible: Boolean(srv?.express_eligible),
      expressRule: srv?.express_rule ?? undefined,
    };
  }

  if (discId === "DISC-02" || serviceId.startsWith("D") || serviceId.startsWith("E")) {
    return {
      formatOptions: [
        "High-DPI PNG + JPG Social Pack",
        "Carousel Sequence + LinkedIn PDF",
        "Multi-Placement Paid Ad Matrix",
      ],
      aspectRatioOptions: [
        "4:5 Portrait Feed (1080×1350)",
        "1:1 Square Feed (1080×1080)",
        "9:16 Full-Screen Story (1080×1920)",
      ],
      quantityLabel: "Number of Creative Sets",
      rushAvailable: false,
      express10MinEligible: Boolean(srv?.express_eligible),
      expressRule: srv?.express_rule ?? undefined,
    };
  }

  return {
    formatOptions: [
      "Print-Ready CMYK PDF/X-1a (300 DPI + Bleeds)",
      "Packaging Dieline AI + 3D Mockup",
      "Editable Presentation Deck (PPTX + PDF)",
    ],
    aspectRatioOptions: [
      "Custom Structural Dieline / Print Trim",
      "16:9 Widescreen Executive Slide",
      "A3 / A4 / A5 Standard Collateral",
    ],
    quantityLabel: "Deliverable Units / Sets",
    rushAvailable: false,
    express10MinEligible: Boolean(srv?.express_eligible),
    expressRule: srv?.express_rule ?? undefined,
  };
}

async function createPublicCatalogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url.trim(), anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the 4 approved Creative Disciplines (`DISC-01` to `DISC-04`).
 */
export async function getCatalogCategories(): Promise<ServiceCategory[]> {
  try {
    const supabase = await createPublicCatalogClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, code, name, name_bn, description, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const fallback = CANONICAL_DISCIPLINES.find((d) => d.id === row.id);
          return {
            ...(fallback || {}),
            id: row.id,
            code: row.code || fallback?.code,
            name: row.name,
            name_bn: row.name_bn ?? fallback?.name_bn,
            description: row.description ?? fallback?.description,
            summary: row.description ?? fallback?.summary,
            sort_order: row.sort_order,
            display_order: row.sort_order,
          };
        });
      }
    }
  } catch {
    // Clean fallback to canonical definitions if DB is offline during static generation
  }
  return CANONICAL_DISCIPLINES;
}

/**
 * Returns the 13 approved Core Creative Services (`SRV-01` to `SRV-13`).
 * When Supabase is configured, DB pricing_status, base_bdt, base_usd, and ratebook_approved override
 * static defaults so owner-approved Ratebook v8/v8.1 rows unlock checkout dynamically.
 */
export async function getCatalogServices(): Promise<Service[]> {
  try {
    const supabase = await createPublicCatalogClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("services")
        .select(
          "id, code, category_id, title, title_bn, base_bdt, base_usd, estimated_hours, days, revisions, pricing_status, express_eligible, express_rule, summary, ratebook_version, ratebook_approved, active, created_at, updated_at"
        )
        .eq("active", true)
        .order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const fallback = CANONICAL_SERVICES.find((s) => s.id === row.id);
          const dbApproved =
            row.pricing_status === "approved" && Boolean(row.ratebook_approved);
          return {
            ...(fallback || {}),
            ...row,
            code: row.code ?? fallback?.code,
            discipline_id: row.category_id,
            pricing_status: dbApproved ? "approved" : "quote_required",
            ratebook_approved: Boolean(row.ratebook_approved),
          } as Service;
        });
      }
    }
  } catch {
    // Fallback to canonical quote-gated defaults
  }
  return CANONICAL_SERVICES;
}

/**
 * Returns the 15 approved Scoped Service Variants (`VAR-01` to `VAR-15`).
 */
export function getCatalogVariants(serviceId?: string): ServiceVariant[] {
  if (!serviceId) return CANONICAL_VARIANTS;
  return CANONICAL_VARIANTS.filter((v) => v.serviceId === serviceId);
}

/**
 * Returns the 5 approved Commercial Bundles (`BND-01` to `BND-05`).
 */
export function getCatalogBundles(): CommercialBundle[] {
  return CANONICAL_BUNDLES;
}

/**
 * Returns the 14 approved Optional Add-ons (`ADD-01` to `ADD-14`).
 */
export async function getAllAddOns(): Promise<AddOn[]> {
  try {
    const supabase = await createPublicCatalogClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("add_ons")
        .select("id, code, label, label_bn, unit_price_bdt, unit_price_usd, extra_hours, summary, active")
        .eq("active", true)
        .order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const fallback = CANONICAL_ADDONS.find((a) => a.id === row.id);
          return {
            ...(fallback || {}),
            ...row,
            code: row.code ?? fallback?.code,
            compatible_services: fallback?.compatible_services,
          } as AddOn;
        });
      }
    }
  } catch {
    // Fallback to canonical add-ons
  }
  return CANONICAL_ADDONS;
}

/**
 * Returns the 3 proposed AI Micro-Kits (`SKU-SHOP-49`, `SKU-CAMP-99`, `SKU-BRAND-199`).
 */
export function getCatalogAIMicroKits(): AIMicroKit[] {
  return CANONICAL_AI_MICRO_KITS;
}

/**
 * Returns the 4 truthful Concept Works (`CW-01` to `CW-04`).
 */
export function getCatalogConceptWorks(): ConceptWork[] {
  return CANONICAL_CONCEPT_WORKS;
}

/**
 * Returns compatible add-ons for a specific service ID.
 */
export async function getAddOnsForService(serviceId: string): Promise<AddOn[]> {
  const allAddOns = await getAllAddOns();
  const addonIds = CANONICAL_SERVICE_ADDONS_MAP[serviceId] || [];
  if (addonIds.length === 0) {
    return allAddOns.slice(0, 4);
  }
  const idSet = new Set(addonIds);
  return allAddOns.filter((a) => idSet.has(a.id));
}

/**
 * Returns the complete serviceId -> addOnIds mapping for the 13 canonical services.
 */
export function getAllServiceAddOnsMap(): Record<string, string[]> {
  return CANONICAL_SERVICE_ADDONS_MAP;
}

/**
 * Fetch a single service by ID (supports both canonical `SRV-01`..`SRV-13` and legacy archive `A01`..`G07`).
 */
export async function getServiceById(
  id: string
): Promise<ServiceWithAddOns | null> {
  const services = await getCatalogServices();
  const categories = await getCatalogCategories();
  const canonicalService = services.find(
    (s) => s.id.toUpperCase() === id.toUpperCase()
  );

  if (canonicalService) {
    const category = categories.find(
      (c) => c.id === canonicalService.category_id
    );
    const addOns = await getAddOnsForService(canonicalService.id);
    const variants = getCatalogVariants(canonicalService.id);
    return {
      ...canonicalService,
      category,
      addOns,
      variants,
    };
  }

  // Fallback for historical legacy archive IDs (A01..G07) so old database links never crash
  const legacyService = LEGACY_SERVICES.find(
    (s) => s.id.toUpperCase() === id.toUpperCase()
  );
  if (legacyService) {
    const category = LEGACY_CATEGORIES.find(
      (c) => c.id === legacyService.category_id
    );
    return {
      ...legacyService,
      pricing_status: "quote_required",
      category,
      addOns: CANONICAL_ADDONS.slice(0, 4),
      variants: [],
    };
  }

  return null;
}

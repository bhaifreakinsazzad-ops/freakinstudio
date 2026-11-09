import { createClient } from "@/lib/supabase/client";
import type {
  Service,
  ServiceCategory,
  AddOn,
  ServiceWithAddOns,
  PricingStatus,
} from "@/types/domain";

import categoriesJson from "../../../supabase/seed/data/service-categories.json";
import servicesJson from "../../../supabase/seed/data/services.json";
import addOnsJson from "../../../supabase/seed/data/add-ons.json";
import serviceAddOnsJson from "../../../supabase/seed/data/service-add-ons.json";

interface RawSeedService {
  id: string;
  category_id: string;
  title: string;
  title_bn: string | null;
  base_usd: number;
  base_bdt: number;
  days: number;
  revisions: number;
  pricing_status: PricingStatus;
}

// In-memory canonical fallbacks
const canonicalCategories: ServiceCategory[] = categoriesJson as ServiceCategory[];
const canonicalServices: Service[] = (servicesJson as RawSeedService[]).map((s) => ({
  ...s,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));
const canonicalAddOns: AddOn[] = addOnsJson as AddOn[];
const canonicalServiceAddOns: { service_id: string; add_on_id: string }[] =
  serviceAddOnsJson;

const addOnMap = new Map<string, AddOn>();
canonicalAddOns.forEach((a) => addOnMap.set(a.id, a));

const serviceAddOnsMap = new Map<string, AddOn[]>();
canonicalServiceAddOns.forEach((rel) => {
  const existing = serviceAddOnsMap.get(rel.service_id) || [];
  const addOn = addOnMap.get(rel.add_on_id);
  if (addOn) {
    existing.push(addOn);
    serviceAddOnsMap.set(rel.service_id, existing);
  }
});

export async function getCatalogCategories(): Promise<ServiceCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ServiceCategory[];
    }
  } catch {
    // Fall back to canonical data
  }
  return canonicalCategories;
}

export const getAllCategories = getCatalogCategories;

export async function getCatalogServices(
  categoryId?: string,
): Promise<Service[]> {
  try {
    const supabase = createClient();
    let query = supabase.from("services").select("*").order("id", { ascending: true });
    if (categoryId && categoryId !== "ALL") {
      query = query.eq("category_id", categoryId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as Service[];
    }
  } catch {
    // Fall back to canonical data
  }

  if (categoryId && categoryId !== "ALL") {
    return canonicalServices.filter((s) => s.category_id === categoryId);
  }
  return canonicalServices;
}

export const getAllServices = getCatalogServices;

export async function getServiceById(
  id: string,
): Promise<ServiceWithAddOns | null> {
  const uppercaseId = id.toUpperCase();
  let baseService: Service | null = null;
  let category: ServiceCategory | undefined;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*, service_categories(*)")
      .eq("id", uppercaseId)
      .single();

    if (!error && data) {
      baseService = data as unknown as Service;
      category = (data as unknown as { service_categories?: ServiceCategory }).service_categories;
    }
  } catch {
    // Fall back to canonical
  }

  if (!baseService) {
    baseService = canonicalServices.find((s) => s.id === uppercaseId) || null;
  }

  if (!baseService) return null;

  if (!category) {
    category = canonicalCategories.find((c) => c.id === baseService!.category_id);
  }

  const addOns = await getAddOnsForService(uppercaseId);

  return {
    ...baseService,
    category,
    addOns,
  };
}

export async function getAddOnsForService(serviceId: string): Promise<AddOn[]> {
  const uppercaseId = serviceId.toUpperCase();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("service_add_ons")
      .select("add_on_id, add_ons(*)")
      .eq("service_id", uppercaseId);

    if (!error && data && data.length > 0) {
      return (data as unknown as Array<{ add_ons: AddOn }>)
        .map((row) => row.add_ons)
        .filter(Boolean);
    }
  } catch {
    // Fall back to canonical
  }

  return serviceAddOnsMap.get(uppercaseId) || [];
}

export async function getAllAddOns(): Promise<AddOn[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("add_ons")
      .select("*")
      .order("label", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as AddOn[];
    }
  } catch {
    // Fall back
  }
  return canonicalAddOns;
}

export function getAllServiceAddOnsMap(): Record<string, AddOn[]> {
  const result: Record<string, AddOn[]> = {};
  for (const [sid, list] of serviceAddOnsMap.entries()) {
    result[sid] = list;
  }
  return result;
}

export type AddOnFamily =
  | "Strategy & Research"
  | "Content & Copywriting"
  | "Creative Production"
  | "Distribution & Adaptation"
  | "Operations & Handover"
  | "Commercial & Extended Scope";

export function getAddOnFamily(label: string): AddOnFamily {
  const l = label.toLowerCase();
  if (
    l.includes("strategy") ||
    l.includes("audit") ||
    l.includes("research") ||
    l.includes("discovery") ||
    l.includes("concept") ||
    l.includes("persona") ||
    l.includes("roadmap") ||
    l.includes("matrix") ||
    l.includes("brief")
  ) {
    return "Strategy & Research";
  }
  if (
    l.includes("copy") ||
    l.includes("script") ||
    l.includes("writing") ||
    l.includes("tagline") ||
    l.includes("hook") ||
    l.includes("voiceover") ||
    l.includes("translation") ||
    l.includes("bilingual") ||
    l.includes("transcription")
  ) {
    return "Content & Copywriting";
  }
  if (
    l.includes("format") ||
    l.includes("cutdown") ||
    l.includes("aspect") ||
    l.includes("resize") ||
    l.includes("adaptation") ||
    l.includes("reels") ||
    l.includes("story") ||
    l.includes("platform") ||
    l.includes("cuts") ||
    l.includes("variant")
  ) {
    return "Distribution & Adaptation";
  }
  if (
    l.includes("source") ||
    l.includes("vector") ||
    l.includes("handover") ||
    l.includes("guideline") ||
    l.includes("rush") ||
    l.includes("express") ||
    l.includes("archive") ||
    l.includes("raw") ||
    l.includes("package")
  ) {
    return "Operations & Handover";
  }
  if (
    l.includes("license") ||
    l.includes("commercial") ||
    l.includes("copyright") ||
    l.includes("trademark") ||
    l.includes("extended") ||
    l.includes("broadcast") ||
    l.includes("print")
  ) {
    return "Commercial & Extended Scope";
  }
  return "Creative Production";
}

export interface ServiceConfigSchema {
  formatOptions: string[];
  defaultFormat: string;
  quantityLabel: string;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  rushAvailable: boolean;
  notes?: string;
}

export function getServiceConfigSchema(serviceId: string): ServiceConfigSchema {
  const cat = serviceId.charAt(0).toUpperCase();

  switch (cat) {
    case "A": // Graphic Design
      return {
        formatOptions: [
          "Social Post (1:1 & 4:5)",
          "Story / Vertical (9:16)",
          "Landscape / Banner (16:9)",
          "Print Ready PDF (300 DPI)",
          "Vector & Source Master",
        ],
        defaultFormat: "Social Post (1:1 & 4:5)",
        quantityLabel: "Number of Creative Assets",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 50,
        rushAvailable: true,
      };
    case "B": // Brand Identity
      return {
        formatOptions: [
          "Full Vector Suite (AI, EPS, SVG, PNG, PDF)",
          "Digital Brand Guidelines PDF",
          "Web & App Ready Asset Pack",
        ],
        defaultFormat: "Full Vector Suite (AI, EPS, SVG, PNG, PDF)",
        quantityLabel: "Brand Scope / Concepts",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 5,
        rushAvailable: true,
        notes: "Includes master logo, alternate marks, palette, and typography specifications.",
      };
    case "C": // Video Production & Motion
      return {
        formatOptions: [
          "Vertical 9:16 (Reels/Shorts/TikTok - 1080x1920)",
          "Horizontal 16:9 (YouTube/Web - 4K/1080p)",
          "Square 1:1 (Feed Video)",
          "Multi-Platform Master Pack (9:16 + 16:9)",
        ],
        defaultFormat: "Vertical 9:16 (Reels/Shorts/TikTok - 1080x1920)",
        quantityLabel: "Video Edits / Cuts",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 30,
        rushAvailable: true,
      };
    case "D": // Social Media & Content
      return {
        formatOptions: [
          "Monthly Content Calendar & Assets",
          "Weekly Sprint Batch",
          "Campaign Sprint Package",
        ],
        defaultFormat: "Monthly Content Calendar & Assets",
        quantityLabel: "Content Cycles / Deliverable Batches",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 12,
        rushAvailable: true,
      };
    case "E": // Advertising & Marketing
      return {
        formatOptions: [
          "Meta Ads Pack (Feed 1:1, Story 9:16)",
          "Google Display Network Standard Sizes",
          "Omnichannel Campaign Suite",
        ],
        defaultFormat: "Meta Ads Pack (Feed 1:1, Story 9:16)",
        quantityLabel: "Ad Variations / Ad Sets",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 20,
        rushAvailable: true,
      };
    case "F": // AI-Powered Creative
      return {
        formatOptions: [
          "High-Resolution Generative Stills (4K/8K)",
          "Dynamic AI Video Sequences",
          "Custom Prompt & Model Workflow Pipeline",
        ],
        defaultFormat: "High-Resolution Generative Stills (4K/8K)",
        quantityLabel: "Generated Sequences / Deliverables",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 40,
        rushAvailable: true,
      };
    case "G": // Corporate Communication
    default:
      return {
        formatOptions: [
          "Interactive PDF Deck",
          "Editable Keynote / PowerPoint",
          "Print-Ready Corporate Document",
          "Executive Summary Deck",
        ],
        defaultFormat: "Interactive PDF Deck",
        quantityLabel: "Document Sections / Slides Count (in units of 10)",
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 10,
        rushAvailable: true,
      };
  }
}

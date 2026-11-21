import type { Database } from "./database.types";

export const USER_ROLES = [
  "customer",
  "customer_org_admin",
  "customer_team_member",
  "designer",
  "video_editor",
  "sales_rep",
  "project_manager",
  "finance_manager",
  "studio_admin",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLES: readonly UserRole[] = [
  "studio_admin",
  "super_admin",
] as const;

export type PricingStatus = "approved" | "quote_required";

export type Currency = "BDT" | "USD";

export type ProjectStatus =
  | "draft"
  | "pending_payment"
  | "onboarding"
  | "brief_submitted"
  | "in_production"
  | "internal_qa"
  | "client_review"
  | "revision_requested"
  | "client_approved"
  | "delivered"
  | "archived"
  | "cancelled"
  | "disputed"
  // v2 Creative Office OS canonical lifecycle stages
  | "request_submitted"
  | "quote_issued"
  | "accepted"
  | "assigned"
  | "proof_ready"
  | "approved";

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

export type PaymentGateway = "sslcommerz" | "stripe" | "manual_bank";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ServiceCategory = Omit<
  Database["public"]["Tables"]["service_categories"]["Row"],
  "sort_order"
> & {
  sort_order?: number;
  code?: string;
  name_bn?: string;
  description?: string;
  summary?: string;
  display_order?: number;
  created_at?: string;
};

export type Service = Omit<
  Database["public"]["Tables"]["services"]["Row"],
  "express_rule" | "ratebook_version" | "ratebook_approved" | "included" | "excluded" | "formats"
> & {
  code?: string;
  discipline_id?: string;
  estimated_hours?: number;
  express_eligible?: boolean;
  express_rule?: string | null;
  included?: string[];
  excluded?: string[];
  formats?: string[];
  summary?: string | null;
  ratebook_version?: string;
  ratebook_approved?: boolean;
  created_at?: string;
};

export type AddOn = Database["public"]["Tables"]["add_ons"]["Row"] & {
  code?: string;
  label_bn?: string | null;
  extra_hours?: number;
  compatible_services?: string[];
  summary?: string | null;
  created_at?: string;
};

export interface ServiceVariant {
  id: string;
  serviceId: string;
  title: string;
  titleBn: string;
  scopeSummary: string;
  estimatedHours: number;
  hourMultiplier: number;
}

export interface CommercialBundle {
  id: string;
  title: string;
  titleBn: string;
  includedServiceIds: string[];
  estimatedHours: number;
  turnaroundDays: string;
  revisions: number;
  summary: string;
  deliverables: string[];
  baseBdt: number;
  baseUsd: number;
  pricingStatus?: PricingStatus;
}

export interface AIMicroKit {
  sku: string;
  title: string;
  titleBn: string;
  priceBdt: number;
  priceUsd: number;
  statusLabel: string;
  checkoutEnabled?: boolean;
  targetAudience: string;
  includedOutputs: string[];
  explicitExclusions: string[];
  samplePreview: string;
}

export interface ConceptWork {
  id: string;
  disciplineId: string;
  serviceId: string;
  title: string;
  categoryLabel: string;
  truthBadge: "CONCEPT WORK — NOT CLIENT WORK";
  deliverables: string[];
  formats: string[];
  visualTheme: string;
  accentHex: string;
  rationale: string;
  imageUrl?: string;
}

export interface ServiceWithAddOns extends Service {
  category?: ServiceCategory;
  addOns: AddOn[];
  variants?: ServiceVariant[];
}

export interface ServiceConfig {
  variantId?: string;
  format?: string;
  duration?: string;
  aspectRatio?: string;
  quantity?: number;
  rush?: boolean;
  express10Min?: boolean;
  sourceFilesReady?: boolean;
  singleMicroEditConfirmed?: boolean;
  notes?: string;
}

export interface PricingBreakdownItem {
  serviceId: string;
  title: string;
  basePriceBDT: number;
  basePriceUSD: number;
  quantity: number;
  rushApplied: boolean;
  rushFeeBDT: number;
  rushFeeUSD: number;
  selectedAddOns: {
    id: string;
    label: string;
    priceBDT: number;
    priceUSD: number;
    extraHours?: number;
  }[];
  lineTotalBDT: number;
  lineTotalUSD: number;
  pricingStatus: PricingStatus;
  scopedHours?: number;
  variantId?: string;
  expressEligible?: boolean;
}

export interface PricingSummary {
  items: PricingBreakdownItem[];
  subtotalBDT: number;
  subtotalUSD: number;
  rushSurchargeBDT: number;
  rushSurchargeUSD: number;
  addOnsTotalBDT: number;
  addOnsTotalUSD: number;
  promoDiscountBDT?: number;
  promoDiscountUSD?: number;
  promoActive?: boolean;
  promoLabel?: string;
  totalScopedHours?: number;
  hourlyRateBDT?: number;
  hourlyRateUSD?: number;
  ratebookVersion?: string;
  finalBDT: number;
  finalUSD: number;
  currency: Currency;
  quoteRequired: boolean;
  quoteReasons: string[];
}

export interface PackageBuilderState {
  selectedCategoryIds: string[];
  selectedServiceIds: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  bundleId?: string | null;
  brief: {
    brandName: string;
    objective: string;
    audience: string;
    platforms: string;
    referenceLinks?: string;
    deliverableFormat?: string;
    timelinePreference?: "standard" | "priority_window" | "express_10min";
    sourceFilesReady?: boolean;
    singleMicroEditConfirmed?: boolean;
  };
  currency: Currency;
}

export interface PackageDraft {
  id: string;
  userId?: string;
  savedAt: string;
  objective: {
    goal?: string;
    market?: string;
    industry?: string;
    brandName?: string;
    objective?: string;
    audience?: string;
    platforms?: string;
    category?: string;
    notes?: string;
    [key: string]: unknown;
  };
  services: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  pricing: PricingSummary;
  updatedAt?: string;
}


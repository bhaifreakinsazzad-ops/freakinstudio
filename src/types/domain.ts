export const USER_ROLES = [
  "customer",
  "customer_org_admin",
  "customer_team_member",
  "sales_rep",
  "designer",
  "video_editor",
  "project_manager",
  "finance_manager",
  "studio_admin",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLES: readonly UserRole[] = ["studio_admin", "super_admin"];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  organization_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type PricingStatus = "approved" | "quote_required";

export interface ServiceCategory {
  id: string;
  name: string;
  name_bn: string | null;
  sort_order: number;
}

export interface Service {
  id: string;
  category_id: string;
  title: string;
  title_bn: string | null;
  base_usd: number;
  base_bdt: number;
  days: number;
  revisions: number;
  pricing_status: PricingStatus;
  created_at: string;
  updated_at: string;
}

export interface AddOn {
  id: string;
  label: string;
  unit_price_usd: number;
  unit_price_bdt: number;
}

export interface ServiceWithAddOns extends Service {
  category?: ServiceCategory;
  addOns: AddOn[];
}

export type MarketType = "BD" | "US" | "Global";
export type Currency = "BDT" | "USD";

export interface PackageObjective {
  goal: string;
  market: MarketType;
  industry?: string;
  timeline?: string;
  notes?: string;
}

export interface ServiceConfig {
  quantity: number;
  format?: string;
  rush?: boolean;
  parameters?: Record<string, string | number | boolean>;
}

export interface PricingSummary {
  currency: Currency;
  subtotalBDT: number;
  subtotalUSD: number;
  rushSurchargeBDT: number;
  rushSurchargeUSD: number;
  addOnsTotalBDT: number;
  addOnsTotalUSD: number;
  finalBDT: number;
  finalUSD: number;
  quoteRequired: boolean;
  quoteReasons: string[];
}

export interface PackageDraft {
  id: string;
  userId?: string | null;
  savedAt: string;
  objective: PackageObjective;
  services: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  pricing: PricingSummary;
}

export type QuoteStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "issued"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn"
  | "converted";

export interface Quote {
  id: string;
  quote_ref: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  organization_id?: string | null;
  status: QuoteStatus;
  currency: Currency;
  amount_bdt: number;
  amount_usd: number;
  scope_snapshot: {
    objective?: PackageObjective;
    services: string[];
    serviceConfigs: Record<string, ServiceConfig>;
    selectedAddOns: Record<string, string[]>;
    pricing: PricingSummary;
  };
  notes?: string | null;
  admin_notes?: string | null;
  expires_at: string;
  issued_at?: string | null;
  accepted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "verifying"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type ProjectLifecycleStatus =
  | "awaiting_brief"
  | "brief_submitted"
  | "in_production"
  | "client_review"
  | "revision_requested"
  | "revision_in_progress"
  | "client_approved"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  order_ref: string;
  client_id: string;
  client_name?: string;
  quote_id?: string | null;
  currency: Currency;
  amount: number;
  amount_bdt: number;
  amount_usd: number;
  payment_status: PaymentStatus;
  project_status: ProjectLifecycleStatus;
  gateway?: string;
  transaction_ref?: string;
  scope_snapshot: {
    objective?: PackageObjective;
    services: string[];
    serviceConfigs: Record<string, ServiceConfig>;
    selectedAddOns: Record<string, string[]>;
    pricing: PricingSummary;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  gateway: "sslcommerz" | "stripe" | "bank_transfer" | "sandbox";
  transaction_ref: string;
  amount: number;
  currency: Currency;
  channel?: string | null;
  verified: boolean;
  verified_at?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  order_id: string;
  client_id: string;
  assigned_pm_id?: string | null;
  assigned_designer_id?: string | null;
  title: string;
  status: ProjectLifecycleStatus;
  revisions_used: number;
  max_revisions: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBrief {
  id: string;
  project_id: string;
  brand_name: string;
  objective: string;
  audience: string;
  platforms: string;
  answers: Record<string, string | number | boolean>;
  submitted: boolean;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  display_order: number;
  created_at: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  version_label: string;
  file_name: string;
  storage_path: string;
  file_type: "image" | "video" | "pdf" | "archive";
  file_size_bytes: number;
  is_approved: boolean;
  is_final_deliverable: boolean;
  uploaded_by?: string | null;
  created_at: string;
}

export interface AssetAnnotation {
  id: string;
  asset_id: string;
  coord_x_percent: number;
  coord_y_percent: number;
  feedback_text: string;
  created_by: string;
  author_name?: string;
  resolved: boolean;
  created_at: string;
}

export interface ApprovalRecord {
  id: string;
  project_id: string;
  asset_id?: string | null;
  approved_by: string;
  legal_terms_accepted: boolean;
  notes?: string | null;
  created_at: string;
}

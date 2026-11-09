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

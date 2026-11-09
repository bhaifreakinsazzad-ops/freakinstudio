/**
 * Hand-written to match supabase/migrations/*.sql exactly, since the
 * Supabase CLI's type generator isn't runnable on this machine (no Docker,
 * no working CLI binary for Windows — see docs/DATABASE_SCHEMA.md).
 *
 * Once a hosted project exists, prefer regenerating this file with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 * and reconciling any drift against this hand-written version.
 */
import type { UserRole, PricingStatus } from "./domain";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          organization_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          organization_id?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { id?: string; name: string; slug: string; created_by: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          org_role: "owner" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          profile_id: string;
          org_role?: "owner" | "member";
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [];
      };
      service_categories: {
        Row: { id: string; name: string; name_bn: string | null; sort_order: number };
        Insert: { id: string; name: string; name_bn?: string | null; sort_order: number };
        Update: Partial<Database["public"]["Tables"]["service_categories"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
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
        };
        Insert: {
          id: string;
          category_id: string;
          title: string;
          title_bn?: string | null;
          base_usd: number;
          base_bdt: number;
          days: number;
          revisions: number;
          pricing_status?: PricingStatus;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      add_ons: {
        Row: {
          id: string;
          label: string;
          unit_price_usd: number;
          unit_price_bdt: number;
        };
        Insert: {
          id?: string;
          label: string;
          unit_price_usd?: number;
          unit_price_bdt?: number;
        };
        Update: Partial<Database["public"]["Tables"]["add_ons"]["Insert"]>;
        Relationships: [];
      };
      service_add_ons: {
        Row: { service_id: string; add_on_id: string };
        Insert: { service_id: string; add_on_id: string };
        Update: Partial<Database["public"]["Tables"]["service_add_ons"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      pricing_status: PricingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

/**
 * Hand-written to match supabase/migrations/*.sql exactly.
 */
import type { UserRole, PricingStatus } from "./domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          created_at?: string;
          updated_at?: string;
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
      package_drafts: {
        Row: {
          id: string;
          user_id: string | null;
          objective: Json;
          services: string[];
          service_configs: Json;
          selected_add_ons: Json;
          pricing_summary: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          objective?: Json;
          services?: string[];
          service_configs?: Json;
          selected_add_ons?: Json;
          pricing_summary?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["package_drafts"]["Insert"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          quote_ref: string;
          client_id: string;
          organization_id: string | null;
          status: string;
          currency: string;
          amount_bdt: number;
          amount_usd: number;
          scope_snapshot: Json;
          notes: string | null;
          admin_notes: string | null;
          expires_at: string;
          issued_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quote_ref: string;
          client_id: string;
          organization_id?: string | null;
          status?: string;
          currency?: string;
          amount_bdt?: number;
          amount_usd?: number;
          scope_snapshot?: Json;
          notes?: string | null;
          admin_notes?: string | null;
          expires_at?: string;
          issued_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
        Relationships: [];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          service_id: string | null;
          title: string;
          quantity: number;
          rate_snapshot_bdt: number;
          rate_snapshot_usd: number;
          config: Json;
        };
        Insert: {
          id?: string;
          quote_id: string;
          service_id?: string | null;
          title: string;
          quantity?: number;
          rate_snapshot_bdt?: number;
          rate_snapshot_usd?: number;
          config?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["quote_items"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_ref: string;
          client_id: string;
          quote_id: string | null;
          currency: string;
          amount: number;
          amount_bdt: number;
          amount_usd: number;
          payment_status: string;
          project_status: string;
          scope_snapshot: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_ref: string;
          client_id: string;
          quote_id?: string | null;
          currency: string;
          amount: number;
          amount_bdt: number;
          amount_usd: number;
          payment_status?: string;
          project_status?: string;
          scope_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string | null;
          title: string;
          quantity: number;
          rate_bdt: number;
          rate_usd: number;
          config: Json;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_id?: string | null;
          title: string;
          quantity?: number;
          rate_bdt?: number;
          rate_usd?: number;
          config?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          gateway: string;
          transaction_ref: string;
          amount: number;
          currency: string;
          channel: string | null;
          verified: boolean;
          verified_at: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          gateway: string;
          transaction_ref: string;
          amount: number;
          currency: string;
          channel?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          payload?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          order_id: string;
          client_id: string;
          assigned_pm_id: string | null;
          assigned_designer_id: string | null;
          title: string;
          status: string;
          revisions_used: number;
          max_revisions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          client_id: string;
          assigned_pm_id?: string | null;
          assigned_designer_id?: string | null;
          title: string;
          status?: string;
          revisions_used?: number;
          max_revisions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_briefs: {
        Row: {
          id: string;
          project_id: string;
          brand_name: string;
          objective: string;
          audience: string;
          platforms: string;
          answers: Json;
          submitted: boolean;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          brand_name?: string;
          objective?: string;
          audience?: string;
          platforms?: string;
          answers?: Json;
          submitted?: boolean;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_briefs"]["Insert"]>;
        Relationships: [];
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "review" | "done";
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "review" | "done";
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_tasks"]["Insert"]>;
        Relationships: [];
      };
      project_assets: {
        Row: {
          id: string;
          project_id: string;
          version_label: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size_bytes: number;
          is_approved: boolean;
          is_final_deliverable: boolean;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_label?: string;
          file_name: string;
          storage_path: string;
          file_type?: string;
          file_size_bytes?: number;
          is_approved?: boolean;
          is_final_deliverable?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_assets"]["Insert"]>;
        Relationships: [];
      };
      asset_annotations: {
        Row: {
          id: string;
          asset_id: string;
          coord_x_percent: number;
          coord_y_percent: number;
          feedback_text: string;
          created_by: string;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          coord_x_percent: number;
          coord_y_percent: number;
          feedback_text: string;
          created_by: string;
          resolved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["asset_annotations"]["Insert"]>;
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          project_id: string;
          asset_id: string | null;
          approved_by: string;
          legal_terms_accepted: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          asset_id?: string | null;
          approved_by: string;
          legal_terms_accepted?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["approvals"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          event_type: string;
          details: string;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          details: string;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      delivery_events: {
        Row: {
          id: string;
          project_id: string;
          downloaded_by: string | null;
          asset_ids: string[];
          manifest: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          downloaded_by?: string | null;
          asset_ids: string[];
          manifest?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["delivery_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_quotation_request: {
        Args: {
          p_client_id: string;
          p_scope: Json;
          p_items: Json;
          p_currency: string;
          p_estimated_bdt?: number;
          p_estimated_usd?: number;
          p_terms_accepted?: boolean;
        };
        Returns: {
          ok: boolean;
          quote_id?: string;
          quote_ref?: string;
          error?: string;
        };
      };
      create_pending_order: {
        Args: {
          p_client_id: string;
          p_quote_id: string | null;
          p_order_ref: string;
          p_currency: string;
          p_scope: Json;
          p_items: Json;
          p_is_test?: boolean;
          p_amount?: number;
          p_amount_bdt?: number;
          p_amount_usd?: number;
        };
        Returns: {
          ok: boolean;
          order_id?: string;
          order_ref?: string;
          amount?: number;
          currency?: string;
          error?: string;
        };
      };
      settle_verified_payment: {
        Args: {
          p_order_ref: string;
          p_gateway: string;
          p_transaction_ref: string;
          p_amount: number;
          p_currency: string;
          p_channel?: string;
          p_payload?: Json;
        };
        Returns: {
          ok: boolean;
          order_id?: string;
          project_id?: string;
          payment_id?: string;
          already_settled?: boolean;
          error?: string;
        };
      };
      submit_project_brief: {
        Args: {
          p_project_id: string;
          p_answers: Json;
          p_client_id: string;
        };
        Returns: {
          ok: boolean;
          project_id?: string;
          error?: string;
        };
      };
      approve_project_asset: {
        Args: {
          p_project_id: string;
          p_asset_id: string;
          p_client_id: string;
          p_legal_accepted?: boolean;
          p_notes?: string;
        };
        Returns: {
          ok: boolean;
          approval_id?: string;
          project_status?: string;
          error?: string;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      pricing_status: PricingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

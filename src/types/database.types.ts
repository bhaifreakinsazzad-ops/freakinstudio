/**
 * Hand-written to match supabase/migrations/001..014.sql strictly.
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
        Row: {
          id: string;
          code: string | null;
          name: string;
          name_bn: string | null;
          description: string | null;
          sort_order: number;
          active?: boolean;
        };
        Insert: {
          id: string;
          code?: string | null;
          name: string;
          name_bn?: string | null;
          description?: string | null;
          sort_order: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["service_categories"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          code: string | null;
          category_id: string;
          title: string;
          title_bn: string | null;
          base_usd: number;
          base_bdt: number;
          estimated_hours: number;
          days: number;
          revisions: number;
          pricing_status: PricingStatus;
          express_eligible: boolean;
          express_rule: string | null;
          summary: string | null;
          included: Json;
          excluded: Json;
          formats: Json;
          ratebook_version: string;
          ratebook_approved: boolean;
          active?: boolean;
          price_approved_at?: string | null;
          price_approved_by?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          code?: string | null;
          category_id: string;
          title: string;
          title_bn?: string | null;
          base_usd: number;
          base_bdt: number;
          estimated_hours?: number;
          days: number;
          revisions: number;
          pricing_status?: PricingStatus;
          express_eligible?: boolean;
          express_rule?: string | null;
          summary?: string | null;
          included?: Json;
          excluded?: Json;
          formats?: Json;
          ratebook_version?: string;
          ratebook_approved?: boolean;
          active?: boolean;
          price_approved_at?: string | null;
          price_approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      service_variants: {
        Row: {
          id: string;
          service_id: string;
          title: string;
          title_bn: string | null;
          scope_summary: string;
          estimated_hours: number;
          hour_multiplier: number;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          service_id: string;
          title: string;
          title_bn?: string | null;
          scope_summary: string;
          estimated_hours: number;
          hour_multiplier: number;
          sort_order?: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["service_variants"]["Insert"]>;
        Relationships: [];
      };
      commercial_bundles: {
        Row: {
          id: string;
          title: string;
          title_bn: string | null;
          included_service_ids: string[];
          estimated_hours: number;
          turnaround_days: string;
          revisions: number;
          summary: string;
          deliverables: Json;
          base_bdt: number;
          base_usd: number;
          pricing_status: PricingStatus;
          ratebook_version: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          title_bn?: string | null;
          included_service_ids: string[];
          estimated_hours: number;
          turnaround_days: string;
          revisions?: number;
          summary: string;
          deliverables?: Json;
          base_bdt?: number;
          base_usd?: number;
          pricing_status?: PricingStatus;
          ratebook_version?: string;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["commercial_bundles"]["Insert"]>;
        Relationships: [];
      };
      add_ons: {
        Row: {
          id: string;
          code: string | null;
          label: string;
          label_bn: string | null;
          unit_price_usd: number;
          unit_price_bdt: number;
          extra_hours: number;
          summary: string | null;
          active?: boolean;
        };
        Insert: {
          id?: string;
          code?: string | null;
          label: string;
          label_bn?: string | null;
          unit_price_usd?: number;
          unit_price_bdt?: number;
          extra_hours?: number;
          summary?: string | null;
          active?: boolean;
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
      legacy_service_map: {
        Row: {
          legacy_service_id: string;
          canonical_service_id: string;
          disposition: "mapped" | "retired_from_public_storefront";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          legacy_service_id: string;
          canonical_service_id: string;
          disposition: "mapped" | "retired_from_public_storefront";
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["legacy_service_map"]["Insert"]>;
        Relationships: [];
      };
      package_drafts: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
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
          pricing_mode: "priced" | "manual";
          version: number;
          currency: string;
          amount_bdt: number;
          amount_usd: number;
          scope_snapshot: Json;
          license_terms: Json | null;
          revisions_included: number | null;
          notes: string | null;
          admin_notes: string | null;
          ratebook_version: string;
          expires_at: string | null;
          issued_at: string | null;
          issued_by: string | null;
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
          pricing_mode?: "priced" | "manual";
          version?: number;
          currency?: string;
          amount_bdt?: number;
          amount_usd?: number;
          scope_snapshot?: Json;
          license_terms?: Json | null;
          revisions_included?: number | null;
          notes?: string | null;
          admin_notes?: string | null;
          ratebook_version?: string;
          expires_at?: string | null;
          issued_at?: string | null;
          issued_by?: string | null;
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
          unit_rate_bdt: number;
          unit_rate_usd: number;
          add_ons_total_bdt: number;
          add_ons_total_usd: number;
          rush_surcharge_bdt: number;
          rush_surcharge_usd: number;
          line_total_bdt: number;
          line_total_usd: number;
          price_approved: boolean;
          config: Json;
        };
        Insert: {
          id?: string;
          quote_id: string;
          service_id?: string | null;
          title: string;
          quantity?: number;
          unit_rate_bdt?: number;
          unit_rate_usd?: number;
          add_ons_total_bdt?: number;
          add_ons_total_usd?: number;
          rush_surcharge_bdt?: number;
          rush_surcharge_usd?: number;
          line_total_bdt?: number;
          line_total_usd?: number;
          price_approved?: boolean;
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
          organization_id: string | null;
          quote_id: string | null;
          currency: string;
          amount: number;
          amount_bdt: number;
          amount_usd: number;
          payment_status: string;
          gateway: string | null;
          gateway_tran_id: string | null;
          is_test: boolean;
          revisions_included: number;
          license_terms: Json | null;
          scope_snapshot: Json;
          ratebook_version: string;
          promo_discount_bdt: number;
          promo_discount_usd: number;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_ref: string;
          client_id: string;
          organization_id?: string | null;
          quote_id?: string | null;
          currency: string;
          amount: number;
          amount_bdt: number;
          amount_usd: number;
          payment_status?: string;
          gateway?: string | null;
          gateway_tran_id?: string | null;
          is_test?: boolean;
          revisions_included?: number;
          license_terms?: Json | null;
          scope_snapshot?: Json;
          ratebook_version?: string;
          promo_discount_bdt?: number;
          promo_discount_usd?: number;
          paid_at?: string | null;
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
          unit_rate_bdt: number;
          unit_rate_usd: number;
          line_total_bdt: number;
          line_total_usd: number;
          config: Json;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_id?: string | null;
          title: string;
          quantity?: number;
          unit_rate_bdt?: number;
          unit_rate_usd?: number;
          line_total_bdt?: number;
          line_total_usd?: number;
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
          status: string;
          channel: string | null;
          provider_ref: string | null;
          verified: boolean;
          verified_at: string | null;
          is_test: boolean;
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
          status?: string;
          channel?: string | null;
          provider_ref?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          is_test?: boolean;
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
          organization_id: string | null;
          quote_id: string | null;
          assigned_pm_id: string | null;
          assigned_designer_id: string | null;
          assigned_to: string | null;
          title: string;
          status: string;
          revisions_used: number;
          max_revisions: number;
          deadline_at: string | null;
          express_slot_confirmed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          client_id: string;
          organization_id?: string | null;
          quote_id?: string | null;
          assigned_pm_id?: string | null;
          assigned_designer_id?: string | null;
          assigned_to?: string | null;
          title: string;
          status?: string;
          revisions_used?: number;
          max_revisions?: number;
          deadline_at?: string | null;
          express_slot_confirmed?: boolean;
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
          revision_round: number;
          file_name: string;
          storage_path: string;
          content_type: string;
          file_size_bytes: number;
          sha256: string;
          is_source_file: boolean;
          is_approved: boolean;
          approved_at: string | null;
          approved_by: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_label?: string;
          revision_round?: number;
          file_name: string;
          storage_path: string;
          content_type?: string;
          file_size_bytes: number;
          sha256: string;
          is_source_file?: boolean;
          is_approved?: boolean;
          approved_at?: string | null;
          approved_by?: string | null;
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
          asset_id: string;
          asset_sha256: string;
          approved_by: string;
          terms_accepted: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          asset_id: string;
          asset_sha256: string;
          approved_by: string;
          terms_accepted: boolean;
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
      inquiries: {
        Row: {
          id: string;
          reference_id: string;
          full_name: string;
          work_email: string;
          organization: string | null;
          timeline: string;
          discipline: string;
          brief: string;
          status: "new" | "reviewing" | "quoted" | "converted" | "archived";
          assigned_to: string | null;
          source_ip_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_id: string;
          full_name: string;
          work_email: string;
          organization?: string | null;
          timeline: string;
          discipline: string;
          brief: string;
          status?: "new" | "reviewing" | "quoted" | "converted" | "archived";
          assigned_to?: string | null;
          source_ip_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
      project_events: {
        Row: {
          id: string;
          project_id: string;
          actor_kind: "human_expert" | "si_assistant" | "system" | "client";
          actor_id: string | null;
          event_type: string;
          state_before: string | null;
          state_after: string | null;
          artifact_id: string | null;
          si_status:
            | "suggested"
            | "scheduled"
            | "running"
            | "completed"
            | "human_approved"
            | "rejected"
            | null;
          visibility: "client" | "studio_internal";
          summary: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          actor_kind: "human_expert" | "si_assistant" | "system" | "client";
          actor_id?: string | null;
          event_type: string;
          state_before?: string | null;
          state_after?: string | null;
          artifact_id?: string | null;
          si_status?:
            | "suggested"
            | "scheduled"
            | "running"
            | "completed"
            | "human_approved"
            | "rejected"
            | null;
          visibility?: "client" | "studio_internal";
          summary: string;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["project_events"]["Insert"]>;
        Relationships: [];
      };
      ai_gateway_config: {
        Row: {
          id: string;
          kill_switch_active: boolean;
          daily_budget_cap_bdt: number;
          guest_daily_quota: number;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kill_switch_active?: boolean;
          daily_budget_cap_bdt?: number;
          guest_daily_quota?: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_gateway_config"]["Insert"]>;
        Relationships: [];
      };
      ai_usage_events: {
        Row: {
          id: string;
          request_id: string;
          session_id: string;
          user_id: string | null;
          assistant_id: string;
          provider: "puter_sponsored" | "demo_template" | "blocked";
          model: string;
          status:
            | "completed"
            | "quota_blocked"
            | "budget_blocked"
            | "kill_switch_blocked"
            | "failed";
          input_chars: number;
          output_chars: number;
          estimated_cost_bdt: number;
          latency_ms: number;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          session_id: string;
          user_id?: string | null;
          assistant_id: string;
          provider: "puter_sponsored" | "demo_template" | "blocked";
          model: string;
          status:
            | "completed"
            | "quota_blocked"
            | "budget_blocked"
            | "kill_switch_blocked"
            | "failed";
          input_chars?: number;
          output_chars?: number;
          estimated_cost_bdt?: number;
          latency_ms?: number;
          ip_hash?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_usage_events"]["Insert"]>;
        Relationships: [];
      };
      credit_ledger: {
        Row: {
          id: string;
          user_id: string;
          entry_type:
            | "purchase_mint"
            | "reservation_hold"
            | "settlement_commit"
            | "reservation_release"
            | "refund"
            | "promo_grant";
          delta_credits: number;
          reference_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_type:
            | "purchase_mint"
            | "reservation_hold"
            | "settlement_commit"
            | "reservation_release"
            | "refund"
            | "promo_grant";
          delta_credits: number;
          reference_id: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["credit_ledger"]["Insert"]>;
        Relationships: [];
      };
      microkit_orders: {
        Row: {
          id: string;
          order_ref: string;
          user_id: string;
          sku: "SKU-SHOP-49" | "SKU-CAMP-99" | "SKU-BRAND-199";
          currency: "BDT" | "USD";
          amount: number;
          payment_status: "pending" | "paid" | "fulfilled" | "failed" | "refunded";
          gateway: string | null;
          prompt_input: string;
          artifact_payload: Json | null;
          fulfilled_at: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_ref: string;
          user_id: string;
          sku: "SKU-SHOP-49" | "SKU-CAMP-99" | "SKU-BRAND-199";
          currency?: "BDT" | "USD";
          amount: number;
          payment_status?: "pending" | "paid" | "fulfilled" | "failed" | "refunded";
          gateway?: string | null;
          prompt_input: string;
          artifact_payload?: Json | null;
          fulfilled_at?: string | null;
          refunded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["microkit_orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_quotation_request: {
        Args: {
          p_client_id: string;
          p_currency: string;
          p_scope: Json;
          p_items: Json;
          p_terms_accepted?: boolean;
          p_notes?: string | null;
        };
        Returns: Json;
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
          p_gateway?: string;
        };
        Returns: Json;
      };
      settle_verified_payment: {
        Args: {
          p_order_ref: string;
          p_gateway: string;
          p_transaction_ref: string;
          p_amount: number;
          p_currency: string;
          p_channel?: string | null;
          p_payload?: Json;
        };
        Returns: Json;
      };
      submit_project_brief: {
        Args: {
          p_project_id: string;
          p_brand_name: string;
          p_objective: string;
          p_audience: string;
          p_platforms: string;
          p_answers?: Json;
        };
        Returns: Json;
      };
      approve_project_asset: {
        Args: {
          p_project_id: string;
          p_asset_id: string;
          p_terms_accepted: boolean;
          p_notes?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      pricing_status: PricingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

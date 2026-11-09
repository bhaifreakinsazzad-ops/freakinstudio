import type { Database as GeneratedDatabase, Json } from "./database.types";

export * from "./database.types";

export interface ExtendedDatabase extends GeneratedDatabase {
  public: GeneratedDatabase["public"] & {
    Functions: {
      create_quotation_request: {
        Args: {
          p_client_id: string;
          p_currency: string;
          p_amount_bdt: number;
          p_amount_usd: number;
          p_scope: Json;
          p_items: Json;
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
          p_amount: number;
          p_amount_bdt: number;
          p_amount_usd: number;
          p_scope: Json;
          p_items: Json;
          p_is_test?: boolean;
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
  };
}

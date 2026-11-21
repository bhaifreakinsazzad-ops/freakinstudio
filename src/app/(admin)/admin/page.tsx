import { createClient } from "@/lib/supabase/server";
import { getCatalogServices } from "@/lib/catalog";
import { AdminConsoleClient } from "./admin-console-client";

export const instant = false;

export interface AdminProjectRow {
  id: string;
  title: string;
  client_id: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  created_at: string;
}

export interface AdminQuoteRow {
  id: string;
  client_id: string;
  status: string;
  currency: "BDT" | "USD";
  amount_bdt: number | null;
  amount_usd: number | null;
  admin_notes: string | null;
  created_at: string;
  scope_snapshot?: {
    serviceIds?: string[];
    brief?: {
      brandName?: string;
      objective?: string;
      audience?: string;
      platforms?: string;
    };
  };
}

export interface AdminOrderRow {
  id: string;
  client_id: string;
  status: string;
  currency: "BDT" | "USD";
  total_bdt: number;
  total_usd: number;
  payment_gateway: string | null;
  gateway_transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface AdminAuditLogRow {
  id: string;
  event_type: string;
  details: string | null;
  actor_id: string | null;
  created_at: string;
}

/**
 * Gate 0 Truthful Admin Console:
 * - Zero fabricated paid orders, quotes, or projects in default live database state.
 * - If Supabase returns 0 rows, passes honest empty arrays [] to AdminConsoleClient.
 * - Interactive DEMO DATA is strictly isolated inside the labeled "DEMO DATA • Studio Pulse" tab.
 */
export default async function AdminPage() {
  const services = await getCatalogServices();

  let projects: AdminProjectRow[] = [];
  let quotes: AdminQuoteRow[] = [];
  let orders: AdminOrderRow[] = [];
  let auditLogs: AdminAuditLogRow[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      const [
        { data: prjRows },
        { data: quoteRows },
        { data: orderRows },
        { data: logRows },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, title, client_id, status, revisions_used, max_revisions, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("quotes")
          .select(
            "id, client_id, status, currency, amount_bdt, amount_usd, admin_notes, created_at, scope_snapshot"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("audit_logs")
          .select("id, event_type, details, actor_id, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
      ]);

      if (prjRows) projects = prjRows as unknown as AdminProjectRow[];
      if (quoteRows) quotes = quoteRows as unknown as AdminQuoteRow[];
      if (orderRows) orders = orderRows as unknown as AdminOrderRow[];
      if (logRows) auditLogs = logRows as unknown as AdminAuditLogRow[];
    } catch {
      // Honest empty state when DB is unconfigured or empty
    }
  }

  return (
    <AdminConsoleClient
      initialProjects={projects}
      initialQuotes={quotes}
      initialOrders={orders}
      initialAuditLogs={auditLogs}
      services={services}
    />
  );
}

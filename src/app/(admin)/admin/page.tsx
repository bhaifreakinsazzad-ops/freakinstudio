import { createClient } from "@/lib/supabase/server";
import { getCatalogServices } from "@/lib/catalog";
import { AdminConsoleClient } from "./admin-console-client";
import type { PricingStatus, UserRole } from "@/types/domain";

export const instant = false;

export interface AdminProjectRow {
  id: string;
  order_id: string;
  title: string;
  client_id: string;
  assigned_pm_id: string | null;
  assigned_designer_id: string | null;
  assigned_to: string | null;
  status: string;
  revisions_used: number;
  max_revisions: number;
  express_slot_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminQuoteRow {
  id: string;
  quote_ref: string;
  client_id: string;
  status: string;
  pricing_mode: "priced" | "manual";
  currency: "BDT" | "USD";
  amount_bdt: number;
  amount_usd: number;
  admin_notes: string | null;
  ratebook_version: string;
  expires_at: string | null;
  created_at: string;
  scope_snapshot?: {
    serviceIds?: string[];
    bundleId?: string | null;
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
  order_ref: string;
  client_id: string;
  quote_id: string | null;
  payment_status: string;
  currency: "BDT" | "USD";
  amount: number;
  amount_bdt: number;
  amount_usd: number;
  gateway: string | null;
  gateway_tran_id: string | null;
  is_test: boolean;
  paid_at: string | null;
  created_at: string;
}

export interface AdminInquiryRow {
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
  created_at: string;
}

export interface AdminProjectEventRow {
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
  created_at: string;
}

export interface AdminAiGatewayConfig {
  id: string;
  kill_switch_active: boolean;
  daily_budget_cap_bdt: number;
  guest_daily_quota: number;
  updated_at: string | null;
}

export interface AdminAiUsageRow {
  id: string;
  request_id: string;
  session_id: string;
  assistant_id: string;
  provider: "puter_sponsored" | "demo_template" | "blocked";
  model: string;
  status: string;
  input_chars: number;
  output_chars: number;
  estimated_cost_bdt: number;
  latency_ms: number;
  created_at: string;
}

export interface AdminStaffCandidate {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface AdminAuditLogRow {
  id: string;
  event_type: string;
  details: string | null;
  actor_id: string | null;
  created_at: string;
}

export interface AdminCatalogServiceRow {
  id: string;
  category_id: string;
  title: string;
  estimated_hours: number;
  base_bdt: number;
  base_usd: number;
  pricing_status: PricingStatus;
  ratebook_approved: boolean;
  ratebook_version: string;
}

export default async function AdminPage() {
  const services = await getCatalogServices();

  let projects: AdminProjectRow[] = [];
  let quotes: AdminQuoteRow[] = [];
  let orders: AdminOrderRow[] = [];
  let inquiries: AdminInquiryRow[] = [];
  let projectEvents: AdminProjectEventRow[] = [];
  let aiConfig: AdminAiGatewayConfig = {
    id: "default",
    kill_switch_active:
      process.env.STUDIO_AI_KILL_SWITCH === "true" ||
      process.env.STUDIO_AI_KILL_SWITCH === "1",
    daily_budget_cap_bdt: 500,
    guest_daily_quota: 3,
    updated_at: null,
  };
  let aiUsageEvents: AdminAiUsageRow[] = [];
  let aiSpendTodayBdt = 0;
  let staffCandidates: AdminStaffCandidate[] = [];
  let auditLogs: AdminAuditLogRow[] = [];
  let dbLoadError: string | null = null;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    dbLoadError =
      "Supabase environment variables are not configured in this runtime. Live operational queues are unavailable.";
  } else {
    try {
      const supabase = await createClient();
      const todayIsoStart = new Date();
      todayIsoStart.setUTCHours(0, 0, 0, 0);

      const [
        prjRes,
        quoteRes,
        orderRes,
        inqRes,
        evtRes,
        aiCfgRes,
        aiUsageRes,
        staffRes,
        logRes,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, order_id, title, client_id, assigned_pm_id, assigned_designer_id, assigned_to, status, revisions_used, max_revisions, express_slot_confirmed, created_at, updated_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("quotes")
          .select(
            "id, quote_ref, client_id, status, pricing_mode, currency, amount_bdt, amount_usd, admin_notes, ratebook_version, expires_at, created_at, scope_snapshot"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("orders")
          .select(
            "id, order_ref, client_id, quote_id, payment_status, currency, amount, amount_bdt, amount_usd, gateway, gateway_tran_id, is_test, paid_at, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("inquiries")
          .select(
            "id, reference_id, full_name, work_email, organization, timeline, discipline, brief, status, assigned_to, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("project_events")
          .select(
            "id, project_id, actor_kind, actor_id, event_type, state_before, state_after, artifact_id, si_status, visibility, summary, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("ai_gateway_config")
          .select(
            "id, kill_switch_active, daily_budget_cap_bdt, guest_daily_quota, updated_at"
          )
          .eq("id", "default")
          .maybeSingle(),
        supabase
          .from("ai_usage_events")
          .select(
            "id, request_id, session_id, assistant_id, provider, model, status, input_chars, output_chars, estimated_cost_bdt, latency_ms, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(40),
        supabase
          .from("profiles")
          .select("id, email, full_name, role")
          .in("role", [
            "studio_admin",
            "super_admin",
            "project_manager",
            "designer",
            "video_editor",
          ])
          .limit(50),
        supabase
          .from("audit_logs")
          .select("id, event_type, details, actor_id, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
      ]);

      const queryErrors = [
        prjRes.error?.message,
        quoteRes.error?.message,
        orderRes.error?.message,
        inqRes.error?.message,
        evtRes.error?.message,
        logRes.error?.message,
      ].filter(Boolean);

      if (queryErrors.length > 0) {
        dbLoadError = `Database query issue: ${queryErrors[0]}`;
      }

      if (prjRes.data) projects = prjRes.data as unknown as AdminProjectRow[];
      if (quoteRes.data) quotes = quoteRes.data as unknown as AdminQuoteRow[];
      if (orderRes.data) orders = orderRes.data as unknown as AdminOrderRow[];
      if (inqRes.data) inquiries = inqRes.data as unknown as AdminInquiryRow[];
      if (evtRes.data)
        projectEvents = evtRes.data as unknown as AdminProjectEventRow[];
      if (aiCfgRes.data) {
        aiConfig = aiCfgRes.data as unknown as AdminAiGatewayConfig;
      }
      if (aiUsageRes.data) {
        aiUsageEvents = aiUsageRes.data as unknown as AdminAiUsageRow[];
        aiSpendTodayBdt = aiUsageEvents
          .filter((row) => row.created_at >= todayIsoStart.toISOString())
          .reduce((acc, row) => acc + Number(row.estimated_cost_bdt || 0), 0);
      }
      if (staffRes.data)
        staffCandidates = staffRes.data as unknown as AdminStaffCandidate[];
      if (logRes.data) auditLogs = logRes.data as unknown as AdminAuditLogRow[];
    } catch (err: unknown) {
      dbLoadError =
        err instanceof Error
          ? err.message
          : "Failed to load live Studio Pulse records from Supabase.";
    }
  }

  const catalogRows: AdminCatalogServiceRow[] = services.map((s) => ({
    id: s.id,
    category_id: s.category_id,
    title: s.title,
    estimated_hours: Number(s.estimated_hours || 4),
    base_bdt: Number(s.base_bdt),
    base_usd: Number(s.base_usd),
    pricing_status: s.pricing_status as PricingStatus,
    ratebook_approved: Boolean(s.ratebook_approved),
    ratebook_version: s.ratebook_version || "v2.0-pending-ratebook-v8_1",
  }));

  return (
    <AdminConsoleClient
      initialProjects={projects}
      initialQuotes={quotes}
      initialOrders={orders}
      initialInquiries={inquiries}
      initialProjectEvents={projectEvents}
      initialAiConfig={aiConfig}
      initialAiUsage={aiUsageEvents}
      aiSpendTodayBdt={aiSpendTodayBdt}
      staffCandidates={staffCandidates}
      initialAuditLogs={auditLogs}
      services={catalogRows}
      dbLoadError={dbLoadError}
    />
  );
}

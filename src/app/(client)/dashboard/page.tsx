import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "My Projects — Freakin's Studio",
  description:
    "Track real creative production projects, progress, briefs, formal quotes, and review tasks.",
};

export const instant = false;

export interface ClientProjectSummary {
  id: string;
  title: string;
  status: string;
  revisions_used: number;
  max_revisions: number;
  created_at: string;
}

export interface ClientOrderSummary {
  id: string;
  order_ref: string;
  status: string;
  payment_gateway: string | null;
  currency: string;
  total_bdt: number;
  total_usd: number;
  created_at: string;
}

export interface ClientQuoteSummary {
  id: string;
  quote_ref: string;
  status: string;
  currency: string;
  amount_bdt: number | null;
  amount_usd: number | null;
  admin_notes: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  let projects: ClientProjectSummary[] = [];
  let quotes: ClientQuoteSummary[] = [];
  let orders: ClientOrderSummary[] = [];
  let dbLoadError: string | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();

      const [
        { data: prjRows, error: prjErr },
        { data: quoteRows, error: quoteErr },
        { data: orderRows, error: orderErr },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, status, revisions_used, max_revisions, created_at")
          .eq("client_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("quotes")
          .select(
            "id, quote_ref, status, currency, amount_bdt, amount_usd, admin_notes, created_at"
          )
          .eq("client_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, order_ref, payment_status, gateway, currency, amount, amount_bdt, amount_usd, created_at"
          )
          .eq("client_id", profile.id)
          .order("created_at", { ascending: false }),
      ]);

      if (prjErr || quoteErr || orderErr) {
        dbLoadError =
          prjErr?.message ||
          quoteErr?.message ||
          orderErr?.message ||
          "Database query returned an error.";
      }

      projects = (prjRows || []).map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        revisions_used: p.revisions_used ?? 0,
        max_revisions: p.max_revisions ?? 2,
        created_at: p.created_at,
      }));

      quotes = (quoteRows || []).map((q) => ({
        id: q.id,
        quote_ref: q.quote_ref || q.id.slice(0, 12),
        status: q.status,
        currency: q.currency || "BDT",
        amount_bdt: q.amount_bdt ?? null,
        amount_usd: q.amount_usd ?? null,
        admin_notes: q.admin_notes ?? null,
        created_at: q.created_at,
      }));

      orders = (orderRows || []).map((o) => ({
        id: o.id,
        order_ref: o.order_ref || o.id.slice(0, 12),
        status: o.payment_status || "pending",
        payment_gateway: o.gateway ?? null,
        currency: o.currency || "BDT",
        total_bdt: Number(o.amount_bdt ?? (o.currency === "BDT" ? o.amount : 0) ?? 0),
        total_usd: Number(o.amount_usd ?? (o.currency === "USD" ? o.amount : 0) ?? 0),
        created_at: o.created_at,
      }));
    } catch (err: unknown) {
      dbLoadError =
        err instanceof Error ? err.message : "Database connection unavailable.";
    }
  } else {
    dbLoadError = "Supabase environment is not configured for live persistence.";
  }

  return (
    <DashboardClient
      userEmail={profile.email}
      projects={projects}
      quotes={quotes}
      orders={orders}
      dbLoadError={dbLoadError}
    />
  );
}

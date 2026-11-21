import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Projects — Freakin's Studio",
  description: "Track real creative production projects, progress, briefs and review tasks.",
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
  status: string;
  payment_gateway: string | null;
  currency: string;
  total_bdt: number;
  total_usd: number;
  created_at: string;
}

export interface ClientQuoteSummary {
  id: string;
  status: string;
  amount_bdt: number | null;
  amount_usd: number | null;
  admin_notes: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  let projects: ClientProjectSummary[] = [];
  let quotes: ClientQuoteSummary[] = [];
  let orders: ClientOrderSummary[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();

      const [{ data: prjRows }, { data: quoteRows }, { data: orderRows }] =
        await Promise.all([
          supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("quotes")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      projects = ((prjRows as unknown as ClientProjectSummary[]) || []).map(
        (p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          revisions_used: p.revisions_used ?? 0,
          max_revisions: p.max_revisions ?? 2,
          created_at: p.created_at,
        })
      );

      quotes = ((quoteRows as unknown as ClientQuoteSummary[]) || []).map(
        (q) => ({
          id: q.id,
          status: q.status,
          amount_bdt: q.amount_bdt ?? null,
          amount_usd: q.amount_usd ?? null,
          admin_notes: q.admin_notes ?? null,
          created_at: q.created_at,
        })
      );

      orders = (
        (orderRows as unknown as Record<string, unknown>[]) || []
      ).map((o) => ({
        id: String(o.id),
        status: String(o.status || o.payment_status || "pending"),
        payment_gateway: (o.payment_gateway as string | null) ?? null,
        currency: String(o.currency || "BDT"),
        total_bdt: Number(o.total_bdt || o.amount || 0),
        total_usd: Number(o.total_usd || o.amount || 0),
        created_at: String(o.created_at || new Date().toISOString()),
      }));
    } catch {
      // Honest empty state
    }
  }

  return (
    <DashboardClient
      userEmail={profile?.email || "Client"}
      projects={projects}
      quotes={quotes}
      orders={orders}
    />
  );
}


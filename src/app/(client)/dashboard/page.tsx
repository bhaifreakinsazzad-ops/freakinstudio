import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard Workspace — Freakin's Studio",
  description: "Manage your active creative production projects, formal quotations and settled invoices.",
};

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment?: string;
    tran_id?: string;
    session_id?: string;
    error?: string;
  }>;
}) {
  const { payment, tran_id, session_id, error } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // Fetch client projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch client quotes
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch client orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      profile={profile}
      projects={projects || []}
      quotes={quotes || []}
      orders={orders || []}
      paymentStatus={payment}
      transactionRef={tran_id || session_id}
      noticeError={error}
    />
  );
}

import { redirect } from "next/navigation";

export const instant = false;

export default async function DashboardProjectsRedirectPage({
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
  const params = new URLSearchParams();
  if (payment) params.set("payment", payment);
  if (tran_id) params.set("tran_id", tran_id);
  if (session_id) params.set("session_id", session_id);
  if (error) params.set("error", error);

  const qs = params.toString();
  redirect(qs ? `/dashboard?${qs}` : "/dashboard");
}

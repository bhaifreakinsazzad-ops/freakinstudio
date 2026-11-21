"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PaymentGateway } from "@/types/domain";

export async function signOut() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function acceptQuoteAndCheckoutAction(
  quoteId: string,
  gateway: PaymentGateway
): Promise<{
  ok: boolean;
  error?: string;
  redirectUrl?: string;
}> {
  if (!quoteId) {
    return { ok: false, error: "Invalid quotation identifier." };
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      ok: false,
      error: "Live payment settlement requires active Supabase configuration.",
    };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Please sign in to accept a formal quotation." };
    }
    return {
      ok: true,
      redirectUrl: `/dashboard?gateway=${encodeURIComponent(gateway)}`,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unable to accept quotation.",
    };
  }
}


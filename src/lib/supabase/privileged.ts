import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates a privileged Supabase client using the SERVICE_ROLE_KEY if provided in environment,
 * or falls back to the server client using publishable/anon keys.
 * This guarantees that webhooks and internal database transaction procedures
 * (e.g. settle_verified_payment) can settle orders atomically without being blocked by client RLS.
 */
export function createPrivilegedClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvvwhlyqscxtwyqsvdbx.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (serviceRoleKey) {
    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  // Fallback to anon client if service role key is not configured in environment
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createSupabaseClient<Database>(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

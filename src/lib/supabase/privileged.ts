import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates a privileged Supabase client strictly using the server-side
 * SUPABASE_SERVICE_ROLE_KEY.
 *
 * CRITICAL SECURITY FIX (Directive 13.0 §5):
 * Under NO circumstances does this function fall back to the publishable/anon key.
 * If the service-role key is unconfigured in the server runtime, it fails closed
 * by throwing an explicit ConfigurationError.
 */
export function createPrivilegedClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rvvwhlyqscxtwyqsvdbx.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "CONFIGURATION_ERROR: SUPABASE_SERVICE_ROLE_KEY is required for privileged server-side operations and financial settlements. Falling back to anonymous or public context is strictly blocked."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { isValidHttpUrl } from "@/lib/url";

/**
 * Creates a privileged Supabase client strictly using the server-side
 * SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
 * Fails closed if either environment secret/endpoint is unconfigured.
 */
export function createPrivilegedClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!isValidHttpUrl(supabaseUrl) || !serviceRoleKey) {
    throw new Error(
      "CONFIGURATION_ERROR: Valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for privileged server-side operations. Falling back to anonymous or hardcoded context is blocked."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl.trim(), serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function tryPrivilegedClient() {
  try {
    return createPrivilegedClient();
  } catch {
    return null;
  }
}

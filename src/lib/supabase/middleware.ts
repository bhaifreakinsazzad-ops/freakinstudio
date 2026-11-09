import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/** Refreshes the Supabase session cookie on every request. Must be called
 * from src/middleware.ts and the returned response must be returned
 * unmodified (or with the same cookies copied over) — see Supabase's SSR
 * App Router guide for why: Server Components can't write cookies, so this
 * is the only place the session can actually be refreshed. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: this call must not be removed. It refreshes the auth token
  // and writes it back via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// This whole route group reads cookies() (via Supabase auth) on every
// request to decide who's signed in — it can never be statically
// prerendered, so opt it out of Next 16's cacheComponents prerender gate
// rather than fighting it with Suspense boundaries that would just stream
// the exact same per-request check anyway.
export const instant = false;

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-brand-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-mono text-sm font-bold tracking-wide text-brand-light">
            FREAKIN&apos;S STUDIO
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="badge-mono">
              {profile.role}
            </Badge>
            <span className="text-sm text-brand-muted">{profile.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}

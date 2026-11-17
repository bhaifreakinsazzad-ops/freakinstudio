import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/permissions/roles";
import { signOut } from "@/app/(client)/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  const isAdmin = isAdminRole(profile.role);
  if (!isAdmin) {
    redirect("/dashboard?error=admin_access_required");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-brand-black text-brand-light">
      <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="font-mono text-sm font-bold tracking-wider text-brand-light whitespace-nowrap shrink-0"
            >
              FREAKIN&apos;S STUDIO &middot; OPS
            </Link>
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase border-brand-danger/40 text-brand-danger bg-brand-danger/10 whitespace-nowrap shrink-0"
            >
              ADMIN OS
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/dashboard"
              className="text-brand-muted hover:text-brand-light transition-colors"
            >
              &larr; Client Workspace
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-brand-light font-semibold">{profile.email}</span>
              <Badge variant="outline" className="badge-mono border-brand-border text-brand-highlight">
                {profile.role}
              </Badge>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs font-mono h-8">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

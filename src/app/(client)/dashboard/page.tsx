import { getCurrentProfile } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-light">Dashboard</h1>
        <p className="text-sm text-brand-muted">
          Foundation phase — this proves authentication and the real database are wired up end
          to end. Projects, orders, and the full client workspace land in a later phase.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-brand-muted">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p className="text-brand-light">{profile?.full_name ?? "—"}</p>
          <p className="text-brand-muted">{profile?.email}</p>
          <p className="badge-mono text-brand-highlight">{profile?.role}</p>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-light">Sign in</h1>
        <p className="text-sm text-brand-muted">Welcome back to Freakin&apos;s Studio.</p>
      </div>

      {error && (
        <p className="rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger">
          {error}
        </p>
      )}

      <form action={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="cyber-glow">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-brand-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-highlight hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

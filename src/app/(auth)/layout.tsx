import Link from "next/link";

// login/signup read searchParams (for ?error=...) on every request, so
// opt this route group out of Next 16's cacheComponents static prerender
// gate — same rationale as (client)/layout.tsx.
export const instant = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <Link href="/" className="font-mono text-sm font-bold tracking-wide text-brand-light">
        FREAKIN&apos;S STUDIO
      </Link>
      <div className="glass-panel w-full max-w-sm rounded-xl p-8">{children}</div>
    </main>
  );
}

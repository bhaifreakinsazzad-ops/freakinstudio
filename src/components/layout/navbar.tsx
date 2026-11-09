import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-mono text-sm font-bold tracking-wide text-brand-light">
          FREAKIN&apos;S STUDIO
        </Link>
        <nav className="flex items-center gap-2">
          <Button render={<Link href="/login">Sign in</Link>} variant="ghost" size="sm" />
          <Button render={<Link href="/signup">Sign up</Link>} size="sm" className="cyber-glow" />
        </nav>
      </div>
    </header>
  );
}

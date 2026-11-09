import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function MarketingHomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
          <span className="badge-mono text-brand-highlight">Creative Commerce OS</span>
          <h1 className="text-4xl font-bold tracking-tight text-brand-light sm:text-6xl">
            Design. Create. Produce. Grow.
          </h1>
          <p className="max-w-2xl text-lg text-brand-muted">
            Freakin&apos;s Studio is rebuilding its production platform from the ground up —
            a real database, real authentication, and a foundation ready for the full
            creative-commerce experience.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg" className="cyber-glow">
              <Link href="/signup">Create an account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

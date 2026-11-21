import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Freakin's Studio — DESIGN. CREATE. PRODUCE. GROW.",
  description:
    "Learn how Freakin's Studio unites browser-native free tools, sponsored Studio AI direction, and human creative production across 4 disciplines.",
};

export const instant = false;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-5xl space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-[#D9BD81]">
              FREAKIN&apos;S STUDIO &bull; DESIGN. CREATE. PRODUCE. GROW.
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F4EF]">
              Human Creative Craft, Amplified by Operating System Precision.
            </h1>
            <p className="text-base sm:text-xl text-[#F6F4EF]/70 leading-relaxed">
              Based in Dhaka with global digital delivery, Freakin&apos;s Studio
              is built on a focused B+C+D architecture: genuinely free
              browser-native utilities, sponsored Studio AI exploration, and 13
              hourly-scoped human creative services.
            </p>
          </div>

          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 sm:p-12 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-[#D9BD81]">
              Official Brand DNA
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F6F4EF]">
              DESIGN. CREATE. PRODUCE. GROW.
            </h2>
            <p className="text-sm sm:text-base text-[#F6F4EF]/75 leading-relaxed">
              We have retired bloated 60-service agency menus in favor of an
              owner-approved canonical architecture: 4 core creative
              disciplines, 13 services, 15 scoped variants, 5 commercial
              bundles, and 14 compatible add-ons. Every project includes 2
              consolidated revision rounds and human creative lead governance.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 text-center font-mono">
              <div className="p-4 rounded-xl border border-[#232528] bg-[#090A0A] space-y-1">
                <div className="text-2xl font-bold text-[#D9BD81]">4</div>
                <div className="text-[10px] uppercase text-[#F6F4EF]/60">
                  Disciplines
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#232528] bg-[#090A0A] space-y-1">
                <div className="text-2xl font-bold text-[#F6F4EF]">13</div>
                <div className="text-[10px] uppercase text-[#F6F4EF]/60">
                  Core Services
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#232528] bg-[#090A0A] space-y-1">
                <div className="text-2xl font-bold text-[#D9BD81]">15</div>
                <div className="text-[10px] uppercase text-[#F6F4EF]/60">
                  Scoped Variants
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#232528] bg-[#090A0A] space-y-1">
                <div className="text-2xl font-bold text-[#F6F4EF]">5</div>
                <div className="text-[10px] uppercase text-[#F6F4EF]/60">
                  Bundles
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#232528] bg-[#090A0A] space-y-1">
                <div className="text-2xl font-bold text-[#D9BD81]">14</div>
                <div className="text-[10px] uppercase text-[#F6F4EF]/60">
                  Add-Ons
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#232528] bg-[#121315] p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F6F4EF]">
              Collaborate with Freakin&apos;s Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#F6F4EF]/70 max-w-xl mx-auto">
              WhatsApp: +8801778307704 &bull; Email: bhaifreakinstudio@gmail.com
              &bull; Web: freakinstudio.space
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href="/builder">Launch Smart Brief</Link>}
                size="lg"
                className="cyber-glow bg-[#D9BD81] text-[#090A0A] font-semibold font-mono text-xs"
              />
              <Button
                render={<Link href="/contact">Contact Studio Desk</Link>}
                size="lg"
                variant="outline"
                className="border-[#232528] text-[#F6F4EF] font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

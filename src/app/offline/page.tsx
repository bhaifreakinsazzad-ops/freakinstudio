import Link from "next/link";
import { WifiOff, Sliders, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Offline — Freakin's Studio Creative Office OS",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#090A0A] text-[#F6F4EF] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-[#D9BD81]/35 bg-[#121315] p-8 space-y-5 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#D9BD81]/15 border border-[#D9BD81]/40 flex items-center justify-center text-[#D9BD81]">
          <WifiOff className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#D9BD81]">
            Offline Mode &bull; Freakin&apos;s Studio
          </span>
          <h1 className="text-2xl font-bold text-[#F6F4EF]">
            Connection Unavailable
          </h1>
          <p className="text-sm text-[#F6F4EF]/75 leading-relaxed">
            Live workspace sync, Studio AI calls, and checkout require an
            active connection. Once reconnected, reload to continue or return
            to cached static tools.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/tools"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm py-3 px-4 min-h-[44px]"
          >
            <Sliders className="w-4 h-4" />
            <span>Retry Free Local Tools</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#232528] bg-[#090A0A] text-[#F6F4EF] font-semibold text-sm py-3 px-4 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home Orbit</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

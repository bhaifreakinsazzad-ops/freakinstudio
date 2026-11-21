"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { CANONICAL_AI_MICRO_KITS } from "../data/catalog-bridge";
import { runKinetic } from "../utils/motion";
import type { AIMicroKit } from "@/types/domain";
import type { AssistantId } from "@/lib/ai/provider";

interface ServerToolsStatus {
  liveAiConfigured: boolean;
  mode: "PUTER_SPONSORED_LIVE" | "DEMO_TEMPLATE_FALLBACK";
  killSwitchActive: boolean;
  quota: { used: number; limit: number; remaining: number };
}

export function StudioAiAndKitsView({
  reducedMotion,
  onSelectBriefTopic,
}: {
  reducedMotion: boolean;
  onSelectBriefTopic: (topic: string) => void;
}) {
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantId>("ad_hook_generator");
  const [aiPrompt, setAiPrompt] = useState(
    "Artisanal sourdough & cold brew café in Banani, Dhaka"
  );
  const [aiOutput, setAiOutput] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastResultMeta, setLastResultMeta] = useState<{
    isRealAi: boolean;
    gatewayMode: string;
    disclaimer: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKitModal, setSelectedKitModal] = useState<AIMicroKit | null>(
    null
  );
  const [serverStatus, setServerStatus] = useState<ServerToolsStatus>({
    liveAiConfigured: false,
    mode: "DEMO_TEMPLATE_FALLBACK",
    killSwitchActive: false,
    quota: { used: 0, limit: 3, remaining: 3 },
  });

  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/tools/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.ok) return;
        setServerStatus({
          liveAiConfigured: Boolean(data.liveAiConfigured),
          mode: data.mode || "DEMO_TEMPLATE_FALLBACK",
          killSwitchActive: Boolean(data.killSwitchActive),
          quota: data.quota || { used: 0, limit: 3, remaining: 3 },
        });
      })
      .catch(() => {
        // Keep conservative default status if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const assistants: { id: AssistantId; label: string }[] = [
    { id: "brief_assistant", label: "AI Creative Brief Assistant" },
    { id: "ad_hook_generator", label: "AI Ad Hook Generator" },
    { id: "caption_generator", label: "AI Caption Generator (EN+BN)" },
    { id: "product_description", label: "Product Description Assistant" },
    { id: "brand_concept", label: "Brand Concept Generator" },
  ];

  const handleRunAi = async () => {
    setAiError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: selectedAssistant,
          prompt: aiPrompt.trim() || "Modern Dhaka Lifestyle Brand",
        }),
      });

      const serverData = await res.json();

      if (!res.ok || !serverData?.ok) {
        setAiError(
          serverData?.error ||
            "Studio AI Gateway rejected request. Continue using our 6 local Free Tools."
        );
        if (serverData?.quota) {
          setServerStatus((prev) => ({ ...prev, quota: serverData.quota }));
        }
        return;
      }

      if (serverData.quota) {
        setServerStatus((prev) => ({ ...prev, quota: serverData.quota }));
      }

      setLastResultMeta({
        isRealAi: Boolean(serverData.isRealAi),
        gatewayMode: String(serverData.gatewayMode),
        disclaimer: String(serverData.disclaimer || ""),
      });

      const lines = Array.isArray(serverData.lines) ? serverData.lines : [];
      setAiOutput(lines.map((line: string) => `• ${line}`).join("\n"));

      if (!reducedMotion && outputRef.current) {
        runKinetic(outputRef.current, {
          opacity: [0.3, 1],
          y: [8, 0],
          duration: 380,
          ease: "outCubic",
        });
      }
    } catch {
      setAiError(
        "Network error reaching Studio AI Gateway. Browser-native Free Tools continue working offline."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="space-y-10">
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
              serverStatus.liveAiConfigured
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/35"
                : "bg-[#232528] text-[#D9BD81] border-[#D9BD81]/30"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            {serverStatus.liveAiConfigured
              ? "LIVE PUTER SPONSORED GATEWAY • ZERO VISITOR LOGIN"
              : "DEMO TEMPLATE FALLBACK • ZERO PUTER LOGIN REQUIRED"}
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#232528] text-[#F6F4EF]">
            Session Trials Remaining:{" "}
            <strong className="text-[#D9BD81]">
              {serverStatus.quota.remaining} / {serverStatus.quota.limit}
            </strong>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold">
          Studio-Sponsored Creative AI Assistants
        </h2>
        <p className="text-sm text-[#F6F4EF]/80 mt-1 max-w-3xl">
          Visitors never see a Puter sign-in prompt. Requests route server-side
          through <code className="text-[#D9BD81]">/api/ai/generate</code> with
          signed HttpOnly session quotas, daily Studio BDT budget caps, and an
          admin kill switch.
        </p>

        {serverStatus.killSwitchActive && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Studio AI Gateway is currently paused via Studio Pulse Kill
              Switch. All 6 browser-native Free Tools remain 100% online.
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {assistants.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAssistant(a.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[44px] ${
                selectedAssistant === a.id
                  ? "bg-[#D9BD81] text-[#090A0A]"
                  : "bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <label
              htmlFor="ai-topic-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#D9BD81]"
            >
              Describe Your Brand, Product, or Campaign
            </label>
            <textarea
              id="ai-topic-input"
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full rounded-xl bg-[#232528] border border-[#F6F4EF]/15 p-3.5 text-base text-[#F6F4EF] focus:outline-none focus:border-[#D9BD81]"
            />
            <button
              type="button"
              disabled={isGenerating || serverStatus.killSwitchActive}
              onClick={handleRunAi}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm hover:brightness-105 transition min-h-[48px] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGenerating
                  ? "Running Server Gateway..."
                  : serverStatus.liveAiConfigured
                    ? "Generate Live Draft (No Puter Login)"
                    : "Generate Demo Draft (No Puter Login)"}
              </span>
            </button>
          </div>

          <div
            ref={outputRef}
            className="lg:col-span-7 rounded-xl bg-[#232528]/60 border border-[#F6F4EF]/10 p-5 flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-[#D9BD81]">
                  STRUCTURED ASSISTANT OUTPUT
                </span>
                {lastResultMeta && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      lastResultMeta.isRealAi
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {lastResultMeta.gatewayMode}
                  </span>
                )}
              </div>

              {aiError ? (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-200"
                >
                  {aiError}
                </div>
              ) : (
                <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-[#F6F4EF]/95 leading-relaxed">
                  {aiOutput ||
                    'Select an assistant and click "Generate" to run the server-guarded AI gateway with zero Puter sign-in.'}
                </pre>
              )}
            </div>

            {lastResultMeta && !aiError && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[11px] text-[#F6F4EF]/65 max-w-md">
                  {lastResultMeta.disclaimer}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectBriefTopic(aiPrompt)}
                  className="text-xs font-bold text-[#D9BD81] hover:underline inline-flex items-center gap-1"
                >
                  <span>Turn into Human Studio Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Canonical AI Micro-Product Kits */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold text-[#090A0A]">
              AI Micro-Product Kits (Layer D Commerce Contract)
            </h3>
            <p className="text-sm text-[#232528]">
              Fixed-scope downloadable utility packs backed by immutable credit
              ledger reservations. Paid checkout activates upon payment webhook
              verification.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#090A0A] text-[#D9BD81]">
            <Lock className="w-3.5 h-3.5" />
            CHECKOUT LOCKED UNTIL WEBHOOK VERIFICATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CANONICAL_AI_MICRO_KITS.map((kit) => (
            <article
              key={kit.sku}
              className="rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 flex flex-col justify-between shadow-sm hover:border-[#090A0A] transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#090A0A] text-[#D9BD81]">
                    {kit.sku}
                  </span>
                  <span className="text-[11px] font-semibold text-[#232528]">
                    {kit.statusLabel}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-[#090A0A] mt-3">
                  {kit.title}
                </h4>
                <div className="text-sm text-[#232528]">{kit.titleBn}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#090A0A]">
                    ৳{kit.priceBdt}
                  </span>
                  <span className="text-xs text-[#232528]">
                    / ${kit.priceUsd} USD • {kit.targetAudience}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#090A0A] mb-2">
                    Included Outputs:
                  </div>
                  <ul className="space-y-1.5 text-sm text-[#232528]">
                    {kit.includedOutputs.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#090A0A] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#232528]/15 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedKitModal(kit)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Inspect Kit Contract &amp; Upgrade</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedKitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kit-modal-title"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="max-w-lg w-full rounded-2xl bg-[#F6F4EF] border-2 border-[#D9BD81] p-6 text-[#090A0A] space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#232528]">
                  VERIFIED OUTPUT CONTRACT • {selectedKitModal.sku}
                </span>
                <h4 id="kit-modal-title" className="text-xl font-bold mt-1">
                  {selectedKitModal.title} (৳{selectedKitModal.priceBdt}{" "}
                  Proposed)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKitModal(null)}
                className="p-2 rounded-lg hover:bg-black/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-400 text-xs text-amber-950 space-y-1">
              <div className="font-bold">
                Honest Commerce Gate (No Fake Paid Checkout):
              </div>
              <p>
                Self-serve payment for Micro-Kits stays locked until live
                merchant webhook settlement and automated Puter token billing
                verification are enabled in production.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#232528]/15 text-xs text-[#232528]">
              <strong className="text-[#090A0A]">Sample Preview:</strong>{" "}
              {selectedKitModal.samplePreview}
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-[#232528] mb-1">
                Explicit Exclusions:
              </div>
              <ul className="text-xs text-[#232528] list-disc pl-5">
                {selectedKitModal.explicitExclusions.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedKitModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[#232528]/30 text-sm font-semibold min-h-[44px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = selectedKitModal.title;
                  setSelectedKitModal(null);
                  onSelectBriefTopic(
                    `Upgrade from ${title} to Human Studio Polish`
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
              >
                Request Human Expert Version Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

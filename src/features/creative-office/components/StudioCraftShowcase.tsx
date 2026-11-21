"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Copy } from "lucide-react";
import { StudioMonogram } from "./StudioMonogram";
import { getSpringEase, getStagger, runKinetic } from "../utils/motion";
import type { CreativeOfficeRoute } from "../types";

export function StudioCraftInteractiveShowcase({
  reducedMotion,
  onNavigateRoute,
}: {
  reducedMotion: boolean;
  onNavigateRoute: (route: CreativeOfficeRoute) => void;
}) {
  const [activeTab, setActiveTab] = useState<"ladder" | "dna" | "workflow">(
    "ladder"
  );
  const [selectedStep, setSelectedStep] = useState(0);
  const [copiedToken, setCopiedToken] = useState("");
  const showcaseRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !showcaseRef.current) return;
    runKinetic(showcaseRef.current.querySelectorAll(".craft-card-stagger"), {
      opacity: [0, 1],
      y: [14, 0],
      delay: getStagger(65),
      duration: 450,
      ease: "outCubic",
    });
  }, [activeTab, reducedMotion]);

  const ladderSteps: {
    code: string;
    title: string;
    subtitle: string;
    desc: string;
    route: CreativeOfficeRoute;
    cta: string;
  }[] = [
    {
      code: "LAYER B",
      title: "Browser-Native Free Utilities",
      subtitle: "Zero Login • Zero Upload • 100% Local Canvas",
      desc: "Visitors resize creatives, compress assets, extract HEX palettes, and verify WCAG 2.2 contrast locally before spending anything.",
      route: "tools",
      cta: "Open 6 Local Tools",
    },
    {
      code: "LAYER C",
      title: "Studio-Sponsored Freemium AI",
      subtitle: "No Puter Login Required • Server-Guarded",
      desc: "Visitors test AI ad hooks, captions, and brief outlines via our server gateway without ever being forced to sign in to Puter.",
      route: "kits",
      cta: "Try No-Login AI",
    },
    {
      code: "LAYER D",
      title: "Low-Ticket AI Micro-Products",
      subtitle: "Proposed ৳49 / ৳99 / ৳199 Utility Packs",
      desc: "Transparent, fixed-output creative kits with verified webhook fulfillment and one-click upgrade paths to human designers.",
      route: "kits",
      cta: "Inspect Micro-Kits",
    },
    {
      code: "HUMAN STUDIO",
      title: "13 Core Creative Services & Office",
      subtitle: "4 Disciplines • 5 Bundles • 14 Add-ons • 2 Revisions",
      desc: "Scoped hourly engagements crafted by named human specialists, backed by event-driven timelines and pinned proofing.",
      route: "services",
      cta: "Explore 13 Services",
    },
  ];

  const brandTokens = [
    {
      name: "Obsidian",
      hex: "#090A0A",
      role: "Primary Stage & Authority",
      darkText: false,
    },
    {
      name: "Champagne Gold",
      hex: "#D9BD81",
      role: "Brand Signature & Focus",
      darkText: true,
    },
    {
      name: "Studio Ivory",
      hex: "#F6F4EF",
      role: "Editorial & Reading Surface",
      darkText: true,
    },
    {
      name: "Graphite",
      hex: "#232528",
      role: "Modular Panels & Dividers",
      darkText: false,
    },
  ];

  return (
    <section
      ref={showcaseRef}
      className="rounded-3xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF] space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232528] pb-5">
        <div>
          <span className="text-xs font-mono font-bold text-[#D9BD81] uppercase tracking-wider">
            HOW FREAKIN&apos;S STUDIO OPERATES • INTERACTIVE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">
            Built Around Your Creative Momentum
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "ladder", label: "B + C + D Value Engine" },
              { id: "dna", label: "Official Brand Identity" },
              { id: "workflow", label: "Human + SI Governance" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
                activeTab === tab.id
                  ? "bg-[#D9BD81] text-[#090A0A]"
                  : "bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "ladder" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ladderSteps.map((st, idx) => {
            const active = selectedStep === idx;
            return (
              <div
                key={st.code}
                onClick={() => setSelectedStep(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedStep(idx);
                  }
                }}
                className={`craft-card-stagger p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                  active
                    ? "bg-[#232528] border-[#D9BD81] shadow-lg"
                    : "bg-[#121417] border-[#232528] hover:border-[#D9BD81]/50"
                }`}
              >
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-extrabold bg-[#D9BD81] text-[#090A0A]">
                    {st.code}
                  </span>
                  <h3 className="text-lg font-bold text-[#F6F4EF]">
                    {st.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#D9BD81]">
                    {st.subtitle}
                  </div>
                  <p className="text-xs text-[#F6F4EF]/80 leading-relaxed pt-1">
                    {st.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateRoute(st.route);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#D9BD81] hover:underline pt-2 min-h-[36px]"
                >
                  <span>{st.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "dna" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <StudioMonogram
                size={48}
                interactive
                reducedMotion={reducedMotion}
              />
              <div>
                <div className="text-lg font-extrabold tracking-wider">
                  FREAKIN&apos;S STUDIO
                </div>
                <div className="text-xs tracking-[0.2em] text-[#D9BD81]">
                  DESIGN. CREATE. PRODUCE. GROW.
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#F6F4EF]/80 leading-relaxed">
              Every interface, proof sheet, and deliverable adheres strictly to
              our approved four-color architecture with WCAG 2.2 AA contrast
              and bilingual English + বাংলা typography. Click any swatch to
              copy its HEX token.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {brandTokens.map((tok) => (
              <button
                key={tok.hex}
                type="button"
                onClick={(e) => {
                  navigator.clipboard?.writeText(tok.hex);
                  setCopiedToken(tok.hex);
                  if (!reducedMotion) {
                    runKinetic(e.currentTarget, {
                      scale: [0.94, 1.05, 1],
                      duration: 400,
                      ease: getSpringEase(),
                    });
                  }
                  setTimeout(() => setCopiedToken(""), 1600);
                }}
                style={{ backgroundColor: tok.hex }}
                className={`craft-card-stagger p-4 rounded-2xl border border-[#D9BD81]/40 text-left h-36 flex flex-col justify-between transition ${
                  tok.darkText ? "text-[#090A0A]" : "text-[#F6F4EF]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold">
                    {tok.hex}
                  </span>
                  {copiedToken === tok.hex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">{tok.name}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{tok.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "workflow" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              badge: "HUMAN AUTHORITY",
              title: "Manual Studio Control",
              points: [
                "Human leads scope hours & issue official quotes",
                "Named designers execute brand, social, print & motion work",
                "10-minute express slots confirmed manually after file preflight",
              ],
            },
            {
              badge: "GATED SI ASSISTANT",
              title: "Auditable Synthetic Intelligence",
              points: [
                "SI drafts checklists, copy hooks & QA contrast notes",
                "SI can NEVER approve money, deadlines, or final files",
                "Every SI output stays hidden until human approval",
              ],
            },
            {
              badge: "ZERO FABRICATION",
              title: "Event-Backed Truth",
              points: [
                "Progress comes from persisted events—no fake percentages",
                "Concept portfolio clearly labeled Concept Work",
                "Missing project IDs return truthful HTTP 404 guards",
              ],
            },
          ].map((col) => (
            <div
              key={col.badge}
              className="craft-card-stagger p-5 rounded-2xl bg-[#232528]/70 border border-[#F6F4EF]/10 space-y-3"
            >
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#D9BD81] text-[#090A0A]">
                {col.badge}
              </span>
              <h3 className="text-lg font-bold text-[#F6F4EF]">{col.title}</h3>
              <ul className="space-y-2 text-xs text-[#F6F4EF]/85">
                {col.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D9BD81] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

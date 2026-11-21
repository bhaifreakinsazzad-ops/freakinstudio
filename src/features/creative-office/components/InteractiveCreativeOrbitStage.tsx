"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowRight } from "lucide-react";
import { DISCIPLINES } from "../data/catalog-bridge";
import { drawSvgPaths, getSpringEase, getStagger, runKinetic } from "../utils/motion";
import type { CreativeOfficeRoute, ParsedIntent } from "../types";

interface SatelliteNode {
  id: "free" | "ai" | "human";
  code: string;
  title: string;
  metric: string;
  detail: string;
  route: CreativeOfficeRoute;
  cta: string;
  cx: number;
  cy: number;
}

const SATELLITES: SatelliteNode[] = [
  {
    id: "free",
    code: "ORBIT I • LAYER B",
    title: "Free Local Tools",
    metric: "6 Browser Utilities",
    detail:
      "Resize, Compress, Palette, Contrast, Brief Template & 3D Preview — 0 KB uploaded.",
    route: "tools",
    cta: "Launch Free Tools",
    cx: 108,
    cy: 86,
  },
  {
    id: "ai",
    code: "ORBIT II • LAYER C+D",
    title: "Studio AI & Kits",
    metric: "No Puter Login",
    detail:
      "5 AI Assistants + Proposed ৳49 / ৳99 / ৳199 utility packs via server gateway.",
    route: "kits",
    cta: "Open AI & Kits",
    cx: 332,
    cy: 86,
  },
  {
    id: "human",
    code: "ORBIT III • STUDIO",
    title: "Human Creative Studio",
    metric: "13 Core Services",
    detail:
      "4 Disciplines, 15 Variants, 5 Bundles, 14 Add-ons & 2 Consolidated Revisions.",
    route: "services",
    cta: "Explore 13 Services",
    cx: 220,
    cy: 312,
  },
];

export function InteractiveCreativeOrbitStage({
  reducedMotion,
  activeOrbitFocus,
  setActiveOrbitFocus,
  parsedIntent,
  onNavigateRoute,
  onSelectDisciplineForServices,
}: {
  reducedMotion: boolean;
  activeOrbitFocus: string;
  setActiveOrbitFocus: (focus: string) => void;
  parsedIntent: ParsedIntent | null;
  onNavigateRoute: (route: CreativeOfficeRoute) => void;
  onSelectDisciplineForServices: (discId: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [fallbackSatellite, setFallbackSatellite] =
    useState<SatelliteNode["id"]>("human");
  const [activeDisciplineCode, setActiveDisciplineCode] = useState("DISC-01");

  const selectedSatellite: SatelliteNode["id"] =
    activeOrbitFocus === "free" ||
    activeOrbitFocus === "ai" ||
    activeOrbitFocus === "human"
      ? activeOrbitFocus
      : fallbackSatellite;

  const setSelectedSatellite = (id: SatelliteNode["id"]) => {
    setFallbackSatellite(id);
    setActiveOrbitFocus(id);
  };

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const root = stageRef.current;

    drawSvgPaths(
      root.querySelectorAll<SVGGeometryElement>(".orbit-ring-path"),
      1300,
      160
    );

    const outerRing = runKinetic(
      root.querySelectorAll(".orbit-calibration-ring"),
      {
        rotate: 360,
        duration: 48000,
        loop: true,
        ease: "linear",
      }
    );

    const innerRing = runKinetic(
      root.querySelectorAll(".orbit-inner-telemetry"),
      {
        rotate: -360,
        duration: 36000,
        loop: true,
        ease: "linear",
      }
    );

    const haloPulse = runKinetic(root.querySelectorAll(".intent-core-halo"), {
      scale: [0.92, 1.12, 0.92],
      opacity: [0.3, 0.75, 0.3],
      duration: 3000,
      loop: true,
      ease: "inOutSine",
    });

    runKinetic(root.querySelectorAll(".discipline-orbit-chip"), {
      opacity: [0, 1],
      y: [12, 0],
      delay: getStagger(75, { start: 250 }),
      duration: 480,
      ease: "outQuad",
    });

    return () => {
      [outerRing, innerRing, haloPulse].forEach((anim) => {
        if (anim && typeof anim.pause === "function") anim.pause();
      });
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const root = stageRef.current;
    drawSvgPaths(
      root.querySelectorAll<SVGGeometryElement>(`.beam-${selectedSatellite}`),
      520,
      0
    );
    runKinetic(root.querySelectorAll(`.sat-node-${selectedSatellite}`), {
      scale: [0.92, 1.08, 1],
      duration: 520,
      ease: getSpringEase(),
    });
  }, [selectedSatellite, parsedIntent, reducedMotion]);

  const activeSatObj =
    SATELLITES.find((s) => s.id === selectedSatellite) || SATELLITES[2];

  return (
    <div
      ref={stageRef}
      className="rounded-3xl bg-[#111315] border border-[#D9BD81]/35 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#D9BD81]">
          <Activity className="w-3.5 h-3.5" />
          <span>
            {reducedMotion ? "STATIC ORBIT MAP" : "ANIME.JS CONSTELLATION"}
          </span>
        </span>
        <span className="text-[11px] font-mono text-[#F6F4EF]/70">
          Interactive Nodes
        </span>
      </div>

      {/* Interactive SVG Orbital Canvas */}
      <div className="relative w-full flex items-center justify-center">
        <svg
          viewBox="0 0 440 370"
          className="w-full max-w-[430px] h-auto overflow-visible select-none"
          role="img"
          aria-label="Interactive orbital map connecting Intent Core to Free Tools, Studio AI, and Human Creative Services"
        >
          <g
            className="orbit-calibration-ring"
            style={{ transformOrigin: "220px 185px" }}
          >
            <circle
              cx="220"
              cy="185"
              r="160"
              fill="none"
              stroke="rgba(217, 189, 129, 0.24)"
              strokeWidth="1.25"
              strokeDasharray="3 9"
            />
          </g>

          <g
            className="orbit-inner-telemetry"
            style={{ transformOrigin: "220px 185px" }}
          >
            <circle
              cx="220"
              cy="185"
              r="62"
              fill="none"
              stroke="rgba(217, 189, 129, 0.3)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </g>

          <circle
            className="orbit-ring-path"
            cx="220"
            cy="185"
            r="132"
            fill="none"
            stroke="rgba(217, 189, 129, 0.38)"
            strokeWidth="1.25"
          />

          {SATELLITES.map((sat) => {
            const isSelected = sat.id === selectedSatellite;
            return (
              <line
                key={sat.id}
                className={`beam-${sat.id}`}
                x1="220"
                y1="185"
                x2={sat.cx}
                y2={sat.cy}
                stroke={isSelected ? "#D9BD81" : "rgba(217, 189, 129, 0.22)"}
                strokeWidth={isSelected ? "2.5" : "1"}
                strokeDasharray={isSelected ? undefined : "3 4"}
              />
            );
          })}

          <g transform="translate(220, 185)">
            <circle
              className="intent-core-halo"
              r="46"
              fill="rgba(217, 189, 129, 0.2)"
            />
            <circle r="35" fill="#090A0A" stroke="#D9BD81" strokeWidth="2" />
            <text
              y="-4"
              textAnchor="middle"
              fill="#D9BD81"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              INTENT
            </text>
            <text
              y="9"
              textAnchor="middle"
              fill="#F6F4EF"
              fontSize="8"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              CORE OS
            </text>
          </g>

          {SATELLITES.map((sat) => {
            const active = sat.id === selectedSatellite;
            return (
              <g
                key={sat.id}
                className={`sat-node-${sat.id} cursor-pointer`}
                style={{ transformOrigin: `${sat.cx}px ${sat.cy}px` }}
                onClick={() => {
                  setSelectedSatellite(sat.id);
                  setActiveOrbitFocus(sat.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${sat.title}: ${sat.metric}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedSatellite(sat.id);
                    setActiveOrbitFocus(sat.id);
                  }
                }}
              >
                <rect
                  x={sat.cx - 72}
                  y={sat.cy - 28}
                  width="144"
                  height="56"
                  rx="14"
                  fill={active ? "#D9BD81" : "#090A0A"}
                  stroke="#D9BD81"
                  strokeWidth={active ? "2" : "1.25"}
                />
                <text
                  x={sat.cx}
                  y={sat.cy - 7}
                  textAnchor="middle"
                  fill={active ? "#090A0A" : "#D9BD81"}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {sat.code}
                </text>
                <text
                  x={sat.cx}
                  y={sat.cy + 10}
                  textAnchor="middle"
                  fill={active ? "#090A0A" : "#F6F4EF"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {sat.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Selected Orbit Readout Card */}
      <div className="p-4 rounded-2xl bg-[#090A0A] border border-[#D9BD81]/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold text-[#D9BD81]">
            {activeSatObj.code} • {activeSatObj.metric}
          </span>
          <button
            type="button"
            onClick={() => onNavigateRoute(activeSatObj.route)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold hover:brightness-105 transition min-h-[40px]"
          >
            <span>{activeSatObj.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-[#F6F4EF]/85 leading-relaxed">
          {activeSatObj.detail}
        </p>

        <div className="pt-2.5 border-t border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#F6F4EF]/65">
            Jump Directly to Approved Discipline:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DISCIPLINES.map((d) => {
              const Icon = d.icon;
              const isDiscActive = activeDisciplineCode === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onMouseEnter={() => setActiveDisciplineCode(d.id)}
                  onClick={() => onSelectDisciplineForServices(d.id)}
                  className={`discipline-orbit-chip flex items-center gap-1.5 text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold transition min-h-[38px] ${
                    isDiscActive
                      ? "bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40"
                      : "bg-[#232528]/60 text-[#F6F4EF]/85 hover:bg-[#232528]"
                  }`}
                >
                  <Icon className="w-3 h-3 text-[#D9BD81] shrink-0" />
                  <span className="truncate">
                    {d.code}. {d.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

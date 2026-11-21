"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  LayoutGrid,
  List,
  Mail,
  Menu,
  Phone,
  Sliders,
  X,
} from "lucide-react";
import { PWAInstallButton } from "@/components/pwa/pwa-install-button";
import { CreativeOfficeContext } from "./context";
import {
  CONCEPT_PORTFOLIO_WORKS,
  INITIAL_SANDBOX_PROJECTS,
  TRANSLATIONS,
} from "./data/catalog-bridge";
import {
  animeV4Timeline,
  drawSvgPaths,
  getDhakaTimestamp,
  getStagger,
  runKinetic,
} from "./utils/motion";
import { StudioMonogram } from "./components/StudioMonogram";
import { InteractiveCreativeOrbitStage } from "./components/InteractiveCreativeOrbitStage";
import { StudioCraftInteractiveShowcase } from "./components/StudioCraftShowcase";
import { FreeCreativePlayground } from "./components/FreeCreativePlayground";
import { StudioAiAndKitsView } from "./components/StudioAiAndKitsView";
import { ServiceCatalogAndEstimator } from "./components/ServiceCatalogAndEstimator";
import { SmartBriefBuilder } from "./components/SmartBriefBuilder";
import {
  ClientWorkspaceDemo,
  StudioAdminDemo,
} from "./components/SandboxWorkspaces";
import type {
  BriefPrefill,
  CreateBriefPayload,
  CreativeOfficeContextValue,
  CreativeOfficeRoute,
  DemoProject,
  LangCode,
  ParsedIntent,
} from "./types";
import type { ConceptWork } from "@/types/domain";

export type { CreativeOfficeRoute };

export function CreativeOfficeOS({
  initialRoute = "home",
}: {
  initialRoute?: CreativeOfficeRoute;
}) {
  const [lang, setLang] = useState<LangCode>("en");
  const [activeRoute, setActiveRoute] =
    useState<CreativeOfficeRoute>(initialRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rafId = window.requestAnimationFrame(() => {
      setReducedMotion(mq.matches);
    });
    const listener = (ev: MediaQueryListEvent) => setReducedMotion(ev.matches);
    mq.addEventListener?.("change", listener);
    return () => {
      window.cancelAnimationFrame(rafId);
      mq.removeEventListener?.("change", listener);
    };
  }, []);

  const [intentInput, setIntentInput] = useState("");
  const [activeOrbitFocus, setActiveOrbitFocus] = useState("all");
  const [selectedServiceDiscipline, setSelectedServiceDiscipline] =
    useState("ALL");
  const [briefPrefill, setBriefPrefill] = useState<BriefPrefill | null>(null);
  const [activeClientProjectId, setActiveClientProjectId] =
    useState("DEMO-PRJ-104");
  const [activeEditorialStage, setActiveEditorialStage] = useState(0);
  const [selectedConceptModal, setSelectedConceptModal] =
    useState<ConceptWork | null>(null);

  const [projects, setProjects] = useState<DemoProject[]>(
    INITIAL_SANDBOX_PROJECTS
  );
  const [aiEnabled, setAiEnabled] = useState(true);
  const [guestQuotaRemaining, setGuestQuotaRemaining] = useState(3);
  const [dailyBudgetBdt, setDailyBudgetBdt] = useState(1500);
  const [adminLogs, setAdminLogs] = useState<string[]>([
    "System initialized with approved 4/13/15/5/14 catalog and zero-fabrication guardrails.",
  ]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem("fs_creative_office_os_v2");
        if (saved) {
          const parsed = JSON.parse(saved) as {
            projects?: DemoProject[];
            aiEnabled?: boolean;
            guestQuotaRemaining?: number;
          };
          if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
            setProjects(parsed.projects);
          }
          if (typeof parsed.aiEnabled === "boolean") {
            setAiEnabled(parsed.aiEnabled);
          }
          if (typeof parsed.guestQuotaRemaining === "number") {
            setGuestQuotaRemaining(parsed.guestQuotaRemaining);
          }
        }
      } catch {
        // Ignore storage access restriction
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "fs_creative_office_os_v2",
        JSON.stringify({ projects, aiEnabled, guestQuotaRemaining })
      );
    } catch {
      // Ignore storage quota / privacy mode
    }
  }, [projects, aiEnabled, guestQuotaRemaining]);

  const heroRootRef = useRef<HTMLDivElement | null>(null);
  const timelineRailRef = useRef<HTMLElement | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (activeRoute !== "home" || reducedMotion || !heroRootRef.current) return;
    const items = heroRootRef.current.querySelectorAll(".hero-stagger-item");
    if (animeV4Timeline) {
      try {
        const tl = animeV4Timeline({
          defaults: { ease: "outExpo", duration: 650 },
        });
        tl.add(items, {
          opacity: [0, 1],
          y: [18, 0],
          delay: getStagger(75),
        });
        return;
      } catch {
        // Fallback below
      }
    }
    runKinetic(items, {
      opacity: [0, 1],
      y: [18, 0],
      delay: getStagger(75),
      duration: 650,
      ease: "outExpo",
    });
  }, [activeRoute, reducedMotion]);

  useEffect(() => {
    if (activeRoute !== "home" || reducedMotion || !timelineRailRef.current)
      return;
    const lines = timelineRailRef.current.querySelectorAll(
      ".editorial-rail-connector"
    ) as NodeListOf<SVGGeometryElement>;
    drawSvgPaths(lines, 1200, 0);
  }, [activeRoute, reducedMotion]);

  const parsedIntent = useMemo<ParsedIntent | null>(() => {
    const raw = intentInput.trim().toLowerCase();
    if (!raw) return null;
    const isExpress =
      raw.includes("10 min") ||
      raw.includes("quick") ||
      raw.includes("resize") ||
      raw.includes("cleanup") ||
      raw.includes("দ্রুত");
    const isBrand =
      raw.includes("logo") ||
      raw.includes("brand") ||
      raw.includes("packaging") ||
      raw.includes("লোগো");
    const isVideo =
      raw.includes("reel") ||
      raw.includes("video") ||
      raw.includes("motion") ||
      raw.includes("ভিডিও");
    return {
      detectedDiscipline: isVideo
        ? "Motion, Reels & Short-Form Video"
        : isBrand
          ? "Brand & Visual Identity"
          : "Social Media & Campaign Creative",
      expressCandidate: isExpress,
      freeToolRec: isExpress
        ? "Image Resizer & Platform Exporter"
        : "Color Palette & Contrast Checker",
      aiKitRec: isBrand
        ? "Brand Mini AI Kit (৳199 Proposed)"
        : "Campaign Ready AI Kit (৳99 Proposed)",
      humanServiceRec: isExpress
        ? "SRV-02 / SRV-05 Single-File Micro-Edit"
        : isBrand
          ? "SRV-01 Logo Design & Mark Creation"
          : "SRV-05 Social Media Single Post Creative",
    };
  }, [intentInput]);

  const officeContextValue = useMemo<CreativeOfficeContextValue>(
    () => ({
      projects,
      aiEnabled,
      setAiEnabled,
      guestQuotaRemaining,
      consumeGuestQuota: () =>
        setGuestQuotaRemaining((q) => Math.max(0, q - 1)),
      dailyBudgetBdt,
      setDailyBudgetBdt,
      adminLogs,
      addAdminLog: (msg: string) =>
        setAdminLogs((prev) => [
          `[${getDhakaTimestamp()}] ${msg}`,
          ...prev.slice(0, 9),
        ]),
      resetDemoState: () => {
        setProjects(INITIAL_SANDBOX_PROJECTS);
        setGuestQuotaRemaining(3);
        setAiEnabled(true);
      },
      createProjectFromBrief: (payload: CreateBriefPayload) => {
        const newId = `DEMO-PRJ-${106 + projects.length}`;
        const newProj: DemoProject = {
          id: newId,
          title: payload.title,
          clientName: `${payload.clientName} (DEMO CLIENT)`,
          serviceId: payload.serviceId,
          serviceName: payload.serviceName,
          variantLabel: payload.variantLabel,
          scopedHours: payload.scopedHours,
          addons: payload.addons,
          expressRequested: payload.expressRequested,
          expressEligible: payload.expressEligible,
          status: "request_submitted",
          assignedExpert: "Unassigned — Awaiting Studio Triage",
          revisionsIncluded: 2,
          revisionsUsed: 0,
          proofVersion: "Pending",
          proofNotes:
            payload.notes || "Submitted via Interactive Smart Brief Sandbox.",
          annotations: [],
          siProposals: [
            {
              id: `SI-${Math.floor(100 + Math.random() * 899)}`,
              task: "Initial Scope & Asset Checklist Draft",
              summary: `Structured production checklist prepared for ${payload.serviceId} (${payload.scopedHours}h base).`,
              status: "suggested",
              createdAt: getDhakaTimestamp(),
            },
          ],
          events: [
            {
              id: `EVT-${Date.now()}`,
              actorKind: "system",
              actorName: "System Automation",
              timestamp: getDhakaTimestamp(),
              stateBefore: "request_draft",
              stateAfter: "request_submitted",
              summary: `Submitted DEMO brief (${payload.variantLabel}).`,
            },
          ],
        };
        setProjects((prev) => [newProj, ...prev]);
        return newId;
      },
      adminIssueQuote: (projectId: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: "quote_issued",
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: "human",
                      actorName: "Arafat Rahman (Studio Lead)",
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: "quote_issued",
                      summary: `Issued DEMO quote for ${p.scopedHours} billable hours.`,
                    },
                  ],
                }
          )
        );
      },
      adminAssignExpert: (projectId: string, expertName: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: "in_production",
                  assignedExpert: expertName,
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: "human",
                      actorName: "Arafat Rahman (Studio Lead)",
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: "in_production",
                      summary: `Assigned project to ${expertName} and started active production.`,
                    },
                  ],
                }
          )
        );
      },
      adminAdvanceStage: (
        projectId: string,
        nextStatus: string,
        summaryText: string
      ) => {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const parsedVer = parseFloat(p.proofVersion.replace("v", ""));
            const nextVer =
              nextStatus === "proof_ready"
                ? p.proofVersion === "Pending" || Number.isNaN(parsedVer)
                  ? "v1.0"
                  : `v${(parsedVer + 1).toFixed(1)}`
                : p.proofVersion;
            return {
              ...p,
              status: nextStatus,
              proofVersion: nextVer,
              proofNotes: summaryText,
              events: [
                ...p.events,
                {
                  id: `EVT-${Date.now()}`,
                  actorKind: "human",
                  actorName: p.assignedExpert.includes("Unassigned")
                    ? "Arafat Rahman (Studio Lead)"
                    : p.assignedExpert,
                  timestamp: getDhakaTimestamp(),
                  stateBefore: p.status,
                  stateAfter: nextStatus,
                  summary: summaryText,
                },
              ],
            };
          })
        );
      },
      adminGenerateSiProposal: (projectId: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  siProposals: [
                    {
                      id: `SI-${Math.floor(100 + Math.random() * 899)}`,
                      task: "Pre-Delivery Quality & Bilingual Copy Check",
                      summary:
                        "Checked typography contrast, safe-area margins, and 2-round revision compliance.",
                      status: "suggested",
                      createdAt: getDhakaTimestamp(),
                    },
                    ...p.siProposals,
                  ],
                }
          )
        );
      },
      adminDecideSiProposal: (
        projectId: string,
        proposalId: string,
        decision: "approved" | "rejected"
      ) => {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const target = p.siProposals.find((x) => x.id === proposalId);
            return {
              ...p,
              siProposals: p.siProposals.map((x) =>
                x.id === proposalId ? { ...x, status: decision } : x
              ),
              events:
                decision === "approved" && target
                  ? [
                      ...p.events,
                      {
                        id: `EVT-${Date.now()}`,
                        actorKind: "si",
                        actorName: "SI Assistant (Human Approved)",
                        timestamp: getDhakaTimestamp(),
                        stateBefore: p.status,
                        stateAfter: p.status,
                        summary: `Approved SI output: ${target.task} — ${target.summary}`,
                      },
                    ]
                  : p.events,
            };
          })
        );
      },
      clientAcceptQuote: (projectId: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: "accepted",
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: "human",
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: "accepted",
                      summary:
                        "Client accepted DEMO quote and authorized production scope.",
                    },
                  ],
                }
          )
        );
      },
      clientAddAnnotation: (
        projectId: string,
        x: number,
        y: number,
        text: string
      ) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  annotations: [
                    ...p.annotations,
                    {
                      id: `ANN-${Date.now()}`,
                      x,
                      y,
                      author: p.clientName,
                      text,
                    },
                  ],
                }
          )
        );
      },
      clientRequestRevision: (projectId: string, summary: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: "revision_requested",
                  revisionsUsed: Math.min(
                    p.revisionsIncluded,
                    p.revisionsUsed + 1
                  ),
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: "human",
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: "revision_requested",
                      summary: `Client requested consolidated revision (${p.revisionsUsed + 1}/${p.revisionsIncluded}): ${summary}`,
                    },
                  ],
                }
          )
        );
      },
      clientApproveFinalVersion: (projectId: string) => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  status: "client_approved",
                  events: [
                    ...p.events,
                    {
                      id: `EVT-${Date.now()}`,
                      actorKind: "human",
                      actorName: p.clientName,
                      timestamp: getDhakaTimestamp(),
                      stateBefore: p.status,
                      stateAfter: "client_approved",
                      summary: `Client formally approved ${p.proofVersion} for final handover.`,
                    },
                  ],
                }
          )
        );
      },
    }),
    [projects, aiEnabled, guestQuotaRemaining, dailyBudgetBdt, adminLogs]
  );

  const navItems: { id: CreativeOfficeRoute; label: string }[] = [
    { id: "home", label: t.navExplore },
    { id: "tools", label: t.navTools },
    { id: "services", label: t.navServices },
    { id: "kits", label: t.navKits },
    { id: "works", label: t.navWorks },
    { id: "start", label: t.navBrief },
    { id: "office", label: t.navClient },
    { id: "studio", label: t.navStudio },
  ];

  const editorialStages: {
    num: string;
    title: string;
    desc: string;
    actionLabel: string;
    route: CreativeOfficeRoute;
  }[] = [
    {
      num: "01",
      title: "Free Local Utility Prep",
      desc: "Resize, compress, extract brand swatches, and check WCAG contrast locally before spending anything.",
      actionLabel: "Open 6 Free Tools",
      route: "tools",
    },
    {
      num: "02",
      title: "Scoped Brief & Ratebook Quote",
      desc: "Submit a 3-step brief; our human team verifies scope, express eligibility, and canonical Ratebook hours.",
      actionLabel: "Start Smart Brief",
      route: "start",
    },
    {
      num: "03",
      title: "Human Craft + Gated SI Assist",
      desc: "Named designers execute your work. SI Assistant drafts remain hidden until human approval.",
      actionLabel: "Inspect Studio Pulse",
      route: "studio",
    },
    {
      num: "04",
      title: "Pinned Proof & Verified Handover",
      desc: "Drop pin annotations on proofs, use up to 2 consolidated revisions, and approve final delivery.",
      actionLabel: "Inspect Client Office",
      route: "office",
    },
  ];

  return (
    <CreativeOfficeContext.Provider value={officeContextValue}>
      <div className="min-h-screen bg-[#F6F4EF] text-[#090A0A] flex flex-col selection:bg-[#D9BD81] selection:text-[#090A0A]">
        {/* Persistent Top Command Navigation */}
        <header className="sticky top-0 z-40 bg-[#090A0A]/95 backdrop-blur border-b border-[#232528] text-[#F6F4EF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveRoute("home")}
              className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#D9BD81] rounded-lg p-1 min-h-[44px]"
            >
              <StudioMonogram
                size={36}
                interactive
                reducedMotion={reducedMotion}
              />
              <div>
                <div className="font-extrabold tracking-wider text-sm sm:text-base text-[#F6F4EF]">
                  {t.brandName}
                </div>
                <div className="text-[10px] tracking-[0.18em] text-[#D9BD81] hidden sm:block">
                  {t.tagline}
                </div>
              </div>
            </button>

            <nav
              aria-label="Primary Navigation"
              className="hidden xl:flex items-center gap-1"
            >
              {navItems.map((item) => {
                const active = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveRoute(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                      active
                        ? "bg-[#D9BD81] text-[#090A0A]"
                        : "text-[#F6F4EF]/85 hover:text-[#F6F4EF] hover:bg-[#232528]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <PWAInstallButton />
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                title="Toggle Reduced Motion / Flat Grid Mode"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#F6F4EF]/15 text-xs font-semibold min-h-[44px]"
              >
                {reducedMotion ? (
                  <List className="w-3.5 h-3.5 text-[#D9BD81]" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 text-[#D9BD81]" />
                )}
                <span>{reducedMotion ? "Flat Grid" : "Anime Orbit"}</span>
              </button>

              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "bn" : "en")}
                aria-label="Switch Language between English and Bangla"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/40 text-xs font-extrabold min-h-[44px]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "বাংলা" : "EN"}</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
                className="xl:hidden p-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav
              aria-label="Mobile Navigation"
              className="xl:hidden bg-[#090A0A] border-t border-[#232528] px-4 py-4 grid grid-cols-2 gap-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveRoute(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-3 rounded-xl text-left text-xs font-bold min-h-[44px] ${
                    activeRoute === item.id
                      ? "bg-[#D9BD81] text-[#090A0A]"
                      : "bg-[#232528] text-[#F6F4EF]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className="col-span-2 px-3.5 py-3 rounded-xl text-left text-xs font-bold bg-[#232528]/60 text-[#D9BD81] border border-[#D9BD81]/30 min-h-[44px]"
              >
                {reducedMotion ? t.reducedMotionOn : t.reducedMotionOff}
              </button>
            </nav>
          )}
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
          {activeRoute === "home" && (
            <div ref={heroRootRef} className="space-y-12">
              {/* Concept A: Kinetic Orbital Discovery Hero */}
              <section className="rounded-3xl bg-[#090A0A] border border-[#232528] p-6 sm:p-10 lg:p-12 text-[#F6F4EF] relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="hero-stagger-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#232528] border border-[#D9BD81]/35 text-[#D9BD81] text-xs font-bold tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t.heroBadge}</span>
                    </div>

                    <h1 className="hero-stagger-item text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#F6F4EF]">
                      {t.heroTitle}
                    </h1>

                    <p className="hero-stagger-item text-base sm:text-lg text-[#F6F4EF]/85 max-w-2xl leading-relaxed">
                      {t.heroSubtitle}
                    </p>

                    <div className="hero-stagger-item flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveRoute("tools")}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-extrabold text-sm hover:brightness-105 transition min-h-[48px]"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>{t.ctaPrimary}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRoute("start")}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#D9BD81]/40 font-bold text-sm hover:bg-[#232528]/80 transition min-h-[48px]"
                      >
                        <span>{t.ctaSecondary}</span>
                        <ArrowRight className="w-4 h-4 text-[#D9BD81]" />
                      </button>
                      <Link
                        href="/builder"
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#F6F4EF]/20 text-[#F6F4EF]/90 text-sm font-semibold hover:border-[#D9BD81] transition min-h-[48px]"
                      >
                        <span>Open DB Quote Builder</span>
                      </Link>
                    </div>

                    {/* Central Intent Canvas */}
                    <div className="hero-stagger-item p-4 sm:p-5 rounded-2xl bg-[#232528]/85 border border-[#D9BD81]/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-bold text-[#D9BD81]">
                          INTENT CANVAS &bull; EN / বাংলা
                        </span>
                        <span className="text-[#F6F4EF]/70">
                          Fires signal beam to matching orbit
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={intentInput}
                          onChange={(e) => setIntentInput(e.target.value)}
                          placeholder={t.intentPlaceholder}
                          aria-label="Describe your creative goal"
                          className="flex-1 px-4 py-3 rounded-xl bg-[#090A0A] border border-[#F6F4EF]/20 text-sm sm:text-base text-[#F6F4EF] placeholder:text-[#F6F4EF]/45 focus:outline-none focus:border-[#D9BD81]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!intentInput.trim()) {
                              setIntentInput(
                                "Need 3 social ads for my Dhaka bakery"
                              );
                            }
                            setActiveOrbitFocus("human");
                          }}
                          className="px-5 py-3 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm min-h-[48px] shrink-0"
                        >
                          {t.intentButton}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            text: "Need 3 social ads for my Dhaka bakery",
                            focus: "human",
                          },
                          {
                            text: "Quick logo cleanup in 10 min",
                            focus: "free",
                          },
                          {
                            text: "আমার দোকানের জন্য পোস্ট লাগবে",
                            focus: "ai",
                          },
                        ].map((sample) => (
                          <button
                            key={sample.text}
                            type="button"
                            onClick={() => {
                              setIntentInput(sample.text);
                              setActiveOrbitFocus(sample.focus);
                            }}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#090A0A]/80 text-[#F6F4EF]/80 hover:text-[#D9BD81] border border-white/10 min-h-[36px]"
                          >
                            {sample.text}
                          </button>
                        ))}
                      </div>

                      {parsedIntent && (
                        <div className="p-3.5 rounded-xl bg-[#090A0A] border border-[#D9BD81]/50 text-xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-[#D9BD81]">
                              Detected Discipline:{" "}
                              {parsedIntent.detectedDiscipline}
                            </span>
                            {parsedIntent.expressCandidate && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                Potential 10-Min Micro-Edit Slot
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveRoute("tools")}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">
                                PATH 1 &bull; FREE
                              </div>
                              <div className="font-bold mt-0.5">
                                {parsedIntent.freeToolRec}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveRoute("kits")}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">
                                PATH 2 &bull; AI KIT
                              </div>
                              <div className="font-bold mt-0.5">
                                {parsedIntent.aiKitRec}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBriefPrefill({ topic: intentInput });
                                setActiveRoute("start");
                              }}
                              className="p-2.5 rounded-lg bg-[#232528] text-left hover:border-[#D9BD81] border border-transparent"
                            >
                              <div className="text-[10px] text-[#D9BD81] font-mono">
                                PATH 3 &bull; HUMAN STUDIO
                              </div>
                              <div className="font-bold mt-0.5">
                                {parsedIntent.humanServiceRec}
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="hero-stagger-item text-xs text-[#F6F4EF]/70 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D9BD81] shrink-0" />
                      <span>{t.expressDisclaimer}</span>
                    </p>
                  </div>

                  {/* Right 5 Cols: Live Anime.js Interactive Orbital Stage */}
                  <div className="lg:col-span-5">
                    <InteractiveCreativeOrbitStage
                      reducedMotion={reducedMotion}
                      activeOrbitFocus={activeOrbitFocus}
                      setActiveOrbitFocus={setActiveOrbitFocus}
                      parsedIntent={parsedIntent}
                      onNavigateRoute={(r) => setActiveRoute(r)}
                      onSelectDisciplineForServices={(discId) => {
                        setSelectedServiceDiscipline(discId);
                        setActiveRoute("services");
                      }}
                    />
                  </div>
                </div>
              </section>

              <StudioCraftInteractiveShowcase
                reducedMotion={reducedMotion}
                onNavigateRoute={(r) => setActiveRoute(r)}
              />

              {/* Concept C Editorial Production Timeline */}
              <section
                ref={timelineRailRef}
                className="rounded-3xl bg-white border border-[#232528]/15 p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232528]/15 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#232528]">
                      CONCEPT C EDITORIAL TRANSPARENCY
                    </span>
                    <h2 className="text-2xl font-bold text-[#090A0A] mt-1">
                      {t.timelineHeading}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRoute("office")}
                      className="px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                    >
                      Client Workspace Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRoute("studio")}
                      className="px-4 py-2.5 rounded-xl border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[44px]"
                    >
                      Studio Pulse Admin Demo
                    </button>
                  </div>
                </div>

                <svg
                  viewBox="0 0 1000 12"
                  className="hidden lg:block w-full h-3 overflow-visible"
                  aria-hidden="true"
                >
                  <line
                    className="editorial-rail-connector"
                    x1="20"
                    y1="6"
                    x2="980"
                    y2="6"
                    stroke="#D9BD81"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {editorialStages.map((step, idx) => {
                    const isFocused = activeEditorialStage === idx;
                    return (
                      <div
                        key={step.num}
                        onClick={() => setActiveEditorialStage(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveEditorialStage(idx);
                          }
                        }}
                        className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                          isFocused
                            ? "bg-[#090A0A] text-[#F6F4EF] border-[#D9BD81] shadow-lg"
                            : "bg-[#F6F4EF] text-[#090A0A] border-[#232528]/15 hover:border-[#090A0A]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-mono font-extrabold text-[#090A0A] bg-[#D9BD81] inline-block px-2.5 py-0.5 rounded">
                            STAGE {step.num}
                          </div>
                          <h3 className="text-base font-bold">{step.title}</h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isFocused
                                ? "text-[#F6F4EF]/80"
                                : "text-[#232528]"
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRoute(step.route);
                          }}
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold pt-2 min-h-[36px] ${
                            isFocused ? "text-[#D9BD81]" : "text-[#090A0A]"
                          } hover:underline`}
                        >
                          <span>{step.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <FreeCreativePlayground
                lang={lang}
                reducedMotion={reducedMotion}
                onBridgeToBrief={(topic) => {
                  setBriefPrefill({ topic });
                  setActiveRoute("start");
                }}
                onBridgeToAi={() => setActiveRoute("kits")}
              />
            </div>
          )}

          {activeRoute === "tools" && (
            <FreeCreativePlayground
              lang={lang}
              reducedMotion={reducedMotion}
              onBridgeToBrief={(topic) => {
                setBriefPrefill({ topic });
                setActiveRoute("start");
              }}
              onBridgeToAi={() => setActiveRoute("kits")}
            />
          )}

          {activeRoute === "services" && (
            <ServiceCatalogAndEstimator
              key={selectedServiceDiscipline}
              lang={lang}
              reducedMotion={reducedMotion}
              initialDiscipline={selectedServiceDiscipline}
              onConfigureBrief={(cfg) => {
                setBriefPrefill(cfg);
                setActiveRoute("start");
              }}
            />
          )}

          {activeRoute === "kits" && (
            <StudioAiAndKitsView
              reducedMotion={reducedMotion}
              onSelectBriefTopic={(topic) => {
                setBriefPrefill({ topic });
                setActiveRoute("start");
              }}
            />
          )}

          {activeRoute === "works" && (
            <section className="space-y-6">
              <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
                  HONEST PORTFOLIO GOVERNANCE &bull; ZERO FABRICATED METRICS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3">
                  Curated Creative Concept Showcase
                </h2>
                <p className="text-sm text-[#F6F4EF]/80 mt-1 max-w-3xl">
                  Every specimen below is explicitly labeled{" "}
                  <strong className="text-[#D9BD81]">
                    CONCEPT WORK — NOT CLIENT WORK
                  </strong>
                  . Unverified ROAS figures and synthetic testimonials are
                  permanently excluded.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CONCEPT_PORTFOLIO_WORKS.map((work) => (
                  <article
                    key={work.id}
                    className="rounded-2xl bg-white border border-[#232528]/20 overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#090A0A] transition"
                  >
                    <div className="bg-[#090A0A] p-6 text-[#F6F4EF] space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-[#D9BD81]">
                          {work.categoryLabel}
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {work.truthBadge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{work.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {[work.accentHex, "#090A0A", "#F6F4EF", "#232528"].map(
                          (hex) => (
                            <div
                              key={`${work.id}-${hex}`}
                              className="flex items-center gap-1.5 bg-[#232528] px-2 py-1 rounded text-[11px] font-mono"
                            >
                              <span
                                style={{ backgroundColor: hex }}
                                className="w-3 h-3 rounded-full border border-white/20"
                              />
                              <span>{hex}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-sm text-[#232528]">
                        {work.visualTheme}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {work.deliverables.map((del) => (
                          <span
                            key={del}
                            className="px-2.5 py-1 rounded-lg bg-[#F6F4EF] text-xs font-semibold text-[#090A0A]"
                          >
                            {del}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedConceptModal(work)}
                          className="text-xs font-bold text-[#232528] hover:text-[#090A0A] underline min-h-[40px]"
                        >
                          Inspect Concept Artboard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBriefPrefill({
                              serviceId: work.serviceId,
                              topic: `Inspired by ${work.title}`,
                            });
                            setActiveRoute("start");
                          }}
                          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#090A0A] hover:underline min-h-[40px]"
                        >
                          <span>Commission Similar Scope</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {selectedConceptModal && (
                <div
                  role="dialog"
                  aria-modal="true"
                  className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                >
                  <div className="max-w-lg w-full rounded-2xl bg-[#090A0A] border-2 border-[#D9BD81] p-6 text-[#F6F4EF] space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300">
                          {selectedConceptModal.truthBadge}
                        </span>
                        <h3 className="text-xl font-bold mt-2">
                          {selectedConceptModal.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedConceptModal(null)}
                        className="p-2 rounded-lg hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Close specimen"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[#F6F4EF]/85">
                      {selectedConceptModal.rationale}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        selectedConceptModal.accentHex,
                        "#090A0A",
                        "#F6F4EF",
                        "#232528",
                      ].map((hex) => (
                        <div
                          key={hex}
                          className="rounded-xl overflow-hidden border border-white/15"
                        >
                          <div
                            style={{ backgroundColor: hex }}
                            className="h-14 w-full"
                          />
                          <div className="p-1.5 text-center font-mono text-[10px] bg-[#232528]">
                            {hex}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedConceptModal(null)}
                        className="px-4 py-2 rounded-xl bg-[#232528] text-xs font-bold min-h-[44px]"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = selectedConceptModal.title;
                          const sId = selectedConceptModal.serviceId;
                          setSelectedConceptModal(null);
                          setBriefPrefill({
                            serviceId: sId,
                            topic: `Inspired by ${title}`,
                          });
                          setActiveRoute("start");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#D9BD81] text-[#090A0A] text-xs font-extrabold min-h-[44px]"
                      >
                        Start Brief with This Direction
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeRoute === "start" && (
            <SmartBriefBuilder
              key={JSON.stringify(briefPrefill)}
              prefill={briefPrefill}
              onSubmitted={(newProjectId) => {
                setActiveClientProjectId(newProjectId);
                setActiveRoute("office");
              }}
            />
          )}

          {activeRoute === "office" && (
            <ClientWorkspaceDemo
              initialProjectId={activeClientProjectId}
              reducedMotion={reducedMotion}
              onSwitchToStudio={() => setActiveRoute("studio")}
            />
          )}

          {activeRoute === "studio" && (
            <StudioAdminDemo
              onSwitchToClient={(projId) => {
                if (projId) setActiveClientProjectId(projId);
                setActiveRoute("office");
              }}
            />
          )}
        </main>

        {/* Authoritative Studio Footer */}
        <footer className="bg-[#090A0A] text-[#F6F4EF] border-t border-[#232528] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <StudioMonogram size={34} reducedMotion={reducedMotion} />
                <div>
                  <div className="font-extrabold tracking-wider text-sm">
                    {t.brandName}
                  </div>
                  <div className="text-[10px] tracking-[0.18em] text-[#D9BD81]">
                    {t.tagline}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#F6F4EF]/75 max-w-sm leading-relaxed">
                Creative Office OS 2.0. Combining browser-native free utilities,
                Puter-login-free Studio AI trials, and human-governed creative
                production.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#D9BD81]">
                {t.contactHeader}
              </div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <Phone className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>WhatsApp: +8801778307704</span>
              </div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <Mail className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>Email: bhaifreakinstudio@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#F6F4EF]/85">
                <ExternalLink className="w-3.5 h-3.5 text-[#D9BD81]" />
                <span>Web: freakinstudio.space (studio subdomain proposed)</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#D9BD81]">
                Governance &amp; Status
              </div>
              <p className="text-[#F6F4EF]/70">
                Canonical Ratebook v8/v8.1 confirmation and live payment
                webhooks remain gated before production capture.
              </p>
              <div className="text-[11px] font-mono text-[#D9BD81]">
                Obsidian #090A0A &bull; Gold #D9BD81 &bull; Ivory #F6F4EF &bull;
                Graphite #232528
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-4 border-t border-[#232528] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#F6F4EF]/65">
            <span>Direct Platform Routes:</span>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools" className="hover:text-[#D9BD81] underline">
                Free Tools (/tools)
              </Link>
              <Link href="/services" className="hover:text-[#D9BD81] underline">
                13 Services (/services)
              </Link>
              <Link href="/kits" className="hover:text-[#D9BD81] underline">
                AI &amp; Kits (/kits)
              </Link>
              <Link href="/portfolio" className="hover:text-[#D9BD81] underline">
                Concept Works (/portfolio)
              </Link>
              <Link href="/builder" className="hover:text-[#D9BD81] underline">
                Smart Brief (/builder)
              </Link>
              <Link href="/contact" className="hover:text-[#D9BD81] underline">
                Contact Desk (/contact)
              </Link>
              <Link href="/dashboard" className="hover:text-[#D9BD81] underline">
                Client Office (/dashboard)
              </Link>
              <Link href="/admin" className="hover:text-[#D9BD81] underline">
                Studio Pulse (/admin)
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </CreativeOfficeContext.Provider>
  );
}

export default CreativeOfficeOS;
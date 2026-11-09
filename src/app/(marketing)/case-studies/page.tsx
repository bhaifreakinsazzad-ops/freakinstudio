/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Case Studies — Freakin's Studio",
  description: "In-depth technical and creative case studies detailing strategy, production milestones, and commercial results.",
};

export const instant = false;

interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  timeline: string;
  servicesUsed: string[];
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  imageUrl: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "apex-robotics",
    client: "Apex Autonomous Corp",
    industry: "Industrial Robotics & Automation",
    timeline: "3 Weeks (Rush Protocol)",
    servicesUsed: ["A1. Enterprise Brand Identity System", "F1. 3D Kinetic Motion Reveal", "G1. Investor Presentation Master"],
    headline: "Architecting a Series-A Industrial Identity for Autonomous Robotics",
    summary: "How Freakin's Studio unified complex robotic telemetry hardware with a kinetic visual identity that secured institutional backing.",
    challenge: "Apex Robotics was preparing to close an $18M Series-A round while launching their commercial warehouse bot fleet. Their existing visual presence lacked technical authority, relying on generic tech stock aesthetics that failed to communicate precision engineering.",
    solution: "Freakin's Studio deployed our Identity Systems sprint (A1) paired with 3D Kinetic Motion (F1). We constructed a logomark based on robotic kinematic rotation matrices, developed a dark-mode industrial design token system, produced 4K hardware renders, and built an interactive 24-slide investor deck.",
    results: [
      { label: "Series-A Capital Closed", value: "$18.5M" },
      { label: "Turnaround Speed", value: "18 Days" },
      { label: "Hardware Render Count", value: "14 High-Res 4K" },
    ],
    testimonial: {
      quote: "Freakin's Studio didn't just design a logo; they engineered an operating visual identity that gave our venture partners immediate conviction in our hardware.",
      author: "Dr. Marcus Vance",
      role: "CEO & Founder, Apex Robotics",
    },
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "finpulse-global",
    client: "FinPulse Global Ltd",
    industry: "Fintech & Wealth Management",
    timeline: "4 Weeks",
    servicesUsed: ["C1. Next.js High-Performance Marketing Platform", "C2. Interactive Mobile UI Application Flow", "B3. Design Tokens Architecture"],
    headline: "Engineering a Headless Digital Banking Experience with Micro-Interactions",
    summary: "Designing and engineering a modern cross-platform interface that turned complex asset allocation into an intuitive mobile experience.",
    challenge: "FinPulse needed to transition from legacy web portals to a next-generation mobile banking experience. The platform required multi-currency account management, real-time portfolio charts, and instant fiat-to-yield swaps without user cognitive overload.",
    solution: "We designed a 42-screen modular UI architecture in Figma, backed by CSS design tokens. We then built a Next.js 16 high-performance marketing platform with sub-second page transitions, dynamic currency conversion calculators, and interactive Lottie animations.",
    results: [
      { label: "Mobile Onboarding Conversion", value: "+38%" },
      { label: "Lighthouse Performance Score", value: "99 / 100" },
      { label: "Screens Delivered & Tested", value: "42 Screens" },
    ],
    testimonial: {
      quote: "The speed and polish delivered by Freakin's Studio exceeded every traditional agency we previously engaged. Their Next.js and Figma token architecture saved us months of frontend rework.",
      author: "Elena Rostova",
      role: "Chief Product Officer, FinPulse Global",
    },
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "neurosynth-audio",
    client: "NeuroSynth Audio Labs",
    industry: "AI Audio & Spatial Hardware",
    timeline: "2 Weeks",
    servicesUsed: ["F3. Bespoke Sonic Identity & Audio Chimes", "F1. 3D Cinematic Motion Reveal", "E1. Omnichannel Campaign Launch Pack"],
    headline: "Sonic Branding & Spatial Sound Design for Next-Generation Audio Hardware",
    summary: "Creating a multidimensional sonic logo, haptic product chimes, and a 3D procedural launch film for an AI sound synthesis device.",
    challenge: "NeuroSynth created a breakthrough hardware synthesizer powered by neural sound generation. The product lacked an acoustic brand personality and needed launch materials that would resonate with audiophiles and electronic musicians globally.",
    solution: "Our studio sound laboratory synthesized a signature 3-second sonic mnemonic using analog modular synths mixed with granular generative textures. We engineered 12 bespoke hardware interaction chimes in Dolby Atmos and paired them with a 3D procedural video trailer.",
    results: [
      { label: "Launch Video Impressions", value: "1.4M+" },
      { label: "Pre-Orders Within 48 Hours", value: "2,400 Units" },
      { label: "Master Audio Deliverables", value: "24-bit 96kHz" },
    ],
    testimonial: {
      quote: "Their team understands the physics of sound and the art of brand storytelling equally. The sonic identity has become universally recognized among our creator community.",
      author: "Julian Thorne",
      role: "Head of Hardware, NeuroSynth",
    },
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="badge-mono text-brand-highlight">In-Depth Case Studies</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light">
              Results Measured in Real Commercial Value.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Discover how visionary founders, enterprise brands, and product teams leverage Freakin&apos;s Studio
              to achieve decisive market advantage through design excellence and technical execution.
            </p>
          </div>

          {/* Case Studies Detailed List */}
          <div className="space-y-20">
            {CASE_STUDIES.map((study, idx) => (
              <article
                key={study.slug}
                className="rounded-2xl border border-brand-border bg-brand-surface/30 p-8 sm:p-12 space-y-8"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/60 pb-6 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-brand-light font-bold">Case Study 0{idx + 1}</span>
                    <span className="text-brand-border">&bull;</span>
                    <span className="text-brand-highlight">{study.client}</span>
                    <span className="text-brand-border">&bull;</span>
                    <span className="text-brand-muted">{study.industry}</span>
                  </div>
                  <div className="text-brand-muted">
                    Production Timeline: <span className="text-brand-light font-semibold">{study.timeline}</span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-light leading-snug">
                      {study.headline}
                    </h2>
                    <p className="text-sm font-medium text-brand-muted leading-relaxed">
                      {study.summary}
                    </p>

                    <div className="space-y-4 pt-2 text-xs leading-relaxed text-brand-muted">
                      <div>
                        <h4 className="font-mono uppercase font-semibold text-brand-light text-xs mb-1">
                          The Challenge
                        </h4>
                        <p>{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-mono uppercase font-semibold text-brand-light text-xs mb-1">
                          The Studio Solution
                        </h4>
                        <p>{study.solution}</p>
                      </div>
                    </div>

                    {/* Services used */}
                    <div className="space-y-2 pt-2">
                      <h4 className="font-mono uppercase text-[10px] text-brand-muted">Services Deployed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.servicesUsed.map((srv, sIdx) => (
                          <Badge key={sIdx} variant="outline" className="badge-mono border-brand-border text-brand-light text-[11px]">
                            {srv}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Quote */}
                    <blockquote className="rounded-lg border-l-2 border-brand-highlight bg-brand-surface/60 p-4 space-y-2 text-xs">
                      <p className="italic text-brand-light">&ldquo;{study.testimonial.quote}&rdquo;</p>
                      <footer className="font-mono text-[11px] text-brand-muted">
                        &mdash; <strong className="text-brand-light">{study.testimonial.author}</strong>, {study.testimonial.role}
                      </footer>
                    </blockquote>
                  </div>

                  {/* Sidebar with Image & Metrics */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-brand-border bg-brand-border/20">
                      <img
                        src={study.imageUrl}
                        alt={study.headline}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {study.results.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="rounded-lg border border-brand-border bg-brand-surface/60 p-3 text-center space-y-1"
                        >
                          <div className="font-mono text-lg font-bold text-brand-highlight">
                            {res.value}
                          </div>
                          <div className="text-[10px] font-mono text-brand-muted uppercase leading-tight">
                            {res.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      render={<Link href="/builder">Configure Similar Scope in Builder &rarr;</Link>}
                      className="w-full cyber-glow text-xs font-mono h-10"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Direct CTA */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light">
              Start your next production chapter with Freakin&apos;s Studio.
            </h2>
            <p className="text-sm text-brand-muted max-w-xl mx-auto">
              Choose from 60 precision creative services, tailor your scope, and get started today.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button
                render={<Link href="/builder">Launch Package Builder</Link>}
                size="lg"
                className="cyber-glow"
              />
              <Button
                render={<Link href="/services">Browse 60 Services</Link>}
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

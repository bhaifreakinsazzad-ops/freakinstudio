import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ShowcaseImage } from "@/components/ui/ShowcaseImage";

export const metadata: Metadata = {
  title: "Case Studies — Freakin's Studio",
  description:
    "In-depth creative and commercial case studies detailing strategy, production milestones, and measurable market outcomes.",
};

export const instant = false;

interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  timeline: string;
  servicesUsed: { id: string; label: string }[];
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
  primaryServiceId: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "aurum-robotics",
    client: "Aurum Robotics Corp",
    industry: "Industrial Robotics & Automation",
    timeline: "12 Days (Rush Protocol)",
    servicesUsed: [
      { id: "B02", label: "B02 · Complete Brand Identity Development" },
      { id: "G03", label: "G03 · Business Pitch Decks" },
      { id: "A05", label: "A05 · Business Cards & Stationery" },
    ],
    headline: "Architecting a Series-A Industrial Identity & Investor Suite",
    summary:
      "How Freakin's Studio unified complex robotic hardware engineering with a geometric visual identity that backed an $18.5M institutional round.",
    challenge:
      "Aurum Robotics was preparing to close Series-A capital while unveiling its autonomous warehouse fleet. Their existing branding relied on fragmented templates that failed to communicate engineering rigor.",
    solution:
      "We ran a synchronized Brand Identity sprint (B02) alongside an executive Business Pitch Deck (G03) and tactile stationery suite (A05). We built a mathematical monogram system, obsidian-and-gold typography guidelines, and 24 high-impact investor slides.",
    results: [
      { label: "Series-A Closed", value: "$18.5M" },
      { label: "Turnaround Time", value: "12 Days" },
      { label: "Deck Slides", value: "24 Slides" },
    ],
    testimonial: {
      quote:
        "Freakin's Studio didn't just refresh our logo—they engineered a complete visual identity and investor narrative that gave our partners immediate conviction.",
      author: "Dr. Marcus Vance",
      role: "CEO & Founder, Aurum Robotics",
    },
    imageUrl: "/images/portfolio/brand-identity.jpg",
    primaryServiceId: "B02",
  },
  {
    slug: "kinetic-motion-aura",
    client: "Kinetic Interactive Labs",
    industry: "Consumer Tech & Entertainment",
    timeline: "14 Days",
    servicesUsed: [
      { id: "C05", label: "C05 · 3D Animation & Visuals" },
      { id: "C03", label: "C03 · Motion Graphics & Animated Typography" },
      { id: "C07", label: "C07 · Product & Commercial Videos" },
    ],
    headline: "Producing a 4K 3D Kinetic Launch Film & Social Motion Engine",
    summary:
      "Delivering cinema-grade 3D animated typography, broadcast grading, and vertical social cutdowns for a synchronized global product reveal.",
    challenge:
      "Kinetic needed a flagship launch trailer and 12 platform-specific reels within a tight two-week window prior to their international keynote, without hiring separate 3D and post-production houses.",
    solution:
      "Our video and motion division combined 3D Animation & Visuals (C05) with Motion Graphics & Animated Typography (C03) and Commercial Video mastery (C07) inside a unified proofing room with coordinate pin reviews.",
    results: [
      { label: "Launch Views", value: "1.4M+" },
      { label: "Reels Delivered", value: "12 Cuts" },
      { label: "Revision Rounds", value: "2 / 4 Used" },
    ],
    testimonial: {
      quote:
        "Pin-point coordinate proofing cut our review cycle in half. Every 4K master and 9:16 social cutdown arrived calibrated and ready for global ad spend.",
      author: "Elena Rostova",
      role: "Chief Brand Officer, Kinetic Labs",
    },
    imageUrl: "/images/portfolio/video-motion.jpg",
    primaryServiceId: "C05",
  },
  {
    slug: "aetheria-spatial",
    client: "Aetheria Audio Systems",
    industry: "Consumer Hardware & Luxury Electronics",
    timeline: "10 Days",
    servicesUsed: [
      { id: "F02", label: "F02 · AI-Assisted Video Production" },
      { id: "F05", label: "F05 · Digital Mockups & Product Visuals" },
      { id: "E01", label: "E01 · Paid Advertising Creative Design" },
    ],
    headline: "AI-Assisted Hardware Visualization & Omnichannel Launch Campaign",
    summary:
      "Pairing generative 8K staging with human art direction and paid social ad creatives to drive 2,400 hardware pre-orders in 48 hours.",
    challenge:
      "With physical manufacturing prototypes still in transit, Aetheria needed photorealistic product staging, launch teasers, and paid acquisition creatives for Meta and Google Display ahead of schedule.",
    solution:
      "We deployed AI-Assisted Video Production (F02) and Digital Product Mockups (F05), refined by senior retouchers, and exported a 16-asset Paid Advertising Creative suite (E01) with verified ROAS hooks.",
    results: [
      { label: "48h Pre-Orders", value: "2,400" },
      { label: "Ad ROAS Uplift", value: "+42%" },
      { label: "Master Assets", value: "36 Files" },
    ],
    testimonial: {
      quote:
        "Having product visuals, launch video, and paid social creatives built under one roof saved us six weeks of studio logistics and directly fueled our sellout launch.",
      author: "Julian Thorne",
      role: "Head of Hardware, Aetheria Systems",
    },
    imageUrl: "/images/portfolio/ai-creative.jpg",
    primaryServiceId: "F02",
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
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-light text-balance">
              Results Measured in Real Commercial Value.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              Discover how visionary founders, enterprise brands, and growth teams deploy Freakin&apos;s Studio
              across our 60 canonical services to achieve decisive market results.
            </p>
          </div>

          {/* Case Studies Detailed List */}
          <div className="space-y-16">
            {CASE_STUDIES.map((study, idx) => (
              <article
                key={study.slug}
                className="rounded-2xl border border-brand-border bg-brand-surface/30 p-6 sm:p-10 space-y-8"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/60 pb-5 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-brand-light font-bold">Case Study 0{idx + 1}</span>
                    <span className="text-brand-border">&bull;</span>
                    <span className="text-brand-highlight">{study.client}</span>
                    <span className="text-brand-border">&bull;</span>
                    <span className="text-brand-muted">{study.industry}</span>
                  </div>
                  <div className="text-brand-muted">
                    Timeline: <span className="text-brand-light font-semibold">{study.timeline}</span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-5">
                      <h2 className="text-2xl sm:text-3xl font-bold text-brand-light leading-snug">
                        {study.headline}
                      </h2>
                      <p className="text-sm font-medium text-brand-muted leading-relaxed">
                        {study.summary}
                      </p>

                      <div className="space-y-4 pt-2 text-xs leading-relaxed text-brand-muted">
                        <div>
                          <h3 className="font-mono uppercase font-semibold text-brand-light text-xs mb-1">
                            The Challenge
                          </h3>
                          <p>{study.challenge}</p>
                        </div>
                        <div>
                          <h3 className="font-mono uppercase font-semibold text-brand-light text-xs mb-1">
                            The Studio Solution
                          </h3>
                          <p>{study.solution}</p>
                        </div>
                      </div>

                      {/* Canonical services used */}
                      <div className="space-y-2 pt-2">
                        <h4 className="font-mono uppercase text-[10px] text-brand-muted">
                          Canonical Services Deployed
                        </h4>
                        <div className="flex flex-wrap gap-3 text-xs font-mono">
                          {study.servicesUsed.map((srv) => (
                            <Link
                              key={srv.id}
                              href={`/services/${srv.id}`}
                              className="text-brand-highlight hover:underline"
                            >
                              {srv.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Quote — hairline border all around, no thick left bar */}
                    <blockquote className="rounded-xl border border-brand-border bg-brand-surface/70 p-5 space-y-2 text-xs">
                      <p className="italic text-brand-light leading-relaxed">
                        &ldquo;{study.testimonial.quote}&rdquo;
                      </p>
                      <footer className="font-mono text-[11px] text-brand-muted">
                        &mdash; <strong className="text-brand-light">{study.testimonial.author}</strong>, {study.testimonial.role}
                      </footer>
                    </blockquote>
                  </div>

                  {/* Sidebar with Image & Metrics */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-brand-border bg-brand-surface">
                      <ShowcaseImage
                        src={study.imageUrl}
                        alt={study.headline}
                        caption={study.client}
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 tabular-nums">
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
                        render={
                          <Link href={`/builder?service=${study.primaryServiceId}`}>
                            Configure Similar Scope ({study.primaryServiceId}) &rarr;
                          </Link>
                        }
                        className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold text-xs font-mono h-10"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Direct CTA */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-brand-light text-balance">
              Start your next production chapter with Freakin&apos;s Studio.
            </h2>
            <p className="text-sm text-brand-muted max-w-xl mx-auto">
              Choose from 60 precision creative services, tailor your scope, and get started today.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Button
                render={<Link href="/builder">Launch Package Builder</Link>}
                size="lg"
                className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-sm"
              />
              <Button
                render={<Link href="/services">Browse 60 Services</Link>}
                size="lg"
                variant="outline"
                className="font-mono text-sm border-brand-border text-brand-light"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

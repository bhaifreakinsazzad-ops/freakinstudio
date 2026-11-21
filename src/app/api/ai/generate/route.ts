import { NextResponse } from "next/server";
import { z } from "zod";

const aiRequestSchema = z.object({
  assistantId: z.enum([
    "brief_assistant",
    "ad_hook_generator",
    "caption_generator",
    "product_description",
    "brand_concept",
  ]),
  prompt: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters describing your product or goal.")
    .max(1200, "Prompt exceeds maximum length (1200 characters)."),
  locale: z.enum(["en", "bn"]).optional().default("en"),
  clientKillSwitchActive: z.boolean().optional().default(false),
});

const ASSISTANT_CATALOG: Record<
  z.infer<typeof aiRequestSchema>["assistantId"],
  {
    title: string;
    recommendedServiceId: string;
    recommendedKitSku: string;
    estimatedCostBdt: number;
    buildResponse: (input: string) => string[];
  }
> = {
  brief_assistant: {
    title: "AI Creative Brief Assistant",
    recommendedServiceId: "SRV-03",
    recommendedKitSku: "SKU-BRAND-199",
    estimatedCostBdt: 3,
    buildResponse: (input) => [
      `OBJECTIVE CLARITY: Position "${input}" with an unmistakable visual hierarchy anchored in high-contrast typography and disciplined negative space.`,
      `DELIVERABLE SCOPE: Primary Vector Mark (SVG/AI) + 4:5 Hero Social Key Visual + Print-Ready Specification Sheet.`,
      `HUMAN STUDIO ROUTING: Maps directly to SRV-03 (Brand Identity Starter System, 10h scoped, 2 consolidated revisions).`,
      `RISK & EXCLUSION GUARD: Avoid stock templates; ensure minimum 7:1 AAA contrast on primary headline locks.`,
    ],
  },
  ad_hook_generator: {
    title: "AI Ad Hook Generator",
    recommendedServiceId: "SRV-07",
    recommendedKitSku: "SKU-CAMP-99",
    estimatedCostBdt: 3,
    buildResponse: (input) => [
      `HOOK ANGLE 01 [Pattern Interrupt]: "Stop scrolling past generic ${input} — see how precision craft changes the first 2 seconds."`,
      `HOOK ANGLE 02 [Proof & Authority]: "Built for founders who measure quality in retention, not templates: ${input}."`,
      `HOOK ANGLE 03 [Direct Value CTA]: "Upgrade your ${input} creative today. 2 consolidated revisions, print & social ready."`,
      `STUDIO UPGRADE PATH: Commission SRV-07 (Paid Ad Creative Variations, 5h scoped) for 3 human-art-directed 4:5 & 9:16 ad sets.`,
    ],
  },
  caption_generator: {
    title: "AI Caption Generator (EN + BN)",
    recommendedServiceId: "SRV-05",
    recommendedKitSku: "SKU-SHOP-49",
    estimatedCostBdt: 2,
    buildResponse: (input) => [
      `ENGLISH CAPTION: "Precision isn't an accident. Introducing our latest direction for ${input} — crafted with Obsidian depth and Champagne Gold clarity. Tap the link or message +8801778307704 to reserve your slot."`,
      `BANGLA CAPTION: "${input}-এর জন্য আমাদের নতুন প্রিমিয়াম ক্রিয়েটিভ দিকনির্দেশনা। নিখুঁত ডিজাইন এবং দ্রুত ডেলিভারির জন্য আজই যোগাযোগ করুন: +8801778307704।"`,
      `CTA & FORMAT PAIRING: Pair with a 1080×1350 (4:5) Portrait Feed visual (SRV-05) for maximum mobile screen occupancy.`,
    ],
  },
  product_description: {
    title: "Product Description Assistant",
    recommendedServiceId: "SRV-10",
    recommendedKitSku: "SKU-SHOP-49",
    estimatedCostBdt: 2,
    buildResponse: (input) => [
      `HERO POSITIONING: "${input}" — engineered for discerning customers who demand tactile quality and zero compromises.`,
      `KEY BENEFIT BULLETS: • High-contrast shelf presence • Verified material & finish specifications • Built for immediate D2C & retail trust.`,
      `PACKAGING CALLOUT: Pair this copy with SRV-10 (Packaging & Label Design, 7h scoped) for print-ready CMYK dielines and 3D presentation mockups.`,
    ],
  },
  brand_concept: {
    title: "Brand Concept Generator",
    recommendedServiceId: "SRV-01",
    recommendedKitSku: "SKU-BRAND-199",
    estimatedCostBdt: 4,
    buildResponse: (input) => [
      `CONCEPT ARCHETYPE: "The Modern Atelier" — authoritative, geometric, and tactile direction tailored for ${input}.`,
      `COLOR & TYPE DIRECTION: Primary Background #090A0A (Obsidian), Accent #D9BD81 (Champagne Gold), Surface Text #F6F4EF (Studio Ivory) with Syne Display + Plus Jakarta Sans.`,
      `MONOGRAM GEOMETRY: 45-degree chamfered frame with precision corner ticks — commission SRV-01 (Logo Design & Mark Creation, 6h) for human vector execution.`,
    ],
  },
};

export async function POST(request: Request) {
  try {
    // 1. Server-level Emergency Kill Switch check
    if (
      process.env.STUDIO_AI_KILL_SWITCH === "true" ||
      process.env.STUDIO_AI_KILL_SWITCH === "1"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "AI_KILL_SWITCH_ACTIVE",
          error:
            "Studio AI Gateway is temporarily paused by Studio Pulse Administration. All 6 browser-native Free Tools and 13 Human Services remain 100% operational.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0]?.message || "Invalid AI assistant payload.";
      return NextResponse.json(
        { ok: false, error: firstIssue },
        { status: 400 }
      );
    }

    if (parsed.data.clientKillSwitchActive) {
      return NextResponse.json(
        {
          ok: false,
          code: "AI_KILL_SWITCH_ACTIVE",
          error:
            "Studio AI Gateway is paused via Studio Pulse Kill Switch. Switch directly to Free Tools or submit a Smart Brief.",
        },
        { status: 503 }
      );
    }

    const assistant = ASSISTANT_CATALOG[parsed.data.assistantId];
    const lines = assistant.buildResponse(parsed.data.prompt);

    return NextResponse.json({
      ok: true,
      gatewayMode: process.env.PUTER_SERVER_TOKEN
        ? "PUTER_SPONSORED_SERVER_GATEWAY"
        : "DEMO_AI_ADAPTER_NO_PUTER_LOGIN",
      assistantId: parsed.data.assistantId,
      assistantTitle: assistant.title,
      recommendedServiceId: assistant.recommendedServiceId,
      recommendedKitSku: assistant.recommendedKitSku,
      estimatedCostBdt: assistant.estimatedCostBdt,
      puterLoginRequired: false,
      lines,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process Studio AI request.",
      },
      { status: 400 }
    );
  }
}

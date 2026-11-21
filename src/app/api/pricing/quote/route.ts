import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalogServices, getAllAddOns } from "@/lib/catalog";
import {
  calculatePricingSummary,
  evaluateExpress10MinEligibility,
} from "@/lib/pricing/engine";
import type { Currency, ServiceConfig } from "@/types/domain";

const ServiceConfigSchema = z.object({
  variantId: z.string().max(40).optional(),
  format: z.string().max(120).optional(),
  duration: z.string().max(80).optional(),
  aspectRatio: z.string().max(80).optional(),
  quantity: z.number().int().min(1).max(100).optional(),
  rush: z.boolean().optional(),
  express10Min: z.boolean().optional(),
  sourceFilesReady: z.boolean().optional(),
  singleMicroEditConfirmed: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

const QuoteRequestSchema = z.object({
  serviceIds: z.array(z.string().max(40)).max(20).default([]),
  serviceConfigs: z.record(z.string().max(40), ServiceConfigSchema).default({}),
  selectedAddOns: z.record(z.string().max(40), z.array(z.string().max(40)).max(20)).default({}),
  currency: z.enum(["BDT", "USD"]).default("BDT"),
  bundleId: z.string().max(40).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = QuoteRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid quote estimator payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { serviceIds, serviceConfigs, selectedAddOns, currency, bundleId } = parsed.data;
    const serverNow = new Date();

    const [catalogServices, catalogAddOns] = await Promise.all([
      getCatalogServices(),
      getAllAddOns(),
    ]);

    const pricing = calculatePricingSummary({
      serviceIds,
      serviceConfigs: serviceConfigs as Record<string, ServiceConfig>,
      selectedAddOns,
      currency: currency as Currency,
      catalogServices,
      catalogAddOns,
      bundleId: bundleId ?? null,
      // Always evaluate launch promotion against the authoritative server clock
      evaluationDate: serverNow,
    });

    const expressChecks = serviceIds.map((serviceId) => {
      const cfg = serviceConfigs[serviceId] || {};
      return {
        serviceId,
        ...evaluateExpress10MinEligibility({
          serviceId,
          sourceFilesReady: cfg.sourceFilesReady,
          singleMicroEditConfirmed: cfg.singleMicroEditConfirmed,
          // Studio slot confirmation must come from an admin/desk verification
          studioSlotConfirmed: false,
        }),
      };
    });

    return NextResponse.json({
      ok: true,
      evaluatedAt: serverNow.toISOString(),
      pricing,
      expressChecks,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate pricing";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { getCatalogServices, getAllAddOns } from "@/lib/catalog";
import {
  calculatePricingSummary,
  evaluateExpress10MinEligibility,
} from "@/lib/pricing/engine";
import type { Currency, ServiceConfig } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serviceIds: string[] = Array.isArray(body.serviceIds)
      ? body.serviceIds
      : [];
    const serviceConfigs: Record<string, ServiceConfig> =
      typeof body.serviceConfigs === "object" && body.serviceConfigs !== null
        ? body.serviceConfigs
        : {};
    const selectedAddOns: Record<string, string[]> =
      typeof body.selectedAddOns === "object" && body.selectedAddOns !== null
        ? body.selectedAddOns
        : {};
    const currency: Currency = body.currency === "USD" ? "USD" : "BDT";
    const bundleId: string | null =
      typeof body.bundleId === "string" ? body.bundleId : null;
    const evaluationDate: string | undefined =
      typeof body.evaluationDate === "string" ? body.evaluationDate : undefined;

    const [catalogServices, catalogAddOns] = await Promise.all([
      getCatalogServices(),
      getAllAddOns(),
    ]);

    const pricing = calculatePricingSummary({
      serviceIds,
      serviceConfigs,
      selectedAddOns,
      currency,
      catalogServices,
      catalogAddOns,
      bundleId,
      evaluationDate,
    });

    const expressChecks = serviceIds.map((serviceId) => {
      const cfg = serviceConfigs[serviceId] || {};
      return {
        serviceId,
        ...evaluateExpress10MinEligibility({
          serviceId,
          sourceFilesReady: cfg.sourceFilesReady,
          singleMicroEditConfirmed: cfg.singleMicroEditConfirmed,
        }),
      };
    });

    return NextResponse.json({
      ok: true,
      pricing,
      expressChecks,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate pricing";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

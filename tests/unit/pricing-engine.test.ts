import { describe, expect, it } from "vitest";
import {
  calculatePricingSummary,
  evaluateExpress10MinEligibility,
  isLaunchPromoActive,
} from "@/lib/pricing/engine";
import { CANONICAL_SERVICES, CANONICAL_ADDONS } from "@/lib/catalog";

describe("Server-Authoritative Hourly Pricing Engine (Creative Office OS 2.0)", () => {
  it("calculates base BDT and scoped hours accurately for SRV-01 (6h * 1500 = 9000 BDT)", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["SRV-01"],
      serviceConfigs: { "SRV-01": { quantity: 1 } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
    });

    expect(summary.totalScopedHours).toBe(6);
    expect(summary.subtotalBDT).toBe(9000);
    expect(summary.rushSurchargeBDT).toBe(0);
    expect(summary.finalBDT).toBe(9000);
    expect(summary.quoteRequired).toBe(false);
  });

  it("retires the unapproved default +35% rush surcharge (rushSurchargeRate defaults to 0)", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["SRV-01"],
      serviceConfigs: { "SRV-01": { quantity: 1, rush: true } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
    });

    expect(summary.rushSurchargeBDT).toBe(0);
    expect(summary.finalBDT).toBe(9000);
  });

  it("applies scoped variant multiplier and compatible add-on hours accurately", () => {
    // SRV-03 (10h base) with VAR-05 (1.4x = 14h -> 21,000 BDT) + ADD-01 (2h -> 3,000 BDT)
    const summary = calculatePricingSummary({
      serviceIds: ["SRV-03"],
      serviceConfigs: { "SRV-03": { quantity: 1, variantId: "VAR-05" } },
      selectedAddOns: { "SRV-03": ["ADD-01"] },
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
    });

    expect(summary.totalScopedHours).toBe(16);
    expect(summary.subtotalBDT).toBe(21000);
    expect(summary.addOnsTotalBDT).toBe(3000);
    expect(summary.finalBDT).toBe(24000);
  });

  it("applies the 5% Launch Promotion strictly between 20 Nov and 15 Dec 2026 (Asia/Dhaka)", () => {
    expect(isLaunchPromoActive("2026-11-19")).toBe(false);
    expect(isLaunchPromoActive("2026-11-20")).toBe(true);
    expect(isLaunchPromoActive("2026-12-01")).toBe(true);
    expect(isLaunchPromoActive("2026-12-15")).toBe(true);
    expect(isLaunchPromoActive("2026-12-16")).toBe(false);

    const activeSummary = calculatePricingSummary({
      serviceIds: ["SRV-01"], // 9000 BDT
      serviceConfigs: { "SRV-01": { quantity: 1 } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
      evaluationDate: "2026-11-25",
    });

    expect(activeSummary.promoActive).toBe(true);
    expect(activeSummary.promoDiscountBDT).toBe(450); // 5% of 9000
    expect(activeSummary.finalBDT).toBe(8550);

    const expiredSummary = calculatePricingSummary({
      serviceIds: ["SRV-01"],
      serviceConfigs: { "SRV-01": { quantity: 1 } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
      evaluationDate: "2026-12-20",
    });

    expect(expiredSummary.promoActive).toBe(false);
    expect(expiredSummary.promoDiscountBDT).toBe(0);
    expect(expiredSummary.finalBDT).toBe(9000);
  });

  it("enforces 10-minute Express Delivery preflight rules (only SRV-02, SRV-05, SRV-13 with ready source files)", () => {
    const passCheck = evaluateExpress10MinEligibility({
      serviceId: "SRV-02",
      sourceFilesReady: true,
      singleMicroEditConfirmed: true,
    });
    expect(passCheck.eligible).toBe(true);

    const missingSourceCheck = evaluateExpress10MinEligibility({
      serviceId: "SRV-02",
      sourceFilesReady: false,
      singleMicroEditConfirmed: true,
    });
    expect(missingSourceCheck.eligible).toBe(false);

    const ineligibleServiceCheck = evaluateExpress10MinEligibility({
      serviceId: "SRV-03",
      sourceFilesReady: true,
      singleMicroEditConfirmed: true,
    });
    expect(ineligibleServiceCheck.eligible).toBe(false);
    expect(ineligibleServiceCheck.serviceEligible).toBe(false);
  });

  it("safely sanitizes negative quantities and triggers quoteRequired when scope exceeds 150,000 BDT", () => {
    const clamped = calculatePricingSummary({
      serviceIds: ["SRV-01"],
      serviceConfigs: { "SRV-01": { quantity: -10 } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
    });
    expect(clamped.subtotalBDT).toBe(9000);

    const highVolume = calculatePricingSummary({
      serviceIds: ["SRV-03"], // 15,000 BDT * 12 = 180,000 BDT
      serviceConfigs: { "SRV-03": { quantity: 12 } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
    });
    expect(highVolume.quoteRequired).toBe(true);
  });
});

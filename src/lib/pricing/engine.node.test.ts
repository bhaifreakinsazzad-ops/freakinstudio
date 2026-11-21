import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePricingSummary,
  evaluateExpress10MinEligibility,
  isLaunchPromoActive,
} from "./engine";
import {
  CANONICAL_DISCIPLINES,
  CANONICAL_SERVICES,
  CANONICAL_VARIANTS,
  CANONICAL_BUNDLES,
  CANONICAL_ADDONS,
  CANONICAL_AI_MICRO_KITS,
  CANONICAL_CONCEPT_WORKS,
} from "../catalog";

describe("Creative Office OS 2.0 — Pure Logic Node Test Suite", () => {
  it("verifies exact 4/13/15/5/14 catalog counts and 3 AI Micro-Kits", () => {
    assert.equal(CANONICAL_DISCIPLINES.length, 4);
    assert.equal(CANONICAL_SERVICES.length, 13);
    assert.equal(CANONICAL_VARIANTS.length, 15);
    assert.equal(CANONICAL_BUNDLES.length, 5);
    assert.equal(CANONICAL_ADDONS.length, 14);
    assert.equal(CANONICAL_AI_MICRO_KITS.length, 3);
    assert.equal(CANONICAL_CONCEPT_WORKS.length, 4);
  });

  it("evaluates 5% launch promotion window (20 Nov - 15 Dec 2026 Asia/Dhaka)", () => {
    assert.equal(isLaunchPromoActive("2026-11-19"), false);
    assert.equal(isLaunchPromoActive("2026-11-20"), true);
    assert.equal(isLaunchPromoActive("2026-12-15"), true);
    assert.equal(isLaunchPromoActive("2026-12-16"), false);
  });

  it("computes hourly scoped pricing with 0% default rush and 5% launch promo", () => {
    const res = calculatePricingSummary({
      serviceIds: ["SRV-01"],
      serviceConfigs: { "SRV-01": { quantity: 1, rush: true } },
      selectedAddOns: { "SRV-01": ["ADD-01"] },
      currency: "BDT",
      catalogServices: CANONICAL_SERVICES,
      catalogAddOns: CANONICAL_ADDONS,
      evaluationDate: "2026-11-25",
    });

    assert.equal(res.totalScopedHours, 8); // 6h base + 2h ADD-01
    assert.equal(res.rushSurchargeBDT, 0); // +35% retired
    assert.equal(res.subtotalBDT, 9000);
    assert.equal(res.addOnsTotalBDT, 3000);
    assert.equal(res.promoDiscountBDT, 600); // 5% of 12,000
    assert.equal(res.finalBDT, 11400);
  });

  it("gates 10-minute express delivery strictly to SRV-02, SRV-05, and SRV-13", () => {
    const ok = evaluateExpress10MinEligibility({
      serviceId: "SRV-05",
      sourceFilesReady: true,
      singleMicroEditConfirmed: true,
    });
    assert.equal(ok.eligible, true);

    const denied = evaluateExpress10MinEligibility({
      serviceId: "SRV-10",
      sourceFilesReady: true,
      singleMicroEditConfirmed: true,
    });
    assert.equal(denied.eligible, false);
  });
});

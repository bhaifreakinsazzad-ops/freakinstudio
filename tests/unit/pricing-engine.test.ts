import { describe, expect, it } from "vitest";
import { calculatePricingSummary } from "@/lib/pricing/engine";
import type { Service, AddOn } from "@/types/domain";

const mockServices: Service[] = [
  {
    id: "A01",
    category_id: "A",
    title: "Social Media Graphics",
    title_bn: "সোশ্যাল মিডিয়া গ্রাফিক্স",
    base_usd: 45,
    base_bdt: 5500,
    days: 2,
    revisions: 3,
    pricing_status: "approved",
    created_at: "",
    updated_at: "",
  },
  {
    id: "A02",
    category_id: "A",
    title: "Promotional Creatives",
    title_bn: "প্রমোশনাল ক্রিয়েটিভ",
    base_usd: 60,
    base_bdt: 7200,
    days: 3,
    revisions: 3,
    pricing_status: "approved",
    created_at: "",
    updated_at: "",
  },
  {
    id: "B02",
    category_id: "B",
    title: "Complete Brand Identity",
    title_bn: "ব্র্যান্ড আইডেন্টিটি",
    base_usd: 450,
    base_bdt: 55000,
    days: 12,
    revisions: 5,
    pricing_status: "quote_required",
    created_at: "",
    updated_at: "",
  },
];

const mockAddOns: AddOn[] = [
  {
    id: "addon-1",
    label: "Editable Source Files",
    unit_price_usd: 25,
    unit_price_bdt: 3000,
  },
  {
    id: "addon-2",
    label: "Extra Adaptation",
    unit_price_usd: 25,
    unit_price_bdt: 3000,
  },
];

describe("Server-Authoritative Pricing Engine", () => {
  it("calculates base BDT pricing correctly with single service", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 1, rush: false } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.subtotalBDT).toBe(5500);
    expect(summary.finalBDT).toBe(5500);
    expect(summary.rushSurchargeBDT).toBe(0);
    expect(summary.quoteRequired).toBe(false);
  });

  it("calculates base USD pricing correctly", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 2, rush: false } },
      selectedAddOns: {},
      currency: "USD",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.subtotalUSD).toBe(90);
    expect(summary.finalUSD).toBe(90);
    expect(summary.quoteRequired).toBe(false);
  });

  it("safely sanitizes negative quantities and non-numeric tamper inputs", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: -10, rush: false } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.subtotalBDT).toBe(5500); // clamped to 1
  });

  it("applies 35% rush delivery surcharge correctly when requested", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 1, rush: true } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    // 5500 * 0.35 = 1925
    expect(summary.subtotalBDT).toBe(5500);
    expect(summary.rushSurchargeBDT).toBe(1925);
    expect(summary.finalBDT).toBe(5500 + 1925);
  });

  it("adds compatible add-on prices to total", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 1, rush: false } },
      selectedAddOns: { A01: ["addon-1", "addon-2"] },
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.addOnsTotalBDT).toBe(6000); // 3000 * 2
    expect(summary.finalBDT).toBe(5500 + 6000);
  });

  it("triggers quoteRequired when a service is marked quote_required", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["B02"],
      serviceConfigs: { B02: { quantity: 1, rush: false } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.quoteRequired).toBe(true);
    expect(summary.quoteReasons.length).toBeGreaterThan(0);
    expect(summary.quoteReasons[0]).toContain("requires formal studio scoping");
  });

  it("triggers quoteRequired when scope total exceeds 150,000 BDT threshold", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 30, rush: false } }, // 30 * 5500 = 165,000
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
    });

    expect(summary.subtotalBDT).toBe(165000);
    expect(summary.quoteRequired).toBe(true);
    expect(
      summary.quoteReasons.some((r) =>
        r.includes("exceeds the self-service checkout limit")
      )
    ).toBe(true);
  });

  it("respects administrative pricing policy overrides for rush surcharge rate", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01"],
      serviceConfigs: { A01: { quantity: 1, rush: true } },
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
      policy: { rushSurchargeRate: 0.2 }, // 20% override instead of default 35%
    });

    // 5500 * 0.20 = 1100
    expect(summary.rushSurchargeBDT).toBe(1100);
    expect(summary.finalBDT).toBe(5500 + 1100);
  });

  it("permits direct checkout of 6+ services when administrative quote gating is disabled", () => {
    const summary = calculatePricingSummary({
      serviceIds: ["A01", "A02", "A01", "A02", "A01", "A02"],
      serviceConfigs: {},
      selectedAddOns: {},
      currency: "BDT",
      catalogServices: mockServices,
      catalogAddOns: mockAddOns,
      policy: { enableQuoteGating: false },
    });

    expect(summary.quoteRequired).toBe(false);
  });
});

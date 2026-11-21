import type {
  AddOn,
  Currency,
  PricingBreakdownItem,
  PricingSummary,
  Service,
  ServiceConfig,
} from "@/types/domain";
import {
  CANONICAL_BUNDLES,
  CANONICAL_HOURLY_RATE_BDT,
  CANONICAL_HOURLY_RATE_USD,
  CANONICAL_VARIANTS,
  RATEBOOK_VERSION,
} from "@/lib/catalog";

/**
 * Authoritative Server-Side Hourly & Scoped Pricing Engine (Creative Office OS 2.0)
 *
 * Rules enforced:
 * 1. Hourly Calculation Formula:
 *    Scoped Service Hours = (Base Service Hours × Variant Multiplier × Quantity) + Selected Add-on Hours
 *    Monetary Subtotal = Scoped Hours × Approved Hourly Rate (or explicit service base rate)
 * 2. Launch Promotion Window (5% Discount):
 *    Valid strictly from 20 Nov 2026 00:00:00 to 15 Dec 2026 23:59:59 (Asia/Dhaka, UTC+06:00).
 *    Defaults to current server clock when evaluationDate is omitted.
 * 3. Unapproved +35% Rush Surcharge Retired:
 *    Default rushSurchargeRate is 0. Express 10-minute delivery is strictly preflight-gated for
 *    eligible single-file micro-edits (SRV-02, SRV-05, SRV-13) with ready source files AND
 *    explicit studio desk slot confirmation (`studioSlotConfirmed === true`).
 * 4. Pending Ratebook v8/v8.1 Gating:
 *    Services or bundles with `pricing_status === "quote_required"` set `quoteRequired = true`
 *    and block direct self-serve checkout until studio quotation or Ratebook v8/v8.1 approval.
 */

export const LAUNCH_PROMO_START_DHAKA = "2026-11-20T00:00:00+06:00";
export const LAUNCH_PROMO_END_DHAKA = "2026-12-15T23:59:59+06:00";
export const LAUNCH_PROMO_RATE = 0.05;

export function isLaunchPromoActive(
  referenceDate: string | Date = new Date()
): boolean {
  const target =
    typeof referenceDate === "string"
      ? referenceDate.length === 10
        ? new Date(`${referenceDate}T12:00:00+06:00`)
        : new Date(referenceDate)
      : referenceDate;

  if (Number.isNaN(target.getTime())) return false;

  const start = new Date(LAUNCH_PROMO_START_DHAKA).getTime();
  const end = new Date(LAUNCH_PROMO_END_DHAKA).getTime();
  const ts = target.getTime();
  return ts >= start && ts <= end;
}

export interface ExpressPreflightResult {
  eligible: boolean;
  serviceEligible: boolean;
  reasons: string[];
}

export function evaluateExpress10MinEligibility(params: {
  serviceId: string;
  sourceFilesReady?: boolean;
  singleMicroEditConfirmed?: boolean;
  studioSlotConfirmed?: boolean;
}): ExpressPreflightResult {
  const eligibleServices = new Set(["SRV-02", "SRV-05", "SRV-13"]);
  const serviceEligible = eligibleServices.has(params.serviceId);
  const reasons: string[] = [];

  if (!serviceEligible) {
    reasons.push(
      `Service ${params.serviceId} is a multi-hour production workflow and is ineligible for 10-Minute Express.`
    );
  }
  if (!params.sourceFilesReady) {
    reasons.push("Open vector/working source files must be ready and attached.");
  }
  if (!params.singleMicroEditConfirmed) {
    reasons.push(
      "Scope must be a single micro-edit (text swap, vector fix, or end-slate update)."
    );
  }
  if (params.studioSlotConfirmed !== true) {
    reasons.push("Live studio production desk slot must be explicitly confirmed.");
  }

  return {
    eligible:
      serviceEligible &&
      params.sourceFilesReady === true &&
      params.singleMicroEditConfirmed === true &&
      params.studioSlotConfirmed === true,
    serviceEligible,
    reasons,
  };
}

export interface PricingPolicyConfig {
  /** Surcharge multiplier for legacy rush override (Default: 0 — unapproved +35% retired) */
  rushSurchargeRate: number;
  /** Maximum number of distinct services before enterprise quote gating triggers */
  maxSelfServiceItems: number;
  /** Maximum BDT order total before enterprise quote gating triggers */
  maxSelfServiceTotalBDT: number;
  /** Maximum USD order total before enterprise quote gating triggers */
  maxSelfServiceTotalUSD: number;
  /** Whether quote-gating rules are active */
  enableQuoteGating: boolean;
  /** Canonical hourly rates */
  hourlyRateBDT: number;
  hourlyRateUSD: number;
  /** Optional reference date for 5% launch promotion evaluation (Asia/Dhaka) */
  evaluationDate?: string | Date;
}

export const DEFAULT_PRICING_POLICY: PricingPolicyConfig = {
  rushSurchargeRate: 0,
  maxSelfServiceItems: 5,
  maxSelfServiceTotalBDT: 150_000,
  maxSelfServiceTotalUSD: 1_250,
  enableQuoteGating: true,
  hourlyRateBDT: CANONICAL_HOURLY_RATE_BDT,
  hourlyRateUSD: CANONICAL_HOURLY_RATE_USD,
};

export const APPROVED_ENTERPRISE_POLICY: PricingPolicyConfig =
  DEFAULT_PRICING_POLICY;

export interface PricingEngineInput {
  serviceIds: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  currency: Currency;
  catalogServices: Service[];
  catalogAddOns: AddOn[];
  bundleId?: string | null;
  evaluationDate?: string | Date;
  policy?: Partial<PricingPolicyConfig>;
}

export function calculatePricingSummary(
  input: PricingEngineInput
): PricingSummary {
  const {
    serviceIds,
    serviceConfigs,
    selectedAddOns,
    currency,
    catalogServices,
    catalogAddOns,
    bundleId,
    evaluationDate,
    policy: policyOverrides,
  } = input;

  const policy: PricingPolicyConfig = {
    ...DEFAULT_PRICING_POLICY,
    ...policyOverrides,
  };

  const serviceMap = new Map<string, Service>(
    catalogServices.map((s) => [s.id, s])
  );
  const addOnMap = new Map<string, AddOn>(
    catalogAddOns.map((a) => [a.id, a])
  );

  const items: PricingBreakdownItem[] = [];
  let subtotalBDT = 0;
  let subtotalUSD = 0;
  let rushSurchargeBDT = 0;
  let rushSurchargeUSD = 0;
  let addOnsTotalBDT = 0;
  let addOnsTotalUSD = 0;
  let totalScopedHours = 0;
  let quoteRequired = false;
  const quoteReasons: string[] = [];

  const uniqueServiceIds = Array.from(new Set(serviceIds));
  const selectedBundle = bundleId
    ? CANONICAL_BUNDLES.find((b) => b.id === bundleId)
    : undefined;

  if (bundleId && !selectedBundle) {
    quoteRequired = true;
    quoteReasons.push(`Unknown commercial bundle '${bundleId}' requires manual scoping.`);
  }

  for (const serviceId of uniqueServiceIds) {
    const service = serviceMap.get(serviceId);
    if (!service) {
      quoteRequired = true;
      quoteReasons.push(
        `Unknown catalog service '${serviceId}' cannot be priced automatically.`
      );
      continue;
    }

    const config = serviceConfigs[serviceId] || {};
    const rawQty = Number(config.quantity);
    const quantity =
      Number.isFinite(rawQty) && rawQty >= 1
        ? Math.min(Math.floor(rawQty), 100)
        : 1;
    const rushApplied = Boolean(config.rush);

    const variant = config.variantId
      ? CANONICAL_VARIANTS.find(
          (v) => v.id === config.variantId && v.serviceId === service.id
        )
      : undefined;

    if (config.variantId && !variant) {
      quoteRequired = true;
      quoteReasons.push(
        `Variant '${config.variantId}' does not belong to ${service.id}; formal review required.`
      );
    }

    const baseServiceHours =
      typeof service.estimated_hours === "number" && service.estimated_hours > 0
        ? service.estimated_hours
        : Math.max(1, Math.round(service.base_bdt / policy.hourlyRateBDT));

    const unitHours = variant
      ? Math.max(1, Math.round(baseServiceHours * variant.hourMultiplier))
      : baseServiceHours;

    // Preserve DB-approved unit pricing when present without hardcoded multiplier drift
    const unitPriceBDT = variant
      ? Math.round(service.base_bdt * variant.hourMultiplier)
      : service.base_bdt;
    const unitPriceUSD = variant
      ? Math.round(service.base_usd * variant.hourMultiplier)
      : service.base_usd;

    const baseLineBDT = unitPriceBDT * quantity;
    const baseLineUSD = unitPriceUSD * quantity;

    const rushFeeBDT =
      rushApplied && policy.rushSurchargeRate > 0
        ? Math.round(baseLineBDT * policy.rushSurchargeRate)
        : 0;
    const rushFeeUSD =
      rushApplied && policy.rushSurchargeRate > 0
        ? Math.round(baseLineUSD * policy.rushSurchargeRate)
        : 0;

    const addOnIds = Array.from(new Set(selectedAddOns[serviceId] || []));
    const resolvedAddOns: PricingBreakdownItem["selectedAddOns"] = [];
    let itemAddOnsBDT = 0;
    let itemAddOnsUSD = 0;
    let itemAddOnsHours = 0;

    for (const addOnId of addOnIds) {
      const addon = addOnMap.get(addOnId);
      if (!addon) {
        quoteRequired = true;
        quoteReasons.push(`Unknown add-on '${addOnId}' requires studio scoping.`);
        continue;
      }
      if (
        Array.isArray(addon.compatible_services) &&
        addon.compatible_services.length > 0 &&
        !addon.compatible_services.includes(service.id)
      ) {
        quoteRequired = true;
        quoteReasons.push(
          `Add-on '${addon.id}' is not pre-compatible with ${service.id} and requires manual scoping.`
        );
        continue;
      }
      resolvedAddOns.push({
        id: addon.id,
        label: addon.label,
        priceBDT: addon.unit_price_bdt,
        priceUSD: addon.unit_price_usd,
        extraHours: addon.extra_hours,
      });
      itemAddOnsBDT += addon.unit_price_bdt;
      itemAddOnsUSD += addon.unit_price_usd;
      itemAddOnsHours +=
        typeof addon.extra_hours === "number"
          ? addon.extra_hours
          : Math.round(addon.unit_price_bdt / policy.hourlyRateBDT);
    }

    const lineScopedHours = unitHours * quantity + itemAddOnsHours;
    const lineTotalBDT = baseLineBDT + rushFeeBDT + itemAddOnsBDT;
    const lineTotalUSD = baseLineUSD + rushFeeUSD + itemAddOnsUSD;

    subtotalBDT += baseLineBDT;
    subtotalUSD += baseLineUSD;
    rushSurchargeBDT += rushFeeBDT;
    rushSurchargeUSD += rushFeeUSD;
    addOnsTotalBDT += itemAddOnsBDT;
    addOnsTotalUSD += itemAddOnsUSD;
    totalScopedHours += lineScopedHours;

    if (
      policy.enableQuoteGating &&
      service.pricing_status === "quote_required"
    ) {
      quoteRequired = true;
      quoteReasons.push(
        `${service.title} (${service.id}) is reference-scoped pending Owner Ratebook v8/v8.1 approval.`
      );
    }

    items.push({
      serviceId: service.id,
      title: service.title,
      basePriceBDT: unitPriceBDT,
      basePriceUSD: unitPriceUSD,
      quantity,
      rushApplied,
      rushFeeBDT,
      rushFeeUSD,
      selectedAddOns: resolvedAddOns,
      lineTotalBDT,
      lineTotalUSD,
      pricingStatus: service.pricing_status as "approved" | "quote_required",
      scopedHours: lineScopedHours,
      variantId: variant?.id,
      expressEligible: Boolean(service.express_eligible),
    });
  }

  // Optional bundle base handling when no individual services overrode it
  if (selectedBundle && items.length === 0) {
    subtotalBDT = selectedBundle.baseBdt;
    subtotalUSD = selectedBundle.baseUsd;
    totalScopedHours = selectedBundle.estimatedHours;
    if (
      policy.enableQuoteGating &&
      selectedBundle.pricingStatus !== "approved"
    ) {
      quoteRequired = true;
      quoteReasons.push(
        `Bundle ${selectedBundle.title} (${selectedBundle.id}) is reference-scoped pending Ratebook v8/v8.1 approval.`
      );
    }
  } else if (selectedBundle && policy.enableQuoteGating && selectedBundle.pricingStatus !== "approved") {
    quoteRequired = true;
    quoteReasons.push(
      `Bundle ${selectedBundle.title} (${selectedBundle.id}) requires studio quotation.`
    );
  }

  if (items.length === 0 && !selectedBundle) {
    quoteRequired = true;
    quoteReasons.push("Select at least one valid catalog service or bundle.");
  }

  const grossBDT = subtotalBDT + rushSurchargeBDT + addOnsTotalBDT;
  const grossUSD = subtotalUSD + rushSurchargeUSD + addOnsTotalUSD;

  // Evaluate 5% Launch Promotion Window (20 Nov – 15 Dec 2026 Asia/Dhaka) using server clock if omitted
  const promoDate = evaluationDate ?? policy.evaluationDate ?? new Date();
  const promoActive = isLaunchPromoActive(promoDate);
  const promoDiscountBDT = promoActive
    ? Math.round(grossBDT * LAUNCH_PROMO_RATE)
    : 0;
  const promoDiscountUSD = promoActive
    ? Math.round(grossUSD * LAUNCH_PROMO_RATE)
    : 0;

  const finalBDT = Math.max(0, grossBDT - promoDiscountBDT);
  const finalUSD = Math.max(0, grossUSD - promoDiscountUSD);

  if (policy.enableQuoteGating) {
    if (uniqueServiceIds.length > policy.maxSelfServiceItems) {
      quoteRequired = true;
      quoteReasons.push(
        `Multi-discipline package (${uniqueServiceIds.length} services) exceeds standard ${policy.maxSelfServiceItems}-service checkout threshold.`
      );
    }

    if (
      finalBDT > policy.maxSelfServiceTotalBDT ||
      finalUSD > policy.maxSelfServiceTotalUSD
    ) {
      quoteRequired = true;
      quoteReasons.push(
        "Scope volume exceeds the self-service checkout limit and qualifies for a dedicated enterprise production quote."
      );
    }
  }

  return {
    items,
    subtotalBDT,
    subtotalUSD,
    rushSurchargeBDT,
    rushSurchargeUSD,
    addOnsTotalBDT,
    addOnsTotalUSD,
    promoDiscountBDT,
    promoDiscountUSD,
    promoActive,
    promoLabel: promoActive
      ? "5% Launch Window Promotion (20 Nov – 15 Dec 2026)"
      : "Outside Launch Promo Window (0%)",
    totalScopedHours,
    hourlyRateBDT: policy.hourlyRateBDT,
    hourlyRateUSD: policy.hourlyRateUSD,
    ratebookVersion: RATEBOOK_VERSION,
    finalBDT,
    finalUSD,
    currency,
    quoteRequired,
    quoteReasons: Array.from(new Set(quoteReasons)),
  };
}

import type {
  Service,
  AddOn,
  ServiceConfig,
  Currency,
  PricingSummary,
} from "@/types/domain";

export interface PricingPolicyConfig {
  version: string;
  rushSurchargeRate: number; // e.g. 0.35 for +35%; defaults to 0 (unapproved rules default to inactive)
  maxDirectCheckoutServices: number; // e.g. 5 services max (0 to disable)
  maxDirectCheckoutBDT: number; // e.g. 150000 (0 to disable)
  maxDirectCheckoutUSD: number; // e.g. 1250 (0 to disable)
  enableQuoteGating: boolean; // master toggle for quote requirements (defaults to false for unapproved policies)
}

/**
 * Canonical default policy.
 * When ENABLE_UNAPPROVED_PRICING is set to "false" (or not approved), unapproved surcharges
 * default to inactive (0). Otherwise defaults to standard studio policies.
 */
const isUnapprovedPricingEnabled =
  typeof process !== "undefined" &&
  process.env?.ENABLE_UNAPPROVED_PRICING === "false"
    ? false
    : true;

export const DEFAULT_PRICING_POLICY: PricingPolicyConfig = {
  version: "1.0.0-canonical-standard",
  rushSurchargeRate: isUnapprovedPricingEnabled ? 0.35 : 0,
  maxDirectCheckoutServices: isUnapprovedPricingEnabled ? 5 : 0,
  maxDirectCheckoutBDT: isUnapprovedPricingEnabled ? 150000 : 0,
  maxDirectCheckoutUSD: isUnapprovedPricingEnabled ? 1250 : 0,
  enableQuoteGating: isUnapprovedPricingEnabled,
};

/**
 * Versioned administrative policy template for when studio operations
 * formally enables priority rush surcharge (+35%) and enterprise volume gating.
 */
export const APPROVED_ENTERPRISE_POLICY: PricingPolicyConfig = {
  version: "1.0.0-approved-enterprise",
  rushSurchargeRate: 0.35,
  maxDirectCheckoutServices: 5,
  maxDirectCheckoutBDT: 150000,
  maxDirectCheckoutUSD: 1250,
  enableQuoteGating: true,
};

export interface PricingEngineInput {
  serviceIds: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  currency: Currency;
  catalogServices: Service[];
  catalogAddOns: AddOn[];
  policy?: Partial<PricingPolicyConfig>;
}

export function calculatePricingSummary({
  serviceIds,
  serviceConfigs,
  selectedAddOns,
  currency,
  catalogServices,
  catalogAddOns,
  policy = {},
}: PricingEngineInput): PricingSummary {
  const activePolicy: PricingPolicyConfig = {
    ...DEFAULT_PRICING_POLICY,
    ...policy,
  };

  const serviceMap = new Map<string, Service>();
  catalogServices.forEach((s) => serviceMap.set(s.id, s));

  const addOnMap = new Map<string, AddOn>();
  catalogAddOns.forEach((a) => addOnMap.set(a.id, a));

  let subtotalBDT = 0;
  let subtotalUSD = 0;
  let rushSurchargeBDT = 0;
  let rushSurchargeUSD = 0;
  let addOnsTotalBDT = 0;
  let addOnsTotalUSD = 0;

  const quoteReasons: string[] = [];
  let quoteRequired = false;

  // Gate 1: Check total service count ONLY if gating policy is explicitly enabled
  if (
    activePolicy.enableQuoteGating &&
    activePolicy.maxDirectCheckoutServices > 0 &&
    serviceIds.length > activePolicy.maxDirectCheckoutServices
  ) {
    quoteRequired = true;
    quoteReasons.push(
      `Package contains ${serviceIds.length} services (exceeds standard ${activePolicy.maxDirectCheckoutServices}-service checkout threshold). Enterprise quotation required.`
    );
  }

  // Calculate per-service costs with strict decimal arithmetic
  for (const sid of serviceIds) {
    const srv = serviceMap.get(sid);
    if (!srv) continue;

    // Services marked quote_required ALWAYS trigger quotation gating (catalog authority)
    if (srv.pricing_status === "quote_required") {
      quoteRequired = true;
      quoteReasons.push(
        `Service "${srv.id} — ${srv.title}" requires formal studio scoping and quotation.`
      );
    }

    const config = serviceConfigs[sid] || { quantity: 1, rush: false };
    // Tamper-proof integer sanitation
    const qty = Math.max(1, Math.floor(Number(config.quantity) || 1));

    const serviceBaseBDT = Math.round(Number(srv.base_bdt) * qty * 100) / 100;
    const serviceBaseUSD = Math.round(Number(srv.base_usd) * qty * 100) / 100;

    subtotalBDT += serviceBaseBDT;
    subtotalUSD += serviceBaseUSD;

    // Apply rush priority surcharge ONLY if approved in active policy
    if (config.rush && activePolicy.rushSurchargeRate > 0) {
      const rushBDT = Math.round(serviceBaseBDT * activePolicy.rushSurchargeRate);
      const rushUSD =
        Math.round(serviceBaseUSD * activePolicy.rushSurchargeRate * 100) / 100;
      rushSurchargeBDT += rushBDT;
      rushSurchargeUSD += rushUSD;
    }

    // Add-ons for this service — validated against catalog unit prices
    const attachedAddOnIds = selectedAddOns[sid] || [];
    for (const aId of attachedAddOnIds) {
      const addOn = addOnMap.get(aId);
      if (addOn) {
        addOnsTotalBDT += Number(addOn.unit_price_bdt || 0);
        addOnsTotalUSD += Number(addOn.unit_price_usd || 0);
      }
    }
  }

  const finalBDT = Math.round((subtotalBDT + rushSurchargeBDT + addOnsTotalBDT) * 100) / 100;
  const finalUSD = Math.round((subtotalUSD + rushSurchargeUSD + addOnsTotalUSD) * 100) / 100;

  // Gate 2: High-value budget threshold ONLY if policy is explicitly enabled
  if (activePolicy.enableQuoteGating) {
    const bdtExceeded =
      activePolicy.maxDirectCheckoutBDT > 0 &&
      finalBDT > activePolicy.maxDirectCheckoutBDT;
    const usdExceeded =
      activePolicy.maxDirectCheckoutUSD > 0 &&
      finalUSD > activePolicy.maxDirectCheckoutUSD;

    if (bdtExceeded || usdExceeded) {
      quoteRequired = true;
      quoteReasons.push(
        `Total investment (৳ ${finalBDT.toLocaleString()} / $ ${finalUSD.toLocaleString()}) exceeds the self-service checkout limit. Requires commercial review.`
      );
    }
  }

  return {
    currency,
    subtotalBDT,
    subtotalUSD,
    rushSurchargeBDT,
    rushSurchargeUSD,
    addOnsTotalBDT,
    addOnsTotalUSD,
    finalBDT,
    finalUSD,
    quoteRequired,
    quoteReasons: Array.from(new Set(quoteReasons)),
  };
}

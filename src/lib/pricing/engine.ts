import type {
  Service,
  AddOn,
  ServiceConfig,
  Currency,
  PricingSummary,
} from "@/types/domain";

export interface PricingEngineInput {
  serviceIds: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  selectedAddOns: Record<string, string[]>;
  currency: Currency;
  catalogServices: Service[];
  catalogAddOns: AddOn[];
}

export function calculatePricingSummary({
  serviceIds,
  serviceConfigs,
  selectedAddOns,
  currency,
  catalogServices,
  catalogAddOns,
}: PricingEngineInput): PricingSummary {
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

  // Gate 1: Check total service count
  if (serviceIds.length > 5) {
    quoteRequired = true;
    quoteReasons.push(
      `Package contains ${serviceIds.length} services (exceeds standard 5-service checkout threshold). Enterprise quotation required.`
    );
  }

  // Calculate per-service costs
  for (const sid of serviceIds) {
    const srv = serviceMap.get(sid);
    if (!srv) continue;

    if (srv.pricing_status === "quote_required") {
      quoteRequired = true;
      quoteReasons.push(
        `Service "${srv.id} — ${srv.title}" requires formal studio scoping and quotation.`
      );
    }

    const config = serviceConfigs[sid] || { quantity: 1, rush: false };
    // Tamper-proof sanitation
    const qty = Math.max(1, Math.floor(Number(config.quantity) || 1));

    const serviceBaseBDT = Number(srv.base_bdt) * qty;
    const serviceBaseUSD = Number(srv.base_usd) * qty;

    subtotalBDT += serviceBaseBDT;
    subtotalUSD += serviceBaseUSD;

    if (config.rush) {
      const rushBDT = Math.round(serviceBaseBDT * 0.35);
      const rushUSD = Math.round(serviceBaseUSD * 0.35 * 100) / 100;
      rushSurchargeBDT += rushBDT;
      rushSurchargeUSD += rushUSD;
    }

    // Add-ons for this service
    const attachedAddOnIds = selectedAddOns[sid] || [];
    for (const aId of attachedAddOnIds) {
      const addOn = addOnMap.get(aId);
      if (addOn) {
        addOnsTotalBDT += Number(addOn.unit_price_bdt);
        addOnsTotalUSD += Number(addOn.unit_price_usd);
      }
    }
  }

  const finalBDT = subtotalBDT + rushSurchargeBDT + addOnsTotalBDT;
  const finalUSD = Math.round((subtotalUSD + rushSurchargeUSD + addOnsTotalUSD) * 100) / 100;

  // Gate 2: High-value budget threshold (৳150,000 BDT or $1,250 USD)
  if (finalBDT > 150000 || finalUSD > 1250) {
    quoteRequired = true;
    quoteReasons.push(
      `Total investment (৳ ${finalBDT.toLocaleString()} / $ ${finalUSD.toLocaleString()}) exceeds the self-service checkout limit. Requires commercial review.`
    );
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

import { sslcommerz, SSLCommerzAdapter } from "./sslcommerz";
import { stripe, StripeAdapter } from "./stripe";
import { devTestPayment, DevTestPaymentAdapter } from "./dev-test";
import type {
  PaymentGateway,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

export * from "./types";
export { sslcommerz, SSLCommerzAdapter } from "./sslcommerz";
export { stripe, StripeAdapter } from "./stripe";
export { devTestPayment, DevTestPaymentAdapter } from "./dev-test";

export function resolveGateway(
  requested?: PaymentGateway,
  currency: "BDT" | "USD" = "BDT"
): PaymentGateway {
  if (requested === "dev_test_adapter") {
    if (devTestPayment.isEnabled) return "dev_test_adapter";
  }
  if (requested === "sslcommerz" || requested === "stripe") {
    return requested;
  }
  return currency === "BDT" ? "sslcommerz" : "stripe";
}

export async function initiatePayment(
  req: PaymentInitiationRequest,
  preferredGateway?: PaymentGateway
): Promise<PaymentInitiationResponse> {
  const gateway = resolveGateway(preferredGateway, req.currency);

  if (gateway === "sslcommerz") {
    return sslcommerz.initiateSession(req);
  }

  if (gateway === "stripe") {
    return stripe.initiateSession(req);
  }

  if (gateway === "dev_test_adapter") {
    return devTestPayment.initiateSession(req);
  }

  return {
    success: false,
    gateway: "sslcommerz",
    mode: "live",
    transactionRef: req.orderRef,
    error: `Unsupported payment gateway: ${gateway}`,
  };
}

export async function verifyPayment(
  req: PaymentValidationRequest
): Promise<PaymentValidationResponse> {
  if (req.gateway === "sslcommerz") {
    return sslcommerz.validatePayment(req);
  }

  if (req.gateway === "stripe") {
    return stripe.validatePayment(req);
  }

  if (req.gateway === "dev_test_adapter") {
    return devTestPayment.validatePayment(req);
  }

  return {
    verified: false,
    status: "failed",
    mode: "live",
    transactionRef: req.transactionRef,
    amountVerified: 0,
    currencyVerified: req.expectedCurrency,
    riskStatus: "fraud",
    isDuplicate: false,
    rawPayload: req.gatewayPayload,
    error: `Unsupported payment gateway: ${req.gateway}`,
  };
}

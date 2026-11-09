import { sslcommerz } from "./sslcommerz";
import { stripe } from "./stripe";
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

export function resolveGateway(
  requested?: PaymentGateway,
  currency: "BDT" | "USD" = "BDT"
): PaymentGateway {
  if (requested) return requested;
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

  // Fallback dev sandbox
  return {
    success: true,
    gateway: "dev_sandbox",
    mode: "dev_simulation",
    transactionRef: `DEV-${Date.now()}`,
    redirectUrl: `${req.successUrl}?tran_id=DEV-${Date.now()}&amount=${req.amount}&currency=${req.currency}&simulated=true`,
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

  // Dev simulation verification
  return {
    verified: true,
    status: "paid",
    mode: "dev_simulation",
    transactionRef: req.transactionRef,
    amountVerified: req.expectedAmount,
    currencyVerified: req.expectedCurrency,
    riskStatus: "safe",
    isDuplicate: false,
    rawPayload: req.gatewayPayload,
  };
}

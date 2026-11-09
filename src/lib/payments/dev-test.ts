import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

/**
 * Explicit Development-Only Test Adapter.
 * Per Directive 10.0 Defect C & Section 10:
 * - Must fail closed in production.
 * - Must never be reachable through live SSLCOMMERZ / Stripe public callback endpoints.
 * - Only enabled when ENABLE_DEV_PAYMENT_SIMULATION="true" in non-production environments.
 */
export class DevTestPaymentAdapter {
  get isEnabled(): boolean {
    const isProd = process.env.NODE_ENV === "production";
    const explicitFlag = process.env.ENABLE_DEV_PAYMENT_SIMULATION === "true";
    return !isProd && explicitFlag;
  }

  async initiateSession(
    req: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        gateway: "dev_test_adapter",
        mode: "dev_test",
        transactionRef: req.orderRef,
        error: "Development test payment adapter is strictly disabled in production or when ENABLE_DEV_PAYMENT_SIMULATION is false.",
      };
    }

    const transactionRef = `DEV-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      gateway: "dev_test_adapter",
      mode: "dev_test",
      transactionRef,
      redirectUrl: `/api/payments/dev-test/callback?tran_id=${transactionRef}&order_ref=${encodeURIComponent(
        req.orderRef
      )}&dev_token=dev_secret_auth`,
      notice: "DEVELOPMENT_TEST_ONLY: Simulated test transaction in non-production environment.",
    };
  }

  async validatePayment(
    req: PaymentValidationRequest
  ): Promise<PaymentValidationResponse> {
    const raw = req.gatewayPayload;

    if (!this.isEnabled) {
      return {
        verified: false,
        status: "failed",
        mode: "dev_test",
        transactionRef: req.transactionRef,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "fraud",
        isDuplicate: false,
        rawPayload: raw,
        error: "Development test payment adapter is strictly disabled in production.",
      };
    }

    // Require internal authorization token
    if (raw.dev_token !== "dev_secret_auth") {
      return {
        verified: false,
        status: "failed",
        mode: "dev_test",
        transactionRef: req.transactionRef,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "fraud",
        isDuplicate: false,
        rawPayload: raw,
        error: "Invalid development test authorization token.",
      };
    }

    return {
      verified: true,
      status: "paid",
      mode: "dev_test",
      transactionRef: req.transactionRef,
      amountVerified: req.expectedAmount,
      currencyVerified: req.expectedCurrency,
      bankTranId: `DEV_BANK_${Date.now()}`,
      cardType: "DEV-SIMULATED",
      riskStatus: "safe",
      isDuplicate: false,
      rawPayload: raw,
    };
  }
}

export const devTestPayment = new DevTestPaymentAdapter();

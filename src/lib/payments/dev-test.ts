import crypto from "crypto";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

interface DevTestSessionRecord {
  transactionRef: string;
  orderRef: string;
  expectedAmount: number;
  expectedCurrency: "BDT" | "USD";
  authToken: string;
  expiresAt: number;
  used: boolean;
}

// In-memory secure server-side session registry with TTL & single-use guarantee
const devSessionRegistry = new Map<string, DevTestSessionRecord>();

/**
 * Explicit Development-Only Test Adapter.
 * Per Directive 11.0 Section 4:
 * - Must fail closed in production.
 * - Single-use, short-lived (15 min TTL), server-validated test authorization token.
 * - Replay prevention: token invalidated upon first settlement.
 * - Never accepted across live SSLCOMMERZ or Stripe public callback routes.
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
    const authToken = crypto.randomBytes(24).toString("hex");

    // Store server-side bound to order, amount, currency, and TTL
    devSessionRegistry.set(transactionRef, {
      transactionRef,
      orderRef: req.orderRef,
      expectedAmount: req.amount,
      expectedCurrency: req.currency,
      authToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
      used: false,
    });

    return {
      success: true,
      gateway: "dev_test_adapter",
      mode: "dev_test",
      transactionRef,
      redirectUrl: `/api/payments/dev-test/callback?tran_id=${transactionRef}&order_ref=${encodeURIComponent(
        req.orderRef
      )}&dev_token=${authToken}`,
      notice: "DEVELOPMENT_TEST_ONLY: Simulated test transaction with cryptographically bound single-use token.",
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

    const session = devSessionRegistry.get(req.transactionRef);

    // Verify session existence in server-side registry
    if (!session) {
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
        error: "Development payment session not found or expired.",
      };
    }

    // Verify TTL
    if (Date.now() > session.expiresAt) {
      devSessionRegistry.delete(req.transactionRef);
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
        error: "Development payment session token has expired.",
      };
    }

    // Enforce single-use (anti-replay)
    if (session.used) {
      return {
        verified: false,
        status: "failed",
        mode: "dev_test",
        transactionRef: req.transactionRef,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "fraud",
        isDuplicate: true,
        rawPayload: raw,
        error: "Development payment session token has already been consumed (replay attempt blocked).",
      };
    }

    // Cryptographic token validation
    const providedToken = String(raw.dev_token || "");
    if (!providedToken || providedToken !== session.authToken) {
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
        error: "Invalid or forged development payment token.",
      };
    }

    // Bind verification to expected order amount & currency
    if (Math.abs(session.expectedAmount - req.expectedAmount) > 0.01) {
      return {
        verified: false,
        status: "failed",
        mode: "dev_test",
        transactionRef: req.transactionRef,
        amountVerified: session.expectedAmount,
        currencyVerified: req.expectedCurrency,
        riskStatus: "flagged",
        isDuplicate: false,
        rawPayload: raw,
        error: `Amount mismatch: stored order expects ${req.expectedAmount}, test session bound to ${session.expectedAmount}`,
      };
    }

    if (session.expectedCurrency !== req.expectedCurrency) {
      return {
        verified: false,
        status: "failed",
        mode: "dev_test",
        transactionRef: req.transactionRef,
        amountVerified: session.expectedAmount,
        currencyVerified: session.expectedCurrency,
        riskStatus: "flagged",
        isDuplicate: false,
        rawPayload: raw,
        error: `Currency mismatch: stored order expects ${req.expectedCurrency}, test session bound to ${session.expectedCurrency}`,
      };
    }

    // Consume the token atomically
    session.used = true;

    return {
      verified: true,
      status: "paid",
      mode: "dev_test",
      transactionRef: req.transactionRef,
      amountVerified: req.expectedAmount,
      currencyVerified: req.expectedCurrency,
      bankTranId: `DEV_BANK_${Date.now()}`,
      cardType: "DEV-SECURE-TEST",
      riskStatus: "safe",
      isDuplicate: false,
      rawPayload: raw,
    };
  }
}

export const devTestPayment = new DevTestPaymentAdapter();

import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

export class StripeAdapter {
  private secretKey: string;
  private webhookSecret: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || "";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  async initiateSession(
    req: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const transactionRef = `STRIPE-CS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!this.isConfigured) {
      return {
        success: true,
        gateway: "stripe",
        mode: "dev_simulation",
        transactionRef,
        redirectUrl: `${req.successUrl}?session_id=${transactionRef}&amount=${req.amount}&currency=${req.currency}&status=paid&simulated=true`,
        notice: "DEVELOPMENT_SIMULATION: STRIPE_SECRET_KEY not configured in environment.",
      };
    }

    try {
      // In cents/poisha
      const unitAmount = Math.round(req.amount * 100);

      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${req.successUrl}?session_id={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", req.cancelUrl);
      params.append("customer_email", req.customerEmail);
      params.append("client_reference_id", req.orderRef);
      params.append("line_items[0][price_data][currency]", req.currency.toLowerCase());
      params.append("line_items[0][price_data][unit_amount]", unitAmount.toString());
      params.append(
        "line_items[0][price_data][product_data][name]",
        `Freakin' Studio Package — ${req.orderRef}`
      );
      params.append("metadata[orderId]", req.orderId);
      params.append("metadata[orderRef]", req.orderRef);

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const session = await res.json();

      if (!res.ok || session.error) {
        return {
          success: false,
          gateway: "stripe",
          mode: this.secretKey.startsWith("sk_test_") ? "sandbox" : "live",
          transactionRef,
          error: session.error?.message || "Failed to create Stripe Checkout session",
        };
      }

      return {
        success: true,
        gateway: "stripe",
        mode: this.secretKey.startsWith("sk_test_") ? "sandbox" : "live",
        transactionRef: session.id,
        redirectUrl: session.url,
        gatewaySessionKey: session.id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error creating Stripe session";
      return {
        success: false,
        gateway: "stripe",
        mode: this.secretKey.startsWith("sk_test_") ? "sandbox" : "live",
        transactionRef,
        error: message,
      };
    }
  }

  async validatePayment(
    req: PaymentValidationRequest
  ): Promise<PaymentValidationResponse> {
    const raw = req.gatewayPayload;
    const mode = this.isConfigured
      ? this.secretKey.startsWith("sk_test_")
        ? "sandbox"
        : "live"
      : "dev_simulation";

    if (raw.simulated === "true" || !this.isConfigured) {
      const amount = Number(raw.amount || req.expectedAmount);
      const currency = ((raw.currency as string) || req.expectedCurrency).toUpperCase() as "BDT" | "USD";

      if (currency !== req.expectedCurrency) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: req.transactionRef,
          amountVerified: amount,
          currencyVerified: currency,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: raw,
          error: `Currency mismatch: expected ${req.expectedCurrency}, received ${currency}`,
        };
      }

      if (Math.abs(amount - req.expectedAmount) > 0.01) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: req.transactionRef,
          amountVerified: amount,
          currencyVerified: currency,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: raw,
          error: `Amount mismatch: expected ${req.expectedAmount}, received ${amount}`,
        };
      }

      return {
        verified: true,
        status: "paid",
        mode,
        transactionRef: req.transactionRef,
        amountVerified: amount,
        currencyVerified: currency,
        bankTranId: `SIM_STRIPE_${Date.now()}`,
        cardType: "STRIPE-SIMULATED",
        riskStatus: "safe",
        isDuplicate: false,
        rawPayload: raw,
      };
    }

    // Live Stripe session retrieval verification
    const sessionId = (raw.session_id as string) || req.transactionRef;

    try {
      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const session = await res.json();

      if (!res.ok || session.error) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: sessionId,
          amountVerified: 0,
          currencyVerified: req.expectedCurrency,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: session,
          error: session.error?.message || "Failed to retrieve Stripe Checkout session",
        };
      }

      const isPaid = session.payment_status === "paid";
      const amountVerified = (session.amount_total || 0) / 100;
      const currencyVerified = (session.currency || "usd").toUpperCase() as "BDT" | "USD";

      if (!isPaid) {
        return {
          verified: false,
          status: session.payment_status === "unpaid" ? "awaiting_payment" : "failed",
          mode,
          transactionRef: session.id,
          amountVerified,
          currencyVerified,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: session,
          error: `Stripe session payment_status is ${session.payment_status}`,
        };
      }

      if (Math.abs(amountVerified - req.expectedAmount) > 0.01) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: session.id,
          amountVerified,
          currencyVerified,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: session,
          error: `Amount mismatch: expected ${req.expectedAmount}, received ${amountVerified}`,
        };
      }

      if (currencyVerified !== req.expectedCurrency) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: session.id,
          amountVerified,
          currencyVerified,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: session,
          error: `Currency mismatch: expected ${req.expectedCurrency}, received ${currencyVerified}`,
        };
      }

      return {
        verified: true,
        status: "paid",
        mode,
        transactionRef: session.id,
        amountVerified,
        currencyVerified,
        bankTranId: session.payment_intent,
        cardType: "STRIPE-CARD",
        riskStatus: "safe",
        isDuplicate: false,
        rawPayload: session,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error verifying Stripe session";
      return {
        verified: false,
        status: "failed",
        mode,
        transactionRef: sessionId,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "flagged",
        isDuplicate: false,
        rawPayload: raw,
        error: message,
      };
    }
  }
}

export const stripe = new StripeAdapter();

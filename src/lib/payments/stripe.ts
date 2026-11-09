import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

export class StripeAdapter {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  async initiateSession(
    req: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const transactionRef = req.orderRef;

    if (!this.isConfigured) {
      return {
        success: false,
        gateway: "stripe",
        mode: "live",
        transactionRef,
        error: "Stripe secret key (STRIPE_SECRET_KEY) is not configured in environment.",
      };
    }

    try {
      const unitAmount = Math.round(req.amount * 100);

      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${req.successUrl}?session_id={CHECKOUT_SESSION_ID}&order_ref=${encodeURIComponent(req.orderRef)}`);
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
      const message =
        err instanceof Error ? err.message : "Network error creating Stripe session";
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
      : "live";

    if (!this.isConfigured) {
      return {
        verified: false,
        status: "failed",
        mode,
        transactionRef: req.transactionRef,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "flagged",
        isDuplicate: false,
        rawPayload: raw,
        error: "Stripe secret key is not configured in environment.",
      };
    }

    const sessionId = (raw.session_id as string) || req.transactionRef;

    try {
      const res = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

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
      const currencyVerified = (session.currency || "usd").toUpperCase() as
        | "BDT"
        | "USD";

      if (!isPaid) {
        return {
          verified: false,
          status:
            session.payment_status === "unpaid" ? "awaiting_payment" : "failed",
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

      // Financial validation against server-authoritative order values
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
          error: `Amount mismatch: stored order expects ${req.expectedAmount}, provider verified ${amountVerified}`,
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
          error: `Currency mismatch: stored order expects ${req.expectedCurrency}, provider verified ${currencyVerified}`,
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
      const message =
        err instanceof Error ? err.message : "Error verifying Stripe session";
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

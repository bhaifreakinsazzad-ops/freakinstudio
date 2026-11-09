import { describe, expect, it } from "vitest";
import {
  initiatePayment,
  verifyPayment,
  resolveGateway,
  SSLCommerzAdapter,
  StripeAdapter,
} from "@/lib/payments";

describe("Payment Gateway Subsystem — SSLCOMMERZ & Stripe", () => {
  describe("1. Gateway Resolver", () => {
    it("resolves SSLCOMMERZ as default for BDT currency", () => {
      expect(resolveGateway(undefined, "BDT")).toBe("sslcommerz");
    });

    it("resolves Stripe as default for USD currency", () => {
      expect(resolveGateway(undefined, "USD")).toBe("stripe");
    });

    it("respects explicit gateway preference override", () => {
      expect(resolveGateway("stripe", "BDT")).toBe("stripe");
      expect(resolveGateway("sslcommerz", "USD")).toBe("sslcommerz");
    });
  });

  describe("2. SSLCOMMERZ Adapter & Simulation", () => {
    const sslc = new SSLCommerzAdapter();

    it("initiates session in safe simulation mode when credentials not in env", async () => {
      const res = await sslc.initiateSession({
        orderId: "ord-test-1",
        orderRef: "FS-ORD-1001",
        amount: 15000,
        currency: "BDT",
        customerName: "Sazzad Bhai",
        customerEmail: "sazzad@freakinstudio.com",
        customerPhone: "01711111111",
        successUrl: "https://freakinstudio.com/api/payments/sslcommerz/callback",
        failUrl: "https://freakinstudio.com/api/payments/sslcommerz/callback",
        cancelUrl: "https://freakinstudio.com/api/payments/sslcommerz/callback",
        ipnUrl: "https://freakinstudio.com/api/payments/sslcommerz/callback",
      });

      expect(res.success).toBe(true);
      expect(res.gateway).toBe("sslcommerz");
      expect(res.transactionRef).toContain("SSLC-TX-");
      expect(res.redirectUrl).toBeDefined();
      expect(res.redirectUrl).toContain("simulated=true");
    });

    it("validates successful payment when amount and currency match exactly", async () => {
      const val = await sslc.validatePayment({
        gateway: "sslcommerz",
        transactionRef: "SSLC-TX-9999",
        expectedAmount: 12500,
        expectedCurrency: "BDT",
        gatewayPayload: {
          simulated: "true",
          amount: 12500,
          currency: "BDT",
          val_id: "SIM_VAL_123",
          status: "VALID",
        },
      });

      expect(val.verified).toBe(true);
      expect(val.status).toBe("paid");
      expect(val.amountVerified).toBe(12500);
      expect(val.currencyVerified).toBe("BDT");
      expect(val.riskStatus).toBe("safe");
    });

    it("rejects validation when amount does not match expected order total", async () => {
      const val = await sslc.validatePayment({
        gateway: "sslcommerz",
        transactionRef: "SSLC-TX-9999",
        expectedAmount: 25000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          simulated: "true",
          amount: 500, // Tampered amount
          currency: "BDT",
          val_id: "SIM_VAL_123",
          status: "VALID",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
      expect(val.error).toContain("Amount mismatch");
      expect(val.riskStatus).toBe("flagged");
    });

    it("rejects validation when currency differs from order currency", async () => {
      const val = await sslc.validatePayment({
        gateway: "sslcommerz",
        transactionRef: "SSLC-TX-9999",
        expectedAmount: 1000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          simulated: "true",
          amount: 1000,
          currency: "USD", // Tampered currency
          val_id: "SIM_VAL_123",
          status: "VALID",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
      expect(val.error).toContain("Currency mismatch");
      expect(val.riskStatus).toBe("flagged");
    });
  });

  describe("3. Stripe Adapter & Simulation", () => {
    const stripe = new StripeAdapter();

    it("initiates session in safe simulation mode when secret key not configured", async () => {
      const res = await stripe.initiateSession({
        orderId: "ord-test-stripe-1",
        orderRef: "FS-ORD-2001",
        amount: 250,
        currency: "USD",
        customerName: "Global Client",
        customerEmail: "client@globalcorp.com",
        successUrl: "https://freakinstudio.com/api/payments/stripe/callback",
        failUrl: "https://freakinstudio.com/api/payments/stripe/callback",
        cancelUrl: "https://freakinstudio.com/api/payments/stripe/callback",
        ipnUrl: "https://freakinstudio.com/api/payments/stripe/callback",
      });

      expect(res.success).toBe(true);
      expect(res.gateway).toBe("stripe");
      expect(res.transactionRef).toContain("STRIPE-CS-");
      expect(res.redirectUrl).toContain("simulated=true");
    });

    it("validates successful Stripe session with matching amount & currency", async () => {
      const val = await stripe.validatePayment({
        gateway: "stripe",
        transactionRef: "STRIPE-CS-999",
        expectedAmount: 450,
        expectedCurrency: "USD",
        gatewayPayload: {
          simulated: "true",
          amount: 450,
          currency: "USD",
          status: "paid",
        },
      });

      expect(val.verified).toBe(true);
      expect(val.status).toBe("paid");
      expect(val.amountVerified).toBe(450);
      expect(val.currencyVerified).toBe("USD");
      expect(val.riskStatus).toBe("safe");
    });

    it("rejects validation when Stripe payload amount differs", async () => {
      const val = await stripe.validatePayment({
        gateway: "stripe",
        transactionRef: "STRIPE-CS-999",
        expectedAmount: 450,
        expectedCurrency: "USD",
        gatewayPayload: {
          simulated: "true",
          amount: 45, // Decimal tamper
          currency: "USD",
          status: "paid",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
      expect(val.error).toContain("Amount mismatch");
    });
  });

  describe("4. Unified Payment Dispatcher", () => {
    it("dispatches payment initiation to proper gateway", async () => {
      const bdtRes = await initiatePayment({
        orderId: "ord-bdt",
        orderRef: "FS-ORD-BDT",
        amount: 8000,
        currency: "BDT",
        customerName: "Dhaka Client",
        customerEmail: "dhaka@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      expect(bdtRes.gateway).toBe("sslcommerz");

      const usdRes = await initiatePayment({
        orderId: "ord-usd",
        orderRef: "FS-ORD-USD",
        amount: 350,
        currency: "USD",
        customerName: "US Client",
        customerEmail: "us@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      expect(usdRes.gateway).toBe("stripe");
    });

    it("dispatches verification to proper gateway validator", async () => {
      const val = await verifyPayment({
        gateway: "sslcommerz",
        transactionRef: "TX-TEST",
        expectedAmount: 5000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          simulated: "true",
          amount: 5000,
          currency: "BDT",
        },
      });

      expect(val.verified).toBe(true);
      expect(val.status).toBe("paid");
    });
  });
});

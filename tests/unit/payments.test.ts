import { describe, expect, it, beforeEach } from "vitest";
import {
  initiatePayment,
  verifyPayment,
  resolveGateway,
  SSLCommerzAdapter,
  StripeAdapter,
  DevTestPaymentAdapter,
} from "@/lib/payments";

describe("Payment Gateway Subsystem — Real Adapters & DevTest Isolation", () => {
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

  describe("2. SSLCOMMERZ Adapter (Strict Production Behavior)", () => {
    const sslc = new SSLCommerzAdapter();

    it("fails closed when credentials are not configured in environment (Directive 10.0 Defect C)", async () => {
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

      expect(res.success).toBe(false);
      expect(res.gateway).toBe("sslcommerz");
      expect(res.error).toContain("SSLCOMMERZ merchant credentials");
    });

    it("rejects validation when val_id is missing or credentials unconfigured", async () => {
      const val = await sslc.validatePayment({
        gateway: "sslcommerz",
        transactionRef: "SSLC-TX-9999",
        expectedAmount: 12500,
        expectedCurrency: "BDT",
        gatewayPayload: {
          amount: 12500,
          currency: "BDT",
          status: "VALID",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
    });
  });

  describe("3. Stripe Adapter (Strict Production Behavior)", () => {
    const stripe = new StripeAdapter();

    it("fails closed when secret key is not configured (Directive 10.0 Defect C)", async () => {
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

      expect(res.success).toBe(false);
      expect(res.gateway).toBe("stripe");
      expect(res.error).toContain("Stripe secret key");
    });

    it("rejects validation when secret key unconfigured", async () => {
      const val = await stripe.validatePayment({
        gateway: "stripe",
        transactionRef: "STRIPE-CS-999",
        expectedAmount: 450,
        expectedCurrency: "USD",
        gatewayPayload: {
          session_id: "STRIPE-CS-999",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
    });
  });

  describe("4. Isolated Development Test Adapter (Directive 10.0 Defect C)", () => {
    const devAdapter = new DevTestPaymentAdapter();

    it("fails closed when ENABLE_DEV_PAYMENT_SIMULATION is not enabled", async () => {
      delete process.env.ENABLE_DEV_PAYMENT_SIMULATION;
      const res = await devAdapter.initiateSession({
        orderId: "ord-dev-1",
        orderRef: "FS-ORD-DEV-1",
        amount: 5000,
        currency: "BDT",
        customerName: "Test Dev",
        customerEmail: "dev@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("disabled in production");
    });

    it("initiates simulated session when explicitly enabled in non-production", async () => {
      process.env.ENABLE_DEV_PAYMENT_SIMULATION = "true";
      const res = await devAdapter.initiateSession({
        orderId: "ord-dev-2",
        orderRef: "FS-ORD-DEV-2",
        amount: 5000,
        currency: "BDT",
        customerName: "Test Dev",
        customerEmail: "dev@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      expect(res.success).toBe(true);
      expect(res.gateway).toBe("dev_test_adapter");
      expect(res.mode).toBe("dev_test");
      expect(res.redirectUrl).toContain("dev-test/callback");
    });

    it("validates payment successfully with authorized dev token", async () => {
      process.env.ENABLE_DEV_PAYMENT_SIMULATION = "true";
      const session = await devAdapter.initiateSession({
        orderId: "ord-val-token",
        orderRef: "FS-ORD-VAL",
        amount: 5000,
        currency: "BDT",
        customerName: "Token Tester",
        customerEmail: "token@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      const url = new URL(session.redirectUrl || "", "https://freakinstudio.com");
      const devToken = url.searchParams.get("dev_token") || "";

      const val = await devAdapter.validatePayment({
        gateway: "dev_test_adapter",
        transactionRef: session.transactionRef,
        expectedAmount: 5000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          dev_token: devToken,
          order_id: "ord-val-token",
          order_ref: "FS-ORD-VAL",
        },
      });

      expect(val.verified).toBe(true);
      expect(val.status).toBe("paid");
      expect(val.amountVerified).toBe(5000);
      expect(val.currencyVerified).toBe("BDT");
    });

    it("rejects dev validation when token is missing or forged", async () => {
      process.env.ENABLE_DEV_PAYMENT_SIMULATION = "true";
      const val = await devAdapter.validatePayment({
        gateway: "dev_test_adapter",
        transactionRef: "DEV-TX-1234",
        expectedAmount: 5000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          dev_token: "malicious_token",
        },
      });

      expect(val.verified).toBe(false);
      expect(val.status).toBe("failed");
      expect(val.riskStatus).toBe("fraud");
    });
  });

  describe("5. Unified Payment Dispatcher", () => {
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

    it("dispatches verification to dev_test_adapter when requested and enabled", async () => {
      process.env.ENABLE_DEV_PAYMENT_SIMULATION = "true";
      const devLocal = new DevTestPaymentAdapter();
      const session = await devLocal.initiateSession({
        orderId: "ord-disp-test",
        orderRef: "FS-ORD-DISP",
        amount: 5000,
        currency: "BDT",
        customerName: "Dispatch Tester",
        customerEmail: "disp@freakinstudio.com",
        successUrl: "/callback",
        failUrl: "/callback",
        cancelUrl: "/callback",
        ipnUrl: "/callback",
      });

      const url = new URL(session.redirectUrl || "", "https://freakinstudio.com");
      const devToken = url.searchParams.get("dev_token") || "";

      const val = await verifyPayment({
        gateway: "dev_test_adapter",
        transactionRef: session.transactionRef,
        expectedAmount: 5000,
        expectedCurrency: "BDT",
        gatewayPayload: {
          dev_token: devToken,
          order_id: "ord-disp-test",
          order_ref: "FS-ORD-DISP",
        },
      });

      expect(val.verified).toBe(true);
      expect(val.status).toBe("paid");
    });
  });
});

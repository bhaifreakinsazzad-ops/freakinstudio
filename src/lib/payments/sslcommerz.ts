import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from "./types";

export class SSLCommerzAdapter {
  private storeId: string;
  private storePasswd: string;
  private isSandbox: boolean;

  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || "";
    this.storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || "";
    this.isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";
  }

  get isConfigured(): boolean {
    return Boolean(this.storeId && this.storePasswd);
  }

  private get baseUrl(): string {
    return this.isSandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";
  }

  async initiateSession(
    req: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const transactionRef = `SSLC-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!this.isConfigured) {
      // Safely fall back to explicitly-labeled development simulation adapter
      return {
        success: true,
        gateway: "sslcommerz",
        mode: "dev_simulation",
        transactionRef,
        redirectUrl: `${req.successUrl}?tran_id=${transactionRef}&val_id=SIM_VAL_${Date.now()}&amount=${req.amount}&currency=${req.currency}&status=VALID&simulated=true`,
        notice: "DEVELOPMENT_SIMULATION: Real SSLCOMMERZ store credentials not configured in environment.",
      };
    }

    try {
      const payload = new URLSearchParams({
        store_id: this.storeId,
        store_passwd: this.storePasswd,
        total_amount: req.amount.toString(),
        currency: req.currency,
        tran_id: transactionRef,
        success_url: req.successUrl,
        fail_url: req.failUrl,
        cancel_url: req.cancelUrl,
        ipn_url: req.ipnUrl,
        cus_name: req.customerName,
        cus_email: req.customerEmail,
        cus_phone: req.customerPhone || "01700000000",
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: `Freakin' Studio Package — ${req.orderRef}`,
        product_category: "Creative Services",
        product_profile: "non-physical-goods",
      });

      const res = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });

      const data = await res.json();

      if (data?.status === "SUCCESS" && data?.GatewayPageURL) {
        return {
          success: true,
          gateway: "sslcommerz",
          mode: this.isSandbox ? "sandbox" : "live",
          transactionRef,
          redirectUrl: data.GatewayPageURL,
          gatewaySessionKey: data.sessionkey,
        };
      }

      return {
        success: false,
        gateway: "sslcommerz",
        mode: this.isSandbox ? "sandbox" : "live",
        transactionRef,
        error: data?.failedreason || "Failed to initiate SSLCOMMERZ gateway session",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error during SSLCOMMERZ initialization";
      return {
        success: false,
        gateway: "sslcommerz",
        mode: this.isSandbox ? "sandbox" : "live",
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
      ? this.isSandbox
        ? "sandbox"
        : "live"
      : "dev_simulation";

    // Check development simulation mode
    if (raw.simulated === "true" || !this.isConfigured) {
      const amount = Number(raw.amount || req.expectedAmount);
      const currency = (raw.currency as "BDT" | "USD") || req.expectedCurrency;

      // Currency check
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

      // Amount check
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
        bankTranId: `SIM_BANK_${Date.now()}`,
        cardType: "BKASH-SIMULATED",
        riskStatus: "safe",
        isDuplicate: false,
        rawPayload: raw,
      };
    }

    // Live or Sandbox Order Validation API
    const valId = req.valId || (raw.val_id as string);
    if (!valId) {
      return {
        verified: false,
        status: "failed",
        mode,
        transactionRef: req.transactionRef,
        amountVerified: 0,
        currencyVerified: req.expectedCurrency,
        riskStatus: "fraud",
        isDuplicate: false,
        rawPayload: raw,
        error: "Missing val_id required for SSLCOMMERZ Order Validation API",
      };
    }

    try {
      const validationUrl = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
        valId
      )}&store_id=${encodeURIComponent(this.storeId)}&store_passwd=${encodeURIComponent(
        this.storePasswd
      )}&v=1&format=json`;

      const res = await fetch(validationUrl);
      const validationData = await res.json();

      const isValidStatus =
        validationData.status === "VALID" || validationData.status === "VALIDATED";

      if (!isValidStatus) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: req.transactionRef,
          amountVerified: Number(validationData.amount || 0),
          currencyVerified: (validationData.currency_type || req.expectedCurrency) as "BDT" | "USD",
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: validationData,
          error: `Validation status rejected: ${validationData.status}`,
        };
      }

      const verifiedAmount = Number(validationData.amount);
      const verifiedCurrency = validationData.currency_type as "BDT" | "USD";

      // Rigorous financial checks
      if (Math.abs(verifiedAmount - req.expectedAmount) > 0.01) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: req.transactionRef,
          amountVerified: verifiedAmount,
          currencyVerified: verifiedCurrency,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: validationData,
          error: `Amount mismatch: expected ${req.expectedAmount}, received ${verifiedAmount}`,
        };
      }

      if (verifiedCurrency !== req.expectedCurrency) {
        return {
          verified: false,
          status: "failed",
          mode,
          transactionRef: req.transactionRef,
          amountVerified: verifiedAmount,
          currencyVerified: verifiedCurrency,
          riskStatus: "flagged",
          isDuplicate: false,
          rawPayload: validationData,
          error: `Currency mismatch: expected ${req.expectedCurrency}, received ${verifiedCurrency}`,
        };
      }

      const riskLevel = Number(validationData.risk_level || 0);
      const riskStatus = riskLevel > 0 ? "flagged" : "safe";

      return {
        verified: riskStatus === "safe",
        status: riskStatus === "safe" ? "paid" : "verifying",
        mode,
        transactionRef: validationData.tran_id || req.transactionRef,
        amountVerified: verifiedAmount,
        currencyVerified: verifiedCurrency,
        bankTranId: validationData.bank_tran_id,
        cardType: validationData.card_type,
        riskStatus,
        isDuplicate: false,
        rawPayload: validationData,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Order Validation API connection error";
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
        error: message,
      };
    }
  }
}

export const sslcommerz = new SSLCommerzAdapter();

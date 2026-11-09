export type PaymentGateway = "sslcommerz" | "stripe" | "dev_test_adapter";

export type PaymentExecutionMode = "live" | "sandbox" | "dev_test";

export type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "verifying"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentInitiationRequest {
  orderId: string;
  orderRef: string;
  amount: number;
  currency: "BDT" | "USD";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  gateway: PaymentGateway;
  mode: PaymentExecutionMode;
  transactionRef: string;
  redirectUrl?: string;
  gatewaySessionKey?: string;
  notice?: string;
  error?: string;
}

export interface PaymentValidationRequest {
  gateway: PaymentGateway;
  transactionRef: string;
  expectedAmount: number; // Server-authoritative amount from database order
  expectedCurrency: "BDT" | "USD"; // Server-authoritative currency from database order
  valId?: string;
  gatewayPayload: Record<string, unknown>;
}

export interface PaymentValidationResponse {
  verified: boolean;
  status: PaymentStatus;
  mode: PaymentExecutionMode;
  transactionRef: string;
  amountVerified: number;
  currencyVerified: "BDT" | "USD";
  bankTranId?: string;
  cardType?: string;
  riskStatus: "safe" | "flagged" | "fraud";
  isDuplicate: boolean;
  rawPayload: Record<string, unknown>;
  error?: string;
}

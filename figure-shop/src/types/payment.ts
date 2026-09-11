export type ProviderResult = {
  reference: string;
  merchantAccountId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED" | "UNKNOWN";
  transactionId?: string;
  paymentLinkId?: string;
  checkoutUrl?: string;
  needsReview?: boolean;
};

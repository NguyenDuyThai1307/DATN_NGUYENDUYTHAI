import { PayOS } from "@payos/node";
import type { Webhook } from "@payos/node/lib/resources/webhooks/webhook";
import type { PaymentAttempt } from "@/generated/prisma/client";
import { appUrl, requiredPaymentEnv } from "@/lib/payment-config";
import type { ProviderResult } from "@/types/payment";

export function payosClient() {
  return new PayOS({ clientId: requiredPaymentEnv("PAYOS_CLIENT_ID"), apiKey: requiredPaymentEnv("PAYOS_API_KEY"),
    checksumKey: requiredPaymentEnv("PAYOS_CHECKSUM_KEY"), baseURL: "https://api-merchant.payos.vn", timeout: 10_000, maxRetries: 0, logLevel: "off",
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (response.ok && String(input).includes("/v2/payment-requests")) {
        const payload = await response.clone().json() as { code?: string; signature?: string };
        if (payload.code === "00" && !payload.signature) throw new Error("Thiếu chữ ký phản hồi payOS");
      }
      return response;
    },
  });
}
export async function createPayosLink(attempt: PaymentAttempt, orderId: string) {
  const returnUrl = `${appUrl()}/checkout/payment-result?orderId=${encodeURIComponent(orderId)}`;
  return payosClient().paymentRequests.create({ orderCode: Number(attempt.providerReference), amount: attempt.amount,
    description: `FS${attempt.providerReference}`, returnUrl, cancelUrl: returnUrl, expiredAt: Math.floor(attempt.expiresAt.getTime() / 1000) });
}
export async function queryPayos(attempt: PaymentAttempt, cancel = false): Promise<ProviderResult[]> {
  const client = payosClient();
  const data = cancel ? await client.paymentRequests.cancel(Number(attempt.providerReference), "Huy don hang") : await client.paymentRequests.get(Number(attempt.providerReference));
  const common = { reference: String(data.orderCode), merchantAccountId: client.clientId, currency: "VND", paymentLinkId: data.id };
  // Preserve each actual transfer, including under/overpayments, rather than trusting a total alone.
  if (data.transactions.length) return data.transactions.map((t) => ({ ...common, amount: t.amount, transactionId: t.reference, status: "SUCCEEDED" as const }));
  return [{ ...common, amount: data.amount, status: ["CANCELLED", "EXPIRED", "FAILED"].includes(data.status) ? data.status as "CANCELLED" | "EXPIRED" | "FAILED" : data.status === "PENDING" ? "PENDING" : "UNKNOWN",
    checkoutUrl: `https://pay.payos.vn/web/${data.id}` }];
}
export async function verifyPayos(body: unknown): Promise<ProviderResult> {
  const client = payosClient();
  const data = await client.webhooks.verify(body as Webhook);
  if (data.code !== "00") throw new Error("Webhook chưa xác nhận tiền");
  return { reference: String(data.orderCode), merchantAccountId: client.clientId, amount: data.amount, currency: data.currency,
    status: "SUCCEEDED", transactionId: data.reference, paymentLinkId: data.paymentLinkId };
}

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { appUrl, requiredPaymentEnv } from "@/lib/payment-config";
import type { PaymentAttempt } from "@/generated/prisma/client";
import type { ProviderResult } from "@/types/payment";

export function vnpayConfig() {
  if ((process.env.VNPAY_ENV ?? "sandbox") !== "sandbox") throw new Error("Chỉ hỗ trợ VNPAY Sandbox");
  return { merchant: requiredPaymentEnv("VNPAY_TMN_CODE"), secret: requiredPaymentEnv("VNPAY_HASH_SECRET") };
}
export function vnpayDate(date: Date) {
  return new Date(date.getTime() + 7 * 3600_000).toISOString().slice(0, 19).replace(/[-T:]/g, "");
}
export function vnpayCanonical(params: Record<string, string>) {
  const encode = (s: string) => encodeURIComponent(s).replace(/%20/g, "+");
  return Object.keys(params).filter((key) => key !== "vnp_SecureHash" && key !== "vnp_SecureHashType").sort()
    .map((key) => `${encode(key)}=${encode(params[key])}`).join("&");
}
export function vnpayHash(text: string, secret: string) {
  return createHmac("sha512", secret).update(text, "utf8").digest("hex");
}
export function validHash(text: string, signature: string, secret: string) {
  if (!/^[a-fA-F0-9]{128}$/.test(signature)) return false;
  return timingSafeEqual(Buffer.from(vnpayHash(text, secret), "hex"), Buffer.from(signature, "hex"));
}
export function vnpayParams(url: URL) {
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (!key.startsWith("vnp_") || key in params) throw new Error("Tham số VNPAY không hợp lệ");
    params[key] = value;
  }
  return params;
}
export function verifyVnpay(params: Record<string, string>) {
  const config = vnpayConfig();
  if (params.vnp_TmnCode !== config.merchant || !validHash(vnpayCanonical(params), params.vnp_SecureHash ?? "", config.secret)) throw new Error("Chữ ký VNPAY không hợp lệ");
}
export function vnpayResult(p: Record<string, string>, query = false): ProviderResult {
  if (!/^\d+$/.test(p.vnp_Amount ?? "") || !p.vnp_TxnRef) throw new Error("Dữ liệu VNPAY không hợp lệ");
  const success = p.vnp_ResponseCode === "00" && p.vnp_TransactionStatus === "00";
  // Only documented terminal unpaid statuses; unfamiliar/refund statuses need review.
  const terminal = p.vnp_TransactionStatus === "02" && p.vnp_ResponseCode !== "07";
  return {
    reference: p.vnp_TxnRef, merchantAccountId: p.vnp_TmnCode,
    amount: Number(p.vnp_Amount) / 100, currency: "VND",
    status: success ? "SUCCEEDED" : terminal && (!query || p.vnp_ResponseCode === "00") ? "FAILED" : p.vnp_TransactionStatus === "01" ? "PENDING" : "UNKNOWN",
    needsReview: ["04", "05", "06", "07", "09"].includes(p.vnp_TransactionStatus) || p.vnp_ResponseCode === "07",
    transactionId: success ? p.vnp_TransactionNo : undefined,
  };
}
export function createVnpayUrl(attempt: PaymentAttempt, ip: string) {
  const config = vnpayConfig();
  if (!isIP(ip)) throw new Error("IP thanh toán không hợp lệ");
  const params = {
    vnp_Version: "2.1.0", vnp_Command: "pay", vnp_TmnCode: config.merchant,
    vnp_Amount: String(attempt.amount * 100), vnp_CurrCode: "VND", vnp_TxnRef: attempt.providerReference,
    vnp_OrderInfo: `Thanh toan ${attempt.providerReference}`, vnp_OrderType: "other", vnp_Locale: "vn",
    vnp_CreateDate: attempt.providerCreatedAt, vnp_ExpireDate: vnpayDate(attempt.expiresAt),
    vnp_ReturnUrl: `${appUrl()}/api/payment/vnpay/return`, vnp_IpAddr: ip,
  };
  const canonical = vnpayCanonical(params);
  return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${canonical}&vnp_SecureHash=${vnpayHash(canonical, config.secret)}`;
}
export async function queryVnpay(attempt: PaymentAttempt): Promise<ProviderResult> {
  const config = vnpayConfig();
  const ip = requiredPaymentEnv("VNPAY_QUERY_IP");
  if (!isIP(ip)) throw new Error("VNPAY_QUERY_IP không hợp lệ");
  const body = {
    vnp_RequestId: randomUUID().replaceAll("-", ""), vnp_Version: "2.1.0", vnp_Command: "querydr",
    vnp_TmnCode: config.merchant, vnp_TxnRef: attempt.providerReference, vnp_TransactionDate: attempt.providerCreatedAt,
    vnp_CreateDate: vnpayDate(new Date()), vnp_IpAddr: ip, vnp_OrderInfo: `Truy van ${attempt.providerReference}`,
  };
  const response = await fetch("https://sandbox.vnpayment.vn/merchant_webapi/api/transaction", {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({ ...body, vnp_SecureHash: vnpayHash(Object.values(body).join("|"), config.secret) }),
  });
  if (!response.ok) throw new Error("VNPAY không phản hồi");
  const p = await response.json() as Record<string, string>;
  const keys = ["vnp_ResponseId", "vnp_Command", "vnp_ResponseCode", "vnp_Message", "vnp_TmnCode", "vnp_TxnRef", "vnp_Amount", "vnp_BankCode", "vnp_PayDate", "vnp_TransactionNo", "vnp_TransactionType", "vnp_TransactionStatus", "vnp_OrderInfo", "vnp_PromotionCode", "vnp_PromotionAmount"];
  if (!validHash(keys.map((key) => p[key] ?? "").join("|"), p.vnp_SecureHash ?? "", config.secret)) throw new Error("Chữ ký truy vấn VNPAY sai");
  if (p.vnp_ResponseCode !== "00") throw new Error("VNPAY chưa xác định được giao dịch");
  if (p.vnp_TransactionType !== "01") throw new Error("Giao dịch cần đối soát thủ công");
  return vnpayResult(p, true);
}

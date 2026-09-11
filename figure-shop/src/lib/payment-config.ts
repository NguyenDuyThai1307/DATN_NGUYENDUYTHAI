import { StorefrontError } from "@/lib/storefront-error";

export const isOnlinePayment = (method: string) => method === "PAYOS" || method === "VNPAY";
export function demoPaymentEnabled() {
  return process.env.DEMO_PAYMENT_ENABLED === "true";
}
export function paymentMethods() {
  return [
    { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
    { value: "BANK_TRANSFER", label: "Chuyển khoản thủ công" },
    ...(demoPaymentEnabled() ? [{ value: "DEMO", label: "Thanh toán demo" }] : []),
    ...(process.env.PAYOS_ENABLED === "true" ? [{ value: "PAYOS", label: "Chuyển khoản QR qua payOS (tiền thật)" }] : []),
    ...(process.env.VNPAY_ENABLED === "true" ? [{ value: "VNPAY", label: "VNPAY — Thử nghiệm Sandbox" }] : []),
  ];
}
export function assertPaymentEnabled(method: string) {
  if (!paymentMethods().some((item) => item.value === method)) {
    throw new StorefrontError("Phương thức thanh toán chưa được bật", 409);
  }
}
export function requiredPaymentEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new StorefrontError(`Thiếu cấu hình thanh toán: ${name}`, 503);
  return value;
}
export function appUrl() {
  const url = new URL(requiredPaymentEnv("APP_URL"));
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new StorefrontError("APP_URL phải dùng HTTPS", 503);
  }
  return url.origin;
}
export function reservationMinutes() {
  const value = Number(process.env.PAYMENT_RESERVATION_MINUTES ?? 15);
  if (!Number.isInteger(value) || value < 5 || value > 60) throw new StorefrontError("Thời hạn thanh toán phải từ 5 đến 60 phút", 503);
  return value;
}

import { getCurrentUser } from "@/lib/auth";
import { appUrl } from "@/lib/payment-config";
import { StorefrontError } from "@/lib/storefront-error";
import { isIP } from "node:net";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL ? appUrl() : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new StorefrontError("Nguồn yêu cầu không hợp lệ", 403);
}
export async function paymentUser(request: Request, mutation = false) {
  if (mutation) assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user) throw new StorefrontError("Vui lòng đăng nhập", 401);
  return user;
}
export function paymentError(error: unknown) {
  if (error instanceof StorefrontError) return Response.json({ message: error.message }, { status: error.status });
  if (error instanceof SyntaxError) return Response.json({ message: "JSON không hợp lệ" }, { status: 400 });
  console.error("Payment request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ message: "Không thể xử lý thanh toán. Vui lòng kiểm tra lại trạng thái đơn." }, { status: 503 });
}
export function paymentIp(request: Request) {
  const configured = process.env.PAYMENT_CLIENT_IP_HEADER;
  const ip = configured ? request.headers.get(configured)?.split(",")[0]?.trim() : "127.0.0.1";
  if (!ip || !isIP(ip)) throw new StorefrontError("Không xác định được IP thanh toán", 400);
  if (!configured && process.env.NODE_ENV === "production") throw new StorefrontError("Chưa cấu hình header IP từ proxy tin cậy", 503);
  return ip;
}
export function requestKey(request: Request) {
  const key = request.headers.get("Idempotency-Key") ?? "";
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(key)) throw new StorefrontError("Thiếu mã chống lặp yêu cầu hợp lệ", 400);
  return key;
}

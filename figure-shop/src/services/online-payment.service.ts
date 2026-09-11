import { randomInt, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { StorefrontError } from "@/lib/storefront-error";
import { appUrl, assertPaymentEnabled, isOnlinePayment, requiredPaymentEnv } from "@/lib/payment-config";
import { createPayosLink, payosClient, queryPayos } from "@/services/payment/payos.provider";
import { createVnpayUrl, queryVnpay, vnpayConfig, vnpayDate } from "@/services/payment/vnpay.provider";
import type { ProviderResult } from "@/types/payment";

const openStatuses = ["CREATING", "PENDING", "UNKNOWN"] as const;
const closedStatuses = ["FAILED", "CANCELLED", "EXPIRED"];

export async function paymentOrder(orderId: string, userId: string, staff = false) {
  const order = await prisma.order.findFirst({ where: { id: orderId, ...(staff ? {} : { userId }) }, include: { payment: { include: { attempts: { orderBy: { createdAt: "desc" } } } } } });
  if (!order) throw new StorefrontError("Không tìm thấy đơn hàng", 404);
  return order;
}

export async function paymentStatus(orderId: string, userId: string, staff = false) {
  const order = await paymentOrder(orderId, userId, staff);
  const attempt = order.payment?.attempts[0];
  return { orderId, orderNumber: order.orderNumber, orderStatus: order.status, paymentStatus: order.paymentStatus,
    method: order.paymentMethod, environment: order.payment?.environment, needsReview: order.payment?.needsReview ?? false,
    expiresAt: order.paymentExpiresAt, attemptStatus: attempt?.status ?? null,
    cancelRequested: Boolean(order.cancelRequestedAt),
    canPay: isOnlinePayment(order.paymentMethod) && order.paymentStatus === "UNPAID" && order.status === "PENDING" && !order.cancelRequestedAt && !order.payment?.needsReview && Boolean(order.paymentExpiresAt && order.paymentExpiresAt > new Date()),
    canCancel: isOnlinePayment(order.paymentMethod) && order.paymentStatus === "UNPAID" && order.status === "PENDING" && !order.cancelRequestedAt && !order.payment?.needsReview,
  };
}

export async function createPaymentRequest(orderId: string, userId: string, requestKey: string, ip: string) {
  const order = await paymentOrder(orderId, userId);
  if (!isOnlinePayment(order.paymentMethod) || !order.payment) throw new StorefrontError("Đơn hàng không thanh toán trực tuyến", 409);
  if (order.paymentStatus !== "UNPAID" || order.status !== "PENDING" || order.cancelRequestedAt || order.payment.needsReview) throw new StorefrontError("Đơn hàng không thể tạo thanh toán", 409);
  assertPaymentEnabled(order.paymentMethod);
  if (!Number.isSafeInteger(order.total) || order.total <= 0 || order.total > 2_147_483_647) throw new StorefrontError("Số tiền thanh toán không hợp lệ", 409);
  if (!order.paymentExpiresAt || order.paymentExpiresAt <= new Date()) throw new StorefrontError("Đã hết hạn thanh toán. Vui lòng kiểm tra trạng thái đơn", 409);
  appUrl();
  const merchant = order.paymentMethod === "PAYOS" ? payosClient().clientId : vnpayConfig().merchant;
  const attempt = await prisma.$transaction(async (tx) => {
    // Re-read inside the transaction to serialize against cancellation and callbacks.
    const current = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { payment: true } });
    if (current.status !== "PENDING" || current.paymentStatus !== "UNPAID" || current.cancelRequestedAt || current.payment?.needsReview || !current.paymentExpiresAt || current.paymentExpiresAt <= new Date()) throw new StorefrontError("Đơn hàng đã thay đổi trạng thái", 409);
    const active = await tx.paymentAttempt.findUnique({ where: { activePaymentId: order.payment!.id } });
    if (active) return { value: active, created: false };
    const replay = await tx.paymentAttempt.findUnique({ where: { requestKey } });
    if (replay) {
      if (replay.paymentId !== order.payment!.id) throw new StorefrontError("Mã yêu cầu không hợp lệ", 409);
      return { value: replay, created: false };
    }
    const reference = order.paymentMethod === "PAYOS" ? String(randomInt(1_000_000_000, 999_999_999_999)) : randomUUID().replaceAll("-", "");
    const value = await tx.paymentAttempt.create({ data: {
      paymentId: order.payment!.id, activePaymentId: order.payment!.id, requestKey, provider: order.paymentMethod,
      environment: order.payment!.environment, merchantAccountId: merchant, providerReference: reference,
      providerCreatedAt: vnpayDate(new Date()), amount: order.total, expiresAt: order.paymentExpiresAt!,
    } });
    // VNPAY URL generation is local: persist it in the same transaction as its reference.
    if (value.provider === "VNPAY") return { created: false, value: await tx.paymentAttempt.update({ where: { id: value.id }, data: { checkoutUrl: createVnpayUrl(value, ip), status: "PENDING" } }) };
    return { created: true, value };
  });
  if (!attempt.created) return attemptDto(attempt.value);
  try {
    const value = attempt.value;
    let checkoutUrl: string;
    let providerPaymentId: string | undefined;
    if (value.provider === "PAYOS") {
      const response = await createPayosLink(value, orderId);
      if (String(response.orderCode) !== value.providerReference || response.amount !== value.amount || response.currency !== "VND") throw new Error("Phản hồi tạo link không khớp");
      checkoutUrl = response.checkoutUrl;
      providerPaymentId = response.paymentLinkId;
    } else checkoutUrl = createVnpayUrl(value, ip);
    const target = new URL(checkoutUrl);
    if (target.protocol !== "https:" || !(value.provider === "PAYOS" ? target.hostname === "pay.payos.vn" : target.hostname === "sandbox.vnpayment.vn")) throw new Error("URL thanh toán không hợp lệ");
    await prisma.paymentAttempt.updateMany({ where: { id: value.id, status: "CREATING" }, data: { status: "PENDING", checkoutUrl, providerPaymentId } });
    return attemptDto(await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: value.id } }));
  } catch {
    await prisma.paymentAttempt.updateMany({ where: { id: attempt.value.id, status: "CREATING" }, data: { status: "UNKNOWN" } });
    return attemptDto(await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: attempt.value.id } }));
  }
}

function attemptDto(attempt: { id: string; status: string; checkoutUrl: string | null; expiresAt: Date }) {
  return { attemptId: attempt.id, status: attempt.status, checkoutUrl: attempt.status === "PENDING" && attempt.expiresAt > new Date() ? attempt.checkoutUrl : null, expiresAt: attempt.expiresAt };
}

/** Only call with a verified provider notification or authenticated query result. */
export async function applyPaymentResult(provider: "PAYOS" | "VNPAY", result: ProviderResult) {
  return prisma.$transaction(async (tx) => {
    const attempt = await tx.paymentAttempt.findUnique({ where: { providerReference: result.reference }, include: { payment: { include: { order: true } } } });
    if (!attempt || attempt.provider !== provider) return "NOT_FOUND" as const;
    if (attempt.merchantAccountId !== result.merchantAccountId || attempt.environment !== (provider === "PAYOS" ? "LIVE" : "SANDBOX") || result.currency !== "VND" || (attempt.providerPaymentId && result.paymentLinkId && attempt.providerPaymentId !== result.paymentLinkId)) return "INVALID" as const;
    if (!Number.isSafeInteger(result.amount) || result.amount < 0) return "INVALID" as const;
    if (result.status === "SUCCEEDED" && !result.transactionId) return "INVALID" as const;
    const key = `${provider}:${attempt.merchantAccountId}:${result.reference}:${result.transactionId ?? "state"}:${result.status}:${result.amount}:${Boolean(result.needsReview)}`;
    if (await tx.paymentEvent.findUnique({ where: { eventKey: key } })) return "DUPLICATE" as const;
    await tx.paymentEvent.create({ data: { attemptId: attempt.id, eventKey: key, amount: result.amount, providerTransactionId: result.transactionId, result: result.status } });
    if (result.needsReview) await tx.payment.update({ where: { id: attempt.paymentId }, data: { needsReview: true, reviewReason: "PROVIDER_REVIEW" } });
    if (result.amount !== attempt.amount) {
      await tx.payment.update({ where: { id: attempt.paymentId }, data: { needsReview: true, reviewReason: "AMOUNT_MISMATCH" } });
      return "AMOUNT_MISMATCH" as const;
    }
    if (!result.needsReview && ["RECONCILIATION_UNAVAILABLE", "EXPIRED_UNRESOLVED"].includes(attempt.payment.reviewReason ?? "") && result.status !== "UNKNOWN" && result.status !== "PENDING") {
      await tx.payment.update({ where: { id: attempt.paymentId }, data: { needsReview: false, reviewReason: null } });
    }
    if (result.status === "SUCCEEDED") {
      const payment = attempt.payment;
      const duplicateMoney = payment.status === "PAID" && payment.transactionCode !== result.transactionId;
      const review = duplicateMoney || payment.order.status === "CANCELLED" || payment.status === "REFUNDED";
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "SUCCEEDED", activePaymentId: null, providerPaymentId: result.paymentLinkId ?? attempt.providerPaymentId } });
      await tx.payment.update({ where: { id: payment.id }, data: {
        ...(payment.status !== "PAID" && payment.status !== "REFUNDED" ? { status: "PAID", paidAt: new Date(), transactionCode: result.transactionId } : {}),
        ...(review ? { needsReview: true, reviewReason: duplicateMoney ? "DUPLICATE_PAYMENT" : "LATE_PAYMENT" } : {}),
      } });
      if (payment.status !== "REFUNDED") await tx.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "PAID", ...(payment.order.status === "PENDING" ? { status: "CONFIRMED" } : {}) } });
    } else if (attempt.status !== "SUCCEEDED") {
      const closed = closedStatuses.includes(result.status);
      // A pending query must not reopen an attempt already closed by another callback.
      if (closed || openStatuses.some((s) => s === attempt.status)) await tx.paymentAttempt.update({ where: { id: attempt.id }, data: {
        status: result.status, ...(closed ? { activePaymentId: null } : {}),
        ...(result.checkoutUrl ? { checkoutUrl: result.checkoutUrl } : {}), providerPaymentId: result.paymentLinkId ?? attempt.providerPaymentId,
      } });
    }
    return "APPLIED" as const;
  });
}

export async function reconcileAttempt(attemptId: string, cancel = false) {
  const token = randomUUID();
  const now = new Date();
  const leased = await prisma.paymentAttempt.updateMany({ where: { id: attemptId, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] }, data: { leaseToken: token, leaseUntil: new Date(now.getTime() + 60_000) } });
  if (!leased.count) return;
  try {
    const attempt = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    // Don't race a create request that is still in flight.
    if (attempt.status === "CREATING" && now.getTime() - attempt.createdAt.getTime() < 30_000) return;
    if (attempt.status === "SUCCEEDED" || closedStatuses.includes(attempt.status)) return;
    const merchant = attempt.provider === "PAYOS" ? requiredPaymentEnv("PAYOS_CLIENT_ID") : vnpayConfig().merchant;
    if (merchant !== attempt.merchantAccountId) throw new Error("Merchant đã thay đổi");
    const results = attempt.provider === "PAYOS" ? await queryPayos(attempt, cancel) : [await queryVnpay(attempt)];
    for (const result of results) {
      if (result.reference !== attempt.providerReference || result.merchantAccountId !== attempt.merchantAccountId) throw new Error("Phản hồi truy vấn không khớp yêu cầu");
      await applyPaymentResult(attempt.provider as "PAYOS" | "VNPAY", result);
    }
    const updated = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    if (updated.expiresAt < now && openStatuses.some((s) => s === updated.status)) await prisma.payment.updateMany({ where: { id: updated.paymentId, needsReview: false }, data: { needsReview: true, reviewReason: "EXPIRED_UNRESOLVED" } });
  } catch {
    const attempt = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    await prisma.paymentAttempt.updateMany({ where: { id: attemptId, status: { in: [...openStatuses] } }, data: { status: "UNKNOWN" } });
    if (attempt.expiresAt < now) await prisma.payment.updateMany({ where: { id: attempt.paymentId, needsReview: false }, data: { needsReview: true, reviewReason: "RECONCILIATION_UNAVAILABLE" } });
  } finally {
    await prisma.paymentAttempt.updateMany({ where: { id: attemptId, leaseToken: token }, data: { leaseUntil: null, leaseToken: null, lastReconciledAt: new Date() } });
  }
}

export async function releaseUnpaidOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payment: { include: { attempts: true } } } });
    if (!order || !isOnlinePayment(order.paymentMethod) || order.status !== "PENDING" || order.paymentStatus !== "UNPAID" || order.reservationReleasedAt || order.payment?.needsReview) return false;
    if (order.payment?.attempts.some((a) => !closedStatuses.includes(a.status))) return false;
    const changed = await tx.order.updateMany({ where: { id: order.id, status: "PENDING", paymentStatus: "UNPAID", reservationReleasedAt: null }, data: { status: "CANCELLED", reservationReleasedAt: new Date() } });
    if (!changed.count) return false;
    for (const item of order.items) if (item.productId && item.reservedQuantity > 0) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.reservedQuantity } } });
    if (order.couponUsageReserved && order.couponId) await tx.coupon.updateMany({ where: { id: order.couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
    return true;
  });
}

export async function refreshPayment(orderId: string, userId: string, staff = false, cancel = false) {
  const order = await paymentOrder(orderId, userId, staff);
  if (!isOnlinePayment(order.paymentMethod)) throw new StorefrontError("Không phải đơn thanh toán trực tuyến", 409);
  if (cancel) await prisma.order.updateMany({ where: { id: orderId, status: "PENDING", paymentStatus: "UNPAID", cancelRequestedAt: null }, data: { cancelRequestedAt: new Date() } });
  const shouldCancel = cancel || Boolean(order.cancelRequestedAt);
  for (const attempt of order.payment?.attempts ?? []) {
    const cooldown = attempt.provider === "VNPAY" ? 300_000 : 30_000;
    if (attempt.lastReconciledAt && Date.now() - attempt.lastReconciledAt.getTime() < cooldown) continue;
    await reconcileAttempt(attempt.id, shouldCancel);
  }
  if (shouldCancel || (order.paymentExpiresAt && order.paymentExpiresAt <= new Date())) await releaseUnpaidOrder(orderId);
  return paymentStatus(orderId, userId, staff);
}

export async function reconcilePaymentsBatch() {
  const orders = await prisma.order.findMany({ where: { paymentMethod: { in: ["PAYOS", "VNPAY"] }, status: "PENDING", paymentStatus: "UNPAID" }, take: 50, orderBy: { updatedAt: "asc" }, select: { id: true, userId: true } });
  for (const order of orders) {
    await refreshPayment(order.id, order.userId);
    await prisma.order.update({ where: { id: order.id }, data: { updatedAt: new Date() } });
  }
  return orders.length;
}

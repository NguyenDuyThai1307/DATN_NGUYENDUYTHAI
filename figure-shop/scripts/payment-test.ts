import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { freshPaymentDb } from "./payment-test-db";
import type { CheckoutInput } from "../src/validations/order.schema";
import type { ProviderResult } from "../src/types/payment";

async function main() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Unexpected network call in payment tests"); };
  await freshPaymentDb("services");
  Object.assign(process.env, { APP_URL: "http://localhost:3000", DEMO_PAYMENT_ENABLED: "true", VNPAY_ENABLED: "true", VNPAY_ENV: "sandbox", VNPAY_TMN_CODE: "TESTONLY", VNPAY_HASH_SECRET: "test-secret-not-real", PAYOS_ENABLED: "true", PAYOS_CLIENT_ID: "test-client", PAYOS_API_KEY: "test-api", PAYOS_CHECKSUM_KEY: "test-checksum" });
  const { prisma } = await import("../src/lib/prisma");
  const { createOrderFromCart } = await import("../src/services/order.service");
  const service = await import("../src/services/online-payment.service");
  const { markDemoPaymentAsPaid } = await import("../src/services/payment.service");
  const vnp = await import("../src/services/payment/vnpay.provider");
  const { safeRedirect } = await import("../src/lib/safe-redirect");
  let checks = 0;
  const pass = (name: string) => { checks++; console.log(`PASS ${name}`); };
  try {
    const user = await prisma.user.create({ data: { email: "payment@test.local", passwordHash: "not-a-login" } });
    const other = await prisma.user.create({ data: { email: "other@test.local", passwordHash: "not-a-login" } });
    const product = await prisma.product.create({ data: { name: "Payment test", slug: "payment-test", price: 100000, stock: 100, status: "ACTIVE" } });
    const preorder = await prisma.product.create({ data: { name: "Preorder", slug: "preorder-test", price: 10000, stock: 0, status: "ACTIVE", type: "PREORDER" } });
    const coupon = await prisma.coupon.create({ data: { code: "TESTPAY", name: "test", type: "FIXED_AMOUNT", value: 10000, startsAt: new Date(0), endsAt: new Date("2099-01-01"), usageLimit: 100 } });
    const input: CheckoutInput = { receiverName: "Test user", receiverPhone: "0901234567", province: "HCM", district: "Q1", ward: "P1", addressDetail: "Test address", paymentMethod: "VNPAY" };
    async function cart(withCoupon = false, mixed = false) {
      const c = await prisma.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
      await prisma.cartItem.deleteMany({ where: { cartId: c.id } });
      await prisma.cart.update({ where: { id: c.id }, data: { couponId: withCoupon ? coupon.id : null, items: { create: [{ productId: product.id, quantity: 1 }, ...(mixed ? [{ productId: preorder.id, quantity: 1 }] : [])] } } });
    }
    await cart(true, true);
    const key = randomUUID();
    const order = await createOrderFromCart(user.id, input, key);
    const replay = await createOrderFromCart(user.id, input, key);
    assert.equal(replay.id, order.id);
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 99);
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: preorder.id } })).stock, 0);
    assert.equal((await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })).usedCount, 1);
    await assert.rejects(createOrderFromCart(user.id, { ...input, note: "changed" }, key));
    pass("checkout replay after cleared cart, mixed inventory, coupon once, key conflict");
    const request = await service.createPaymentRequest(order.id, user.id, randomUUID(), "127.0.0.1");
    const same = await service.createPaymentRequest(order.id, user.id, randomUUID(), "127.0.0.1");
    assert.equal(same.attemptId, request.attemptId);
    assert.ok(request.checkoutUrl?.startsWith("https://sandbox.vnpayment.vn/"));
    const params = vnp.vnpayParams(new URL(request.checkoutUrl!));
    vnp.verifyVnpay(params);
    assert.equal(params.vnp_Amount, String(order.total * 100));
    assert.equal(vnp.vnpayDate(new Date("2026-01-01T00:00:00Z")), "20260101070000");
    assert.throws(() => vnp.verifyVnpay({ ...params, vnp_Amount: "1" }));
    assert.throws(() => vnp.vnpayParams(new URL(request.checkoutUrl! + "&vnp_Amount=1")));
    await assert.rejects(service.paymentStatus(order.id, other.id));
    await assert.rejects(markDemoPaymentAsPaid(order.id, user.id));
    pass("stable attempt, signed VNPAY amount/time, tamper rejection, owner and demo guards");
    const result: ProviderResult = { reference: params.vnp_TxnRef, merchantAccountId: "TESTONLY", amount: order.total, currency: "VND", status: "SUCCEEDED", transactionId: "100001" };
    const pair = await Promise.all([service.applyPaymentResult("VNPAY", result), service.applyPaymentResult("VNPAY", result)]);
    assert.ok(pair.includes("APPLIED")); assert.ok(pair.includes("DUPLICATE"));
    assert.equal((await service.paymentStatus(order.id, user.id)).paymentStatus, "PAID");
    await prisma.order.update({ where: { id: order.id }, data: { status: "SHIPPED" } });
    await service.applyPaymentResult("VNPAY", { ...result, status: "FAILED", transactionId: undefined });
    assert.equal((await service.paymentStatus(order.id, user.id)).orderStatus, "SHIPPED");
    assert.equal((await service.paymentStatus(order.id, user.id)).paymentStatus, "PAID");
    await service.applyPaymentResult("VNPAY", { ...result, transactionId: "100002" });
    assert.equal((await service.paymentStatus(order.id, user.id)).needsReview, true);
    pass("concurrent callbacks, PAID monotonicity, shipped status, duplicate money review");

    await cart(true);
    const cancelled = await createOrderFromCart(user.id, input, randomUUID());
    const cancelRequest = await service.createPaymentRequest(cancelled.id, user.id, randomUUID(), "127.0.0.1");
    const cancelAttempt = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: cancelRequest.attemptId } });
    assert.equal(await service.releaseUnpaidOrder(cancelled.id), false);
    await service.applyPaymentResult("VNPAY", { ...result, reference: cancelAttempt.providerReference, amount: cancelled.total, status: "FAILED", transactionId: undefined });
    const stockBefore = (await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock;
    assert.equal(await service.releaseUnpaidOrder(cancelled.id), true);
    assert.equal(await service.releaseUnpaidOrder(cancelled.id), false);
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, stockBefore + 1);
    assert.equal((await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })).usedCount, 1);
    await service.applyPaymentResult("VNPAY", { ...result, reference: cancelAttempt.providerReference, amount: cancelled.total, transactionId: "100003" });
    const late = await service.paymentStatus(cancelled.id, user.id);
    assert.equal(late.paymentStatus, "PAID"); assert.equal(late.orderStatus, "CANCELLED"); assert.equal(late.needsReview, true);
    pass("no release of open attempt, exactly-once release, late money retained without reopening order");

    await cart();
    const unpaid = await createOrderFromCart(user.id, input, randomUUID());
    const ureq = await service.createPaymentRequest(unpaid.id, user.id, randomUUID(), "127.0.0.1");
    const ua = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: ureq.attemptId } });
    assert.equal(await service.applyPaymentResult("VNPAY", { ...result, reference: ua.providerReference, merchantAccountId: "WRONG" }), "INVALID");
    assert.equal(await service.applyPaymentResult("VNPAY", { ...result, reference: ua.providerReference, amount: 1, transactionId: "100004" }), "AMOUNT_MISMATCH");
    assert.equal((await service.paymentStatus(unpaid.id, user.id)).paymentStatus, "UNPAID");
    assert.equal(await service.releaseUnpaidOrder(unpaid.id), false);
    pass("merchant mismatch and amount mismatch never mark order paid or release reservation");

    await cart();
    const demo = await createOrderFromCart(user.id, { ...input, paymentMethod: "DEMO" }, randomUUID());
    await prisma.order.update({ where: { id: demo.id }, data: { status: "CANCELLED" } });
    await assert.rejects(markDemoPaymentAsPaid(demo.id, user.id));
    process.env.DEMO_PAYMENT_ENABLED = "false";
    await assert.rejects(markDemoPaymentAsPaid(demo.id, user.id));
    pass("cancelled and disabled demo rejected");

    await cart();
    await prisma.product.update({ where: { id: product.id }, data: { price: 0 } });
    const free = await createOrderFromCart(user.id, input, randomUUID());
    assert.equal(free.total, 0); assert.equal(free.paymentStatus, "PAID"); assert.equal(free.payment?.transactionCode, null);
    await assert.rejects(service.createPaymentRequest(free.id, user.id, randomUUID(), "127.0.0.1"));
    pass("zero amount completes without a fake gateway transaction");

    assert.equal(safeRedirect("//evil.test"), "/"); assert.equal(safeRedirect("/\\evil.test"), "/");
    assert.equal(safeRedirect("/checkout/payment-result?orderId=123"), "/checkout/payment-result?orderId=123");
    const { getAdminDashboardStats } = await import("../src/services/admin.service");
    assert.equal((await getAdminDashboardStats()).paidRevenue, 0);
    pass("safe return URL and sandbox excluded from real revenue");

    await prisma.product.update({ where: { id: product.id }, data: { price: 100000 } });
    await cart();
    const payOrder = await createOrderFromCart(user.id, { ...input, paymentMethod: "PAYOS" }, randomUUID());
    const { payosClient } = await import("../src/services/payment/payos.provider");
    let createCalls = 0;
    let queryCalls = 0;
    let providerCode = 0;
    let paid = false;
    const signedResponse = async (data: object) => Response.json({ code: "00", desc: "success", data, signature: await payosClient().crypto.createSignatureFromObj(data, "test-checksum") });
    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).startsWith("https://api-merchant.payos.vn/v2/payment-requests"));
      if (init?.method === "POST") {
        createCalls++;
        const data = JSON.parse(String(init.body));
        providerCode = data.orderCode;
        assert.equal(data.amount, payOrder.total);
        assert.ok(data.signature);
        throw new Error("Simulated response lost after provider created link");
      }
      queryCalls++;
      return signedResponse({ id: "recovered-link", orderCode: providerCode, amount: payOrder.total, amountPaid: paid ? payOrder.total : 0, amountRemaining: paid ? 0 : payOrder.total, status: paid ? "PAID" : "PENDING", createdAt: new Date().toISOString(), transactions: paid ? [{ reference: "PAYOS-MOCK-TRANSFER", amount: payOrder.total, accountNumber: "test", description: "test", transactionDateTime: "2026-09-09 12:00:00" }] : [], cancellationReason: null, canceledAt: null });
    };
    const lost = await service.createPaymentRequest(payOrder.id, user.id, randomUUID(), "127.0.0.1");
    assert.equal(lost.status, "UNKNOWN");
    await service.createPaymentRequest(payOrder.id, user.id, randomUUID(), "127.0.0.1");
    assert.equal(createCalls, 1);
    await Promise.all([service.reconcileAttempt(lost.attemptId), service.reconcileAttempt(lost.attemptId)]);
    assert.equal(queryCalls, 1);
    const recovered = await service.createPaymentRequest(payOrder.id, user.id, randomUUID(), "127.0.0.1");
    assert.equal(recovered.checkoutUrl, "https://pay.payos.vn/web/recovered-link");
    assert.equal(createCalls, 1);
    paid = true;
    await service.reconcileAttempt(lost.attemptId);
    assert.equal((await service.paymentStatus(payOrder.id, user.id)).paymentStatus, "PAID");
    pass("payOS SDK signed queries recover lost create response; lease avoids concurrent queries; transfer reconciles");

    await cart();
    const zeroCoupon = await prisma.coupon.create({ data: { code: "ZERO", name: "zero", type: "FIXED_AMOUNT", value: 0, startsAt: new Date(0), endsAt: new Date("2099-01-01"), usedCount: 5 } });
    await prisma.cart.update({ where: { userId: user.id }, data: { couponId: zeroCoupon.id } });
    const zeroDiscount = await createOrderFromCart(user.id, input, randomUUID());
    assert.equal(zeroDiscount.couponUsageReserved, false);
    await service.releaseUnpaidOrder(zeroDiscount.id);
    assert.equal((await prisma.coupon.findUniqueOrThrow({ where: { id: zeroCoupon.id } })).usedCount, 5);
    pass("zero-value coupon cancellation does not decrement another order's usage");

    for (const state of ["04", "05", "06", "07", "09"]) {
      const flagged = vnp.vnpayResult({ vnp_TmnCode: "TESTONLY", vnp_TxnRef: "ref", vnp_Amount: "10000", vnp_ResponseCode: "00", vnp_TransactionStatus: state });
      assert.equal(flagged.status, "UNKNOWN"); assert.equal(flagged.needsReview, true);
    }
    pass("VNPAY reversal/refund/suspicious statuses never count as terminal unpaid");

    globalThis.fetch = async () => { throw new Error("Simulated outage"); };
    await prisma.paymentAttempt.update({ where: { id: ua.id }, data: { expiresAt: new Date(0) } });
    await service.reconcileAttempt(ua.id);
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { orderId: unpaid.id } })).reviewReason, "AMOUNT_MISMATCH");
    await service.applyPaymentResult("VNPAY", { ...result, reference: ua.providerReference, amount: unpaid.total, status: "FAILED", transactionId: undefined });
    assert.equal(await service.releaseUnpaidOrder(unpaid.id), false);
    pass("outage and later failure cannot erase an underpayment review or release its stock");

    await cart();
    const toCancel = await createOrderFromCart(user.id, { ...input, paymentMethod: "PAYOS" }, randomUUID());
    let cancelCode = 0;
    let cancelCalls = 0;
    globalThis.fetch = async (url, init) => {
      if (String(url).endsWith("/cancel")) {
        cancelCalls++;
        return signedResponse({ id: "cancel-link", orderCode: cancelCode, amount: toCancel.total, amountPaid: 0, amountRemaining: toCancel.total, status: "CANCELLED", transactions: [], createdAt: new Date().toISOString(), cancellationReason: "test", canceledAt: new Date().toISOString() });
      }
      const data = JSON.parse(String(init?.body));
      cancelCode = data.orderCode;
      return signedResponse({ orderCode: cancelCode, amount: toCancel.total, currency: "VND", paymentLinkId: "cancel-link", checkoutUrl: "https://pay.payos.vn/web/cancel-link", status: "PENDING", bin: "000000", accountNumber: "test", accountName: "test", description: "test", qrCode: "test" });
    };
    const ca = await service.createPaymentRequest(toCancel.id, user.id, randomUUID(), "127.0.0.1");
    assert.equal(ca.status, "PENDING");
    await prisma.paymentAttempt.update({ where: { id: ca.attemptId }, data: { lastReconciledAt: new Date() } });
    const requestedCancel = await service.refreshPayment(toCancel.id, user.id, false, true);
    assert.equal(requestedCancel.cancelRequested, true); assert.equal(requestedCancel.canPay, false); assert.equal(cancelCalls, 0);
    await assert.rejects(service.createPaymentRequest(toCancel.id, user.id, randomUUID(), "127.0.0.1"));
    await prisma.paymentAttempt.update({ where: { id: ca.attemptId }, data: { lastReconciledAt: new Date(0) } });
    const finishedCancel = await service.refreshPayment(toCancel.id, user.id);
    assert.equal(finishedCancel.orderStatus, "CANCELLED"); assert.equal(cancelCalls, 1);
    pass("signed payOS create/cancel; cancellation survives cooldown and blocks new payment requests");

    globalThis.fetch = async () => { throw new Error("Unexpected network call"); };
    await cart();
    const race = await createOrderFromCart(user.id, input, randomUUID());
    const ra = await service.createPaymentRequest(race.id, user.id, randomUUID(), "127.0.0.1");
    const rattempt = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: ra.attemptId } });
    const rr = { ...result, reference: rattempt.providerReference, amount: race.total, transactionId: "RACE-TRANSFER" };
    await service.applyPaymentResult("VNPAY", { ...rr, status: "FAILED", transactionId: undefined });
    const beforeRaceStock = (await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock;
    await Promise.all([service.releaseUnpaidOrder(race.id), service.applyPaymentResult("VNPAY", rr)]);
    const afterRace = await service.paymentStatus(race.id, user.id);
    assert.equal(afterRace.paymentStatus, "PAID");
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, beforeRaceStock + (afterRace.orderStatus === "CANCELLED" ? 1 : 0));
    assert.equal(await service.releaseUnpaidOrder(race.id), false);
    pass("expiry/callback race retains payment and consistent inventory");

    await cart();
    const concurrentKey = randomUUID();
    const [firstOrder, secondOrder] = await Promise.all([createOrderFromCart(user.id, input, concurrentKey), createOrderFromCart(user.id, input, concurrentKey)]);
    assert.equal(firstOrder.id, secondOrder.id);
    pass("concurrent checkout with one idempotency key creates one order");

    await cart();
    const queryOrder = await createOrderFromCart(user.id, input, randomUUID());
    const qr = await service.createPaymentRequest(queryOrder.id, user.id, randomUUID(), "127.0.0.1");
    const qa = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: qr.attemptId } });
    process.env.VNPAY_QUERY_IP = "127.0.0.1";
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");
      const request = JSON.parse(String(init?.body));
      assert.equal(request.vnp_Command, "querydr");
      assert.equal(request.vnp_TransactionDate, qa.providerCreatedAt);
      const requestFields = ["vnp_RequestId", "vnp_Version", "vnp_Command", "vnp_TmnCode", "vnp_TxnRef", "vnp_TransactionDate", "vnp_CreateDate", "vnp_IpAddr", "vnp_OrderInfo"];
      assert.equal(request.vnp_SecureHash, vnp.vnpayHash(requestFields.map((key) => request[key]).join("|"), "test-secret-not-real"));
      const response = { vnp_ResponseId: "QUERY1", vnp_Command: "querydr", vnp_ResponseCode: "00", vnp_Message: "success", vnp_TmnCode: "TESTONLY", vnp_TxnRef: qa.providerReference, vnp_Amount: String(queryOrder.total * 100), vnp_BankCode: "NCB", vnp_PayDate: "20260909120000", vnp_TransactionNo: "999999", vnp_TransactionType: "01", vnp_TransactionStatus: "00", vnp_OrderInfo: "test", vnp_PromotionCode: "", vnp_PromotionAmount: "" };
      return Response.json({ ...response, vnp_SecureHash: vnp.vnpayHash(Object.values(response).join("|"), "test-secret-not-real") });
    };
    await service.reconcileAttempt(qr.attemptId);
    assert.equal((await service.paymentStatus(queryOrder.id, user.id)).paymentStatus, "PAID");
    pass("VNPAY QueryDr signs pipe-separated request and verifies signed response against saved reference/date");
    console.log(`${checks} payment test groups passed; no provider network calls.`);
  } finally { globalThis.fetch = originalFetch; await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("http");
  const port = await new Promise<number>((done) => {
    const socket = createServer();
    socket.listen(0, "127.0.0.1", () => { const address = socket.address(); if (!address || typeof address === "string") throw new Error("No port"); socket.close(() => done(address.port)); });
  });
  const base = `http://127.0.0.1:${port}`;
  Object.assign(process.env, { APP_URL: base, JWT_SECRET: "payment-http-test-secret-not-real", VNPAY_ENABLED: "true", VNPAY_ENV: "sandbox", VNPAY_TMN_CODE: "TESTONLY", VNPAY_HASH_SECRET: "http-test-secret", PAYOS_ENABLED: "false", PAYOS_CLIENT_ID: "http-test-client", PAYOS_API_KEY: "http-test-api", PAYOS_CHECKSUM_KEY: "http-test-checksum", DEMO_PAYMENT_ENABLED: "false", PAYMENT_CLIENT_IP_HEADER: "x-real-ip" });
  const { prisma } = await import("../src/lib/prisma");
  const { signJwt } = await import("../src/lib/jwt");
  const { payosClient } = await import("../src/services/payment/payos.provider");
  const vnp = await import("../src/services/payment/vnpay.provider");
  const child = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, NODE_ENV: "production" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (data) => { logs = (logs + data.toString()).slice(-8000); });
  child.stderr.on("data", (data) => { logs = (logs + data.toString()).slice(-8000); });
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (child.exitCode !== null) throw new Error(logs);
      try { await fetch(`${base}/api/auth/me`); ready = true; break; } catch { await new Promise((r) => setTimeout(r, 500)); }
    }
    assert.ok(ready, logs);
    const user = await prisma.user.create({ data: { email: "http@test.local", passwordHash: "not-a-login" } });
    const stranger = await prisma.user.create({ data: { email: "stranger@test.local", passwordHash: "not-a-login" } });
    const cookie = `figure_shop_token=${await signJwt({ userId: user.id, email: user.email, role: "CUSTOMER" })}`;
    const otherCookie = `figure_shop_token=${await signJwt({ userId: stranger.id, email: stranger.email, role: "CUSTOMER" })}`;
    const headers = { cookie, origin: base, "Content-Type": "application/json", "Idempotency-Key": randomUUID(), "x-real-ip": "127.0.0.1" };
    const product = await prisma.product.create({ data: { name: "HTTP test", slug: "http-test", price: 120000, stock: 5, status: "ACTIVE" } });
    await prisma.cart.create({ data: { userId: user.id, items: { create: { productId: product.id, quantity: 1 } } } });
    const payload = { receiverName: "HTTP test", receiverPhone: "0901234567", province: "HCM", district: "Q1", ward: "P1", addressDetail: "Test address", paymentMethod: "VNPAY" };
    assert.equal((await fetch(`${base}/api/orders`, { method: "POST", headers: { ...headers, origin: "https://evil.invalid" }, body: JSON.stringify(payload) })).status, 403);
    const created = await fetch(`${base}/api/orders`, { method: "POST", headers, body: JSON.stringify(payload) });
    assert.equal(created.status, 201, await created.clone().text());
    const { order } = await created.json();
    assert.equal((await fetch(`${base}/api/orders`, { method: "POST", headers, body: JSON.stringify(payload) })).status, 200);
    assert.equal((await fetch(`${base}/api/payment/orders/${order.id}`)).status, 401);
    assert.equal((await fetch(`${base}/api/payment/orders/${order.id}`, { headers: { cookie: otherCookie } })).status, 404);
    const request = await fetch(`${base}/api/payment/requests`, { method: "POST", headers: { ...headers, "Idempotency-Key": randomUUID() }, body: JSON.stringify({ orderId: order.id, amount: 1 }) });
    assert.equal(request.status, 200, await request.clone().text());
    const payment = await request.json();
    const signedUrl = new URL(payment.checkoutUrl);
    assert.equal(signedUrl.searchParams.get("vnp_Amount"), String(order.total * 100));
    const attempt = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: payment.attemptId } });
    const callback = { vnp_TmnCode: "TESTONLY", vnp_TxnRef: attempt.providerReference, vnp_Amount: String(order.total * 100), vnp_ResponseCode: "00", vnp_TransactionStatus: "00", vnp_TransactionNo: "123456789", vnp_BankCode: "NCB" };
    const query = vnp.vnpayCanonical(callback) + "&vnp_SecureHash=" + vnp.vnpayHash(vnp.vnpayCanonical(callback), process.env.VNPAY_HASH_SECRET!);
    const returned = await fetch(`${base}/api/payment/vnpay/return?${query}`, { redirect: "manual" });
    assert.equal(returned.status, 303);
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus, "UNPAID");
    const loggedOut = await fetch(returned.headers.get("location")!, { redirect: "manual" });
    assert.equal(loggedOut.status, 307);
    assert.ok(new URL(loggedOut.headers.get("location")!, base).searchParams.get("redirect")?.includes(order.id));
    const bad = await fetch(`${base}/api/payment/vnpay/ipn?${query.replace("vnp_Amount=12000000", "vnp_Amount=100")}`);
    assert.equal((await bad.json()).RspCode, "97");
    const ipn = await fetch(`${base}/api/payment/vnpay/ipn?${query}`);
    assert.equal((await ipn.json()).RspCode, "00");
    assert.equal((await (await fetch(`${base}/api/payment/vnpay/ipn?${query}`)).json()).RspCode, "02");
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus, "PAID");
    assert.equal((await fetch(`${base}/api/payment/demo`, { method: "POST", headers, body: JSON.stringify({ orderId: order.id }) })).status, 400);
    const statusResponse = await fetch(`${base}/api/payment/orders/${order.id}`, { headers: { cookie } });
    assert.equal(statusResponse.headers.get("cache-control"), "no-store");
    assert.ok(!(await statusResponse.text()).includes("providerTransactionId"));
    const page = await fetch(`${base}/checkout/payment-result?orderId=${order.id}`, { headers: { cookie } });
    assert.equal(page.status, 200);
    console.log("PASS HTTP: checkout replay, CSRF, auth/ownership, server amount, return before IPN, login query, signature tamper, IPN dedupe, demo disabled, result page");

    const payOrder = await prisma.order.create({ data: { ...payload, paymentMethod: "PAYOS", userId: user.id, orderNumber: "HTTP-PAYOS", subtotal: 3000, total: 3000, payment: { create: { amount: 3000, method: "PAYOS", environment: "LIVE" } } }, include: { payment: true } });
    await prisma.paymentAttempt.create({ data: { paymentId: payOrder.payment!.id, activePaymentId: payOrder.payment!.id, provider: "PAYOS", environment: "LIVE", merchantAccountId: "http-test-client", providerReference: "1234567890", requestKey: randomUUID(), providerCreatedAt: vnp.vnpayDate(new Date()), amount: 3000, expiresAt: new Date(Date.now() + 60000) } });
    const data = { orderCode: 1234567890, amount: 3000, description: "test", accountNumber: "0000", reference: "TEST-PAYOS-1", transactionDateTime: "2026-09-09 12:00:00", currency: "VND", paymentLinkId: "test-link", code: "00", desc: "success" };
    const signature = await payosClient().crypto.createSignatureFromObj(data, process.env.PAYOS_CHECKSUM_KEY!);
    const hook = { code: "00", desc: "success", success: true, data, signature };
    const sendHook = (body: unknown) => fetch(`${base}/api/payment/payos/webhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal((await sendHook({ ...hook, data: { ...data, amount: 1 } })).status, 400);
    assert.equal((await sendHook(hook)).status, 200);
    assert.equal((await sendHook(hook)).status, 200);
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: payOrder.id } })).paymentStatus, "PAID");
    assert.equal(await prisma.paymentEvent.count({ where: { providerTransactionId: "TEST-PAYOS-1" } }), 1);
    console.log("PASS HTTP: real SDK payOS signature verification, tampering rejected, callback works when new PAYOS requests disabled, exactly-once event");
  } finally {
    child.kill();
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

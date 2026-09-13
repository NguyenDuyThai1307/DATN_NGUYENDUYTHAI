import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("review-http");
  process.env.JWT_SECRET = "isolated-review-test-secret";
  const port = await new Promise<number>(done => {
    const socket = createServer();
    socket.listen(0, "127.0.0.1", () => { const address = socket.address(); if (!address || typeof address === "string") throw new Error("No port"); socket.close(() => done(address.port)); });
  });
  const base = `http://127.0.0.1:${port}`;
  process.env.APP_URL = base;
  const { prisma } = await import("../src/lib/prisma");
  const { signJwt } = await import("../src/lib/jwt");
  const child = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, NODE_ENV: "production" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", data => { logs = (logs + data.toString()).slice(-4000); });
  child.stderr.on("data", data => { logs = (logs + data.toString()).slice(-4000); });
  try {
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (child.exitCode !== null) throw new Error(logs);
      try { await fetch(`${base}/api/auth/me`); ready = true; break; } catch { await new Promise(r => setTimeout(r, 250)); }
    }
    assert.ok(ready, logs);
    const a = await prisma.user.create({ data: { email: "a@test.local", name: "Reviewer", passwordHash: "test" } });
    const b = await prisma.user.create({ data: { email: "b@test.local", passwordHash: "test" } });
    const headersFor = async (user: typeof a) => ({ cookie: `figure_shop_token=${await signJwt({ userId: user.id, email: user.email, role: "CUSTOMER" })}`, origin: base, "Content-Type": "application/json", "X-Account-Id": user.id });
    const ah = await headersFor(a), bh = await headersFor(b);
    const product = await prisma.product.create({ data: { name: "Test", slug: "review-test", price: 100, status: "ACTIVE" } });
    const endpoint = `${base}/api/products/${product.id}/reviews`;
    const body = JSON.stringify({ rating: 5, comment: "A useful product review" });
    assert.equal((await fetch(endpoint)).status, 200);
    assert.equal((await fetch(endpoint + "?page=-1")).status, 400);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: { origin: base, "Content-Type": "application/json" }, body })).status, 401);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: { ...ah, origin: "https://evil.invalid" }, body })).status, 403);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: { ...ah, "X-Account-Id": b.id }, body })).status, 409);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: ah, body })).status, 403);
    const order = await prisma.order.create({ data: {
      userId: a.id, orderNumber: "REVIEW-HTTP", status: "COMPLETED", subtotal: 100, total: 100,
      receiverName: "Test", receiverPhone: "0900000000", province: "Test", district: "Test", ward: "Test", addressDetail: "Test",
      items: { create: { productId: product.id, productName: product.name, productPrice: 100, quantity: 1, total: 100 } },
    } });
    assert.equal((await fetch(endpoint, { method: "PUT", headers: ah, body: JSON.stringify({ rating: 6, comment: "Invalid rating test" }) })).status, 400);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: ah, body: JSON.stringify({ rating: 5, comment: "Attempt impersonation", userId: b.id }) })).status, 400);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: ah, body })).status, 200);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: ah, body: JSON.stringify({ rating: 3, comment: "Updated product review" }) })).status, 200);
    assert.equal((await fetch(endpoint, { method: "DELETE", headers: bh })).status, 200);
    const publicResponse = await fetch(endpoint);
    assert.match(publicResponse.headers.get("cache-control") ?? "", /no-store/);
    const publicData = await publicResponse.json();
    assert.equal(publicData.total, 1); assert.equal(publicData.average, 3); assert.equal(publicData.ownReview, null);
    assert.equal(JSON.stringify(publicData).includes(a.email), false);
    assert.equal((await (await fetch(endpoint, { headers: ah })).json()).ownReview.rating, 3);
    assert.equal((await (await fetch(endpoint, { headers: bh })).json()).ownReview, null);
    const page = await fetch(`${base}/products/${product.slug}`, { headers: ah });
    assert.equal(page.status, 200); assert.match(await page.text(), /id="reviews"/);
    const orderPage = await fetch(`${base}/account/orders/${order.id}`, { headers: ah });
    assert.equal(orderPage.status, 200); assert.match(await orderPage.text(), /review-test#reviews/);
    assert.equal((await fetch(endpoint, { method: "DELETE", headers: ah })).status, 200);
    assert.equal((await (await fetch(endpoint)).json()).total, 0);
    console.log("PASS HTTP: auth/origin/account checks, completed purchase, input validation, create/edit/delete ownership, aggregates and privacy, product review section and order shortcut rendered.");
  } finally { child.kill(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

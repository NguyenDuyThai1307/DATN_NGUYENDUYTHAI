import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("account-http");
  process.env.JWT_SECRET = "isolated-account-test-secret";
  process.env.OPENAI_API_KEY = "not-a-real-key-no-ai-calls";
  const port = await new Promise<number>(done => {
    const socket = createServer();
    socket.listen(0, "127.0.0.1", () => { const address = socket.address(); if (!address || typeof address === "string") throw new Error("No port"); socket.close(() => done(address.port)); });
  });
  const base = `http://127.0.0.1:${port}`;
  process.env.APP_URL = base;
  const { prisma } = await import("../src/lib/prisma");
  const { signJwt } = await import("../src/lib/jwt");
  const { saveChatReply } = await import("../src/services/account-data.service");
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
    const a = await prisma.user.create({ data: { email: "a@test.local", passwordHash: "test" } });
    const b = await prisma.user.create({ data: { email: "b@test.local", passwordHash: "test" } });
    const headersFor = async (user: typeof a) => ({ cookie: `figure_shop_token=${await signJwt({ userId: user.id, email: user.email, role: "CUSTOMER" })}`, origin: base, "Content-Type": "application/json", "X-Account-Id": user.id });
    const ah = await headersFor(a), bh = await headersFor(b);
    const product = await prisma.product.create({ data: { name: "Test", slug: "test", price: 100, status: "ACTIVE" } });
    const body = JSON.stringify({ productId: product.id, saved: true });
    assert.equal((await fetch(`${base}/api/wishlist`)).status, 401);
    assert.equal((await fetch(`${base}/api/ai/conversations`)).status, 401);
    assert.equal((await fetch(`${base}/api/wishlist`, { method: "PUT", headers: { ...ah, origin: "https://evil.invalid" }, body })).status, 403);
    assert.equal((await fetch(`${base}/api/wishlist`, { method: "PUT", headers: { ...ah, "X-Account-Id": b.id }, body })).status, 409);
    assert.equal((await fetch(`${base}/api/wishlist`, { method: "PUT", headers: ah, body })).status, 200);
    assert.deepEqual((await (await fetch(`${base}/api/wishlist`, { headers: ah })).json()).ids, [product.id]);
    assert.deepEqual((await (await fetch(`${base}/api/wishlist`, { headers: bh })).json()).ids, []);
    const id = await saveChatReply(a.id, undefined, "Saved question", { message: "Saved reply", products: [] });
    const history = await fetch(`${base}/api/ai/conversations?id=${id}`, { headers: ah });
    assert.equal(history.status, 200);
    assert.match(history.headers.get("cache-control") ?? "", /no-store/);
    assert.equal((await history.json()).conversation.messages[1].content, "Saved reply");
    assert.equal((await fetch(`${base}/api/ai/conversations?id=${id}`, { headers: bh })).status, 404);
    assert.deepEqual((await (await fetch(`${base}/api/ai/conversations`, { headers: bh })).json()).conversations, []);
    assert.equal((await fetch(`${base}/api/ai/chat`, { method: "POST", headers: bh, body: JSON.stringify({ message: "Cannot access A", conversationId: id }) })).status, 404);
    assert.equal((await fetch(`${base}/api/ai/chat`, { method: "POST", headers: { ...ah, "X-Account-Id": b.id }, body: JSON.stringify({ message: "Changed account" }) })).status, 409);
    assert.equal((await fetch(`${base}/wishlist`, { headers: ah })).status, 200);
    console.log("PASS HTTP: anonymous denied, wishlist saved/read and scoped, private chat restored, other-account read/write denied, session mismatch rejected, wishlist page rendered. No AI API calls.");
  } finally { child.kill(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

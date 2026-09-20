import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("admin-users-http");
  process.env.JWT_SECRET = "isolated-admin-users-secret";
  const port = await new Promise<number>(done => {
    const socket = createServer(); socket.listen(0, "127.0.0.1", () => {
      const address = socket.address(); if (!address || typeof address === "string") throw new Error("No port");
      socket.close(() => done(address.port));
    });
  });
  const base = `http://127.0.0.1:${port}`;
  process.env.APP_URL = base;
  const { prisma } = await import("../src/lib/prisma");
  const { signJwt } = await import("../src/lib/jwt");
  const { hashPassword } = await import("../src/lib/password");
  const { updateAdminUser } = await import("../src/services/admin-user.service");
  const child = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, NODE_ENV: "production" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", data => { logs = (logs + data.toString()).slice(-4000); });
  child.stderr.on("data", data => { logs = (logs + data.toString()).slice(-4000); });
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error(logs);
      try { await fetch(`${base}/api/auth/me`); ready = true; break; } catch { await new Promise(r => setTimeout(r, 250)); }
    }
    assert.ok(ready, logs);
    const password = "TestPassword123!", passwordHash = await hashPassword(password);
    const admin = await prisma.user.create({ data: { email: "admin@test.local", passwordHash, role: "ADMIN" } });
    const staff = await prisma.user.create({ data: { email: "staff@test.local", passwordHash, role: "STAFF" } });
    const customer = await prisma.user.create({ data: { email: "customer@test.local", name: "Search Customer", passwordHash } });
    const headersFor = async (user: typeof admin) => ({ cookie: `figure_shop_token=${await signJwt({ userId: user.id, email: user.email, role: user.role, sessionVersion: user.sessionVersion })}`, origin: base, "Content-Type": "application/json" });
    const ah = await headersFor(admin), sh = await headersFor(staff), ch = await headersFor(customer);
    const usersUrl = `${base}/api/admin/users`;
    assert.equal((await fetch(usersUrl)).status, 401);
    for (const headers of [sh, ch]) {
      assert.equal((await fetch(usersUrl, { headers })).status, 403);
      assert.equal((await fetch(`${usersUrl}/${customer.id}`, { headers })).status, 403);
      assert.equal((await fetch(`${usersUrl}/${customer.id}`, { method: "PATCH", headers, body: JSON.stringify({ role: "ADMIN", isActive: true, expectedVersion: 0 }) })).status, 403);
    }
    assert.equal((await fetch(`${usersUrl}?page=NaN`, { headers: ah })).status, 400);
    const listed = await fetch(`${usersUrl}?q=Search&role=CUSTOMER&status=active`, { headers: ah });
    assert.match(listed.headers.get("cache-control") ?? "", /no-store/);
    const result = await listed.json(); assert.equal(result.total, 1); assert.equal(result.users[0].id, customer.id);
    assert.equal(JSON.stringify(result).includes("passwordHash"), false);
    const detail = await (await fetch(`${usersUrl}/${customer.id}`, { headers: ah })).json();
    assert.equal(detail.user.passwordHash, undefined); assert.equal(detail.user.orders.length, 0);
    assert.equal((await fetch(`${usersUrl}/missing`, { headers: ah })).status, 404);
    const change = (id: string, data: unknown, headers = ah) => fetch(`${usersUrl}/${id}`, { method: "PATCH", headers, body: JSON.stringify(data) });
    assert.equal((await change(customer.id, { role: "ADMIN", isActive: true, expectedVersion: 0 }, { ...ah, origin: "https://evil.invalid" })).status, 403);
    assert.equal((await change(customer.id, { role: "SUPERADMIN", isActive: true, expectedVersion: 0 })).status, 400);
    assert.equal((await change(admin.id, { role: "CUSTOMER", isActive: false, expectedVersion: 0 })).status, 403);
    assert.equal((await change(customer.id, { role: "STAFF", isActive: true, expectedVersion: 0 })).status, 200);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: ch })).status, 401);
    assert.equal((await change(customer.id, { role: "ADMIN", isActive: true, expectedVersion: 0 })).status, 409);
    const fresh = await headersFor(await prisma.user.findUniqueOrThrow({ where: { id: customer.id } }));
    assert.equal((await fetch(`${base}/api/admin/products/missing`, { method: "DELETE", headers: fresh })).status, 404);
    assert.equal((await change(customer.id, { role: "STAFF", isActive: false, expectedVersion: 1 })).status, 200);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: fresh })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/products/missing`, { method: "DELETE", headers: fresh })).status, 401);
    assert.equal((await fetch(`${base}/admin/products`, { headers: fresh, redirect: "manual" })).status, 307);
    const login = () => fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: customer.email, password }) });
    assert.equal((await login()).status, 403);
    assert.equal((await change(customer.id, { role: "CUSTOMER", isActive: true, expectedVersion: 2 })).status, 200);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: fresh })).status, 401);
    assert.equal((await login()).status, 200);
    assert.equal((await fetch(`${base}/admin/users`, { headers: sh, redirect: "manual" })).status, 307);
    assert.equal((await fetch(`${base}/admin/users`, { headers: ah })).status, 200);
    assert.equal((await fetch(`${base}/admin/users/${customer.id}`, { headers: ah })).status, 200);
    const report = await fetch(`${base}/admin/reports?period=7`, { headers: sh });
    assert.equal(report.status, 200); assert.match(await report.text(), /\/admin\/reports\?period=30/);
    const adminB = await prisma.user.create({ data: { email: "adminb@test.local", passwordHash, role: "ADMIN" } });
    await Promise.allSettled([
      updateAdminUser(admin.id, adminB.id, { role: "CUSTOMER", isActive: true, expectedVersion: 0 }),
      updateAdminUser(adminB.id, admin.id, { role: "CUSTOMER", isActive: true, expectedVersion: 0 }),
    ]);
    assert.ok(await prisma.user.count({ where: { role: "ADMIN", isActive: true } }) >= 1);
    console.log("PASS: admin-only list/detail/update; filters; no password exposure; origin/input/self protection; role changes and lock/unlock invalidate old sessions; blocked login; reports and admin pages; concurrent demotions retain an active admin. Isolated DB.");
  } finally { child.kill(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

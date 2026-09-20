import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { freshPaymentDb } from "./payment-test-db";

// Exercises server-rendered screens with isolated fixtures, without spending AI
// credits, creating real orders, or changing the developer's catalog.
async function main() {
  await freshPaymentDb("storefront-ui-http");
  process.env.JWT_SECRET = "isolated-storefront-ui-secret";
  process.env.DEMO_PAYMENT_ENABLED = "true";
  process.env.PAYOS_ENABLED = "false";
  process.env.VNPAY_ENABLED = "false";
  const port = await new Promise<number>(done => {
    const socket = createServer();
    socket.listen(0, "127.0.0.1", () => {
      const address = socket.address();
      if (!address || typeof address === "string") throw new Error("No port");
      socket.close(() => done(address.port));
    });
  });
  const base = `http://127.0.0.1:${port}`;
  process.env.APP_URL = base;
  const { prisma } = await import("../src/lib/prisma");
  const { signJwt } = await import("../src/lib/jwt");
  const customer = await prisma.user.create({ data: { email: "customer@ui.test", name: "UI Customer", passwordHash: "test" } });
  const admin = await prisma.user.create({ data: { email: "admin@ui.test", role: "ADMIN", passwordHash: "test" } });
  const stock = await prisma.product.create({ data: {
    name: "Stock Figure", slug: "stock-figure", price: 100000, stock: 10, status: "ACTIVE",
    images: { create: { url: "/images/home/figure-shop-hero-hd.png", alt: "Test figure" } },
  } });
  const preorderProduct = await prisma.product.create({ data: {
    name: "Preorder Figure", slug: "preorder-figure", price: 200000, type: "PREORDER", status: "ACTIVE",
    images: { create: { url: "/images/home/figure-shop-hero-hd.png" } },
  } });
  await prisma.product.createMany({ data: Array.from({ length: 20 }, (_, i) => ({ name: `Admin Figure ${i}`, slug: `admin-figure-${i}`, price: 100000, status: "DRAFT" as const })) });
  await prisma.cart.create({ data: { userId: customer.id, items: { create: { productId: stock.id, quantity: 2 } } } });
  await prisma.order.create({ data: {
    userId: customer.id, orderNumber: "UI-COMPLETED", status: "COMPLETED", paymentStatus: "PAID", subtotal: 100000, total: 100000,
    receiverName: "UI Customer", receiverPhone: "0900000000", province: "Test", district: "Test", ward: "Test", addressDetail: "Test address",
    items: { create: { productId: stock.id, productName: stock.name, productPrice: stock.price, quantity: 1, total: stock.price } },
  } });
  const headersFor = async (user: typeof customer) => ({ cookie: `figure_shop_token=${await signJwt({ userId: user.id, email: user.email, role: user.role, sessionVersion: user.sessionVersion })}` });
  const customerHeaders = await headersFor(customer), adminHeaders = await headersFor(admin);
  const child = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, NODE_ENV: "production" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", data => { logs = (logs + data.toString()).slice(-5000); });
  child.stderr.on("data", data => { logs = (logs + data.toString()).slice(-5000); });
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error(logs);
      try { await fetch(`${base}/api/auth/me`); ready = true; break; }
      catch { await new Promise(done => setTimeout(done, 250)); }
    }
    assert.ok(ready, logs);
    async function page(path: string, headers?: Record<string, string>) {
      const response = await fetch(base + path, { headers, redirect: "manual" });
      assert.equal(response.status, 200, `${path}: ${logs}`);
      const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
      assert.ok(!html.includes('id="__next_error__"'), `${path}: server render error`);
      return html;
    }
    const home = await page("/");
    assert.match(home, /href="\/products\/stock-figure"/);
    const promotion = { name: "UI offer", type: "PERCENTAGE" as const, value: 10, startsAt: new Date(Date.now() - 3600000), endsAt: new Date(Date.now() + 3600000) };
    for (let i = 0; i < 10; i++) {
      await prisma.product.create({ data: {
        name: `Offer Figure ${i}`, slug: `offer-figure-${i}`, price: 100000, stock: 10, status: "ACTIVE",
        images: { create: { url: "/images/home/figure-shop-hero-hd.png" } },
        promotion: { create: promotion },
      } });
    }
    await prisma.promotion.create({ data: { ...promotion, productId: preorderProduct.id } });
    const sectionsPage = await page("/");
    const section = (id: string) => {
      const markup = sectionsPage.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0];
      assert.ok(markup, `Missing homepage section: ${id}`);
      return markup;
    };
    const offerSection = section("offers");
    assert.equal((offerSection.match(/<article class="product-card /g) ?? []).length, 8);
    assert.doesNotMatch(offerSection, /href="\/products\/preorder-figure"/);
    const preorderSection = section("preorder");
    assert.match(preorderSection, /href="\/products\/preorder-figure"/);
    assert.equal((preorderSection.match(/<article class="product-card /g) ?? []).length, 1);
    assert.ok(sectionsPage.indexOf('id="home-categories-title"') < sectionsPage.indexOf('id="offers"'));
    assert.ok(sectionsPage.indexOf('id="offers"') < sectionsPage.indexOf('id="featured"'));
    assert.ok(sectionsPage.indexOf('id="featured"') < sectionsPage.indexOf('id="preorder"'));
    assert.doesNotMatch(sectionsPage, /home-product-tabs/);
    const catalog = await page("/products?q=Stock");
    assert.match(catalog, /href="\/products\/stock-figure"/);
    assert.doesNotMatch(catalog, /href="\/products\/preorder-figure"/);
    const preorder = await page("/preorder?q=Preorder&type=IN_STOCK");
    assert.match(preorder, /href="\/products\/preorder-figure"/);
    assert.doesNotMatch(preorder, /href="\/products\/stock-figure"/);
    assert.match(preorder, /href="\/preorder"[^>]*>Bỏ tất cả/);
    const detail = await page("/products/stock-figure");
    assert.match(detail, /id="reviews"/);
    await page("/cart", customerHeaders);
    const checkout = await page("/checkout", customerHeaders);
    for (const method of ["COD", "BANK_TRANSFER", "DEMO"]) {
      assert.match(checkout, new RegExp(`type="radio"[^>]*name="paymentMethod"[^>]*value="${method}"`));
    }
    assert.doesNotMatch(checkout, /value="(?:PAYOS|VNPAY)"/);
    const orders = await page("/account/orders", customerHeaders);
    assert.match(orders, /UI-COMPLETED/);
    assert.match(orders, /Test address/);
    await page("/ai");
    for (const path of ["/admin", "/admin/products", "/admin/products?page=2"]) {
      const html = await page(path, adminHeaders);
      assert.match(html, /admin-shell/);
      assert.doesNotMatch(html, /class="store-header/);
    }
    const filtered = await page("/admin/products?query=Stock", adminHeaders);
    assert.match(filtered, /Stock Figure/);
    assert.doesNotMatch(filtered, /Preorder Figure/);
    for (const path of ["/cart", "/checkout", "/account/orders", "/admin"]) {
      assert.equal((await fetch(base + path, { redirect: "manual" })).status, 307);
    }
    console.log("PASS: all 10 reference screens render; catalog/preorder filters, cart and checkout radios, saved order details, admin pagination/search and storefront separation, anonymous redirects. Isolated DB; no external API calls. HTTP checks only, not visual/browser interaction tests.");
  } finally {
    child.kill();
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

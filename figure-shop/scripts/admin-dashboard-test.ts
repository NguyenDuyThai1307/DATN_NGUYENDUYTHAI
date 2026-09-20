import assert from "node:assert/strict";
import { freshPaymentDb } from "./payment-test-db";
import { dashboardRange, percentageChange } from "../src/lib/dashboard-range";

async function main() {
  const now = new Date("2026-09-20T18:00:00Z");
  assert.equal(dashboardRange({}, now).to, "2026-09-21");
  assert.equal(dashboardRange({ period: "7" }, now).from, "2026-09-15");
  const input = { start: "2026-09-01", end: "2026-09-30" };
  const range = dashboardRange(input, now);
  assert.equal(range.start.toISOString(), "2026-08-31T17:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-09-30T17:00:00.000Z");
  assert.equal(range.previousStart.toISOString(), "2026-08-01T17:00:00.000Z");
  assert.equal(dashboardRange({ start: "2024-02-29", end: "2024-02-29" }, now).days, 1);
  for (const invalid of [
    { start: "2026-02-30", end: "2026-03-01" },
    { start: "2026-09-30", end: "2026-09-01" },
    { start: "2024-01-01", end: "2026-01-01" },
    { start: "not-a-date", end: "2026-09-01" },
  ]) assert.ok(dashboardRange(invalid, now).error);
  assert.equal(percentageChange(5, 0), null);
  assert.equal(percentageChange(50, 100), -50);
  await freshPaymentDb("dashboard");
  const { prisma } = await import("../src/lib/prisma");
  const { getDashboardOverview } = await import("../src/services/admin-dashboard.service");
  try {
    const empty = await getDashboardOverview(input, now);
    assert.equal(empty.revenue.total, 0); assert.equal(empty.totalOrders, 0); assert.equal(empty.bestSellers.length, 0);
    const customer = await prisma.user.create({ data: { email: "customer@dashboard.test", name: "Customer", passwordHash: "test", createdAt: range.start } });
    await prisma.user.create({ data: { email: "admin@dashboard.test", role: "ADMIN", passwordHash: "test", createdAt: range.start } });
    await prisma.user.create({ data: { email: "previous@dashboard.test", passwordHash: "test", createdAt: new Date("2026-08-31T16:59:59Z") } });
    const alpha = await prisma.product.create({ data: { name: "Alpha", slug: "alpha", price: 300, stock: 3, status: "ACTIVE", createdAt: range.start } });
    const beta = await prisma.product.create({ data: { name: "Beta", slug: "beta", price: 200, stock: 0, status: "ACTIVE", type: "PREORDER", createdAt: range.start } });
    await prisma.product.create({ data: { name: "Archived", slug: "archived", price: 100, stock: 0, status: "ARCHIVED", createdAt: range.start } });
    type Options = { status?: "COMPLETED" | "CANCELLED" | "SHIPPED"; paymentStatus?: "PAID" | "REFUNDED"; method?: "COD" | "DEMO" | "VNPAY"; review?: boolean; noPayment?: boolean; productId?: string; quantity?: number; lineTotal?: number };
    async function order(number: string, created: string, paid: string, total: number, options: Options = {}) {
      const method = options.method ?? "COD", status = options.paymentStatus ?? "PAID";
      await prisma.order.create({ data: {
        userId: customer.id, orderNumber: number, status: options.status ?? "COMPLETED", paymentStatus: status, paymentMethod: method,
        subtotal: options.lineTotal ?? total, total, createdAt: new Date(created), receiverName: "Test", receiverPhone: "0900000000", province: "Test", district: "Test", ward: "Test", addressDetail: "Test address",
        items: { create: { productId: options.productId ?? alpha.id, productName: options.productId === beta.id ? "Beta" : "Alpha", productPrice: 300, quantity: options.quantity ?? 1, total: options.lineTotal ?? total } },
        ...(!options.noPayment ? { payment: { create: { amount: total, method, status, paidAt: new Date(paid), needsReview: options.review ?? false } } } : {}),
      } });
    }
    await order("CURRENT", "2026-08-31T17:00:00Z", "2026-08-31T17:00:00Z", 500, { quantity: 2, lineTotal: 600 });
    await order("DEMO", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", 300, { method: "DEMO", status: "SHIPPED" });
    await order("OLD-PAID-NOW", "2026-07-01T00:00:00Z", "2026-09-29T20:00:00Z", 200, { productId: beta.id });
    await order("PREVIOUS", "2026-08-30T00:00:00Z", "2026-08-31T16:59:59Z", 100);
    await order("CANCELLED", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00Z", 900, { status: "CANCELLED" });
    await order("REFUNDED", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00Z", 900, { paymentStatus: "REFUNDED" });
    await order("REVIEW", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00Z", 900, { review: true });
    await order("MISSING-PAYMENT", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00Z", 900, { noPayment: true });
    await order("GATEWAY", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00Z", 900, { method: "VNPAY" });
    await order("NEXT-DAY", "2026-09-30T17:00:00Z", "2026-09-30T17:00:00Z", 900);
    const data = await getDashboardOverview(input, now);
    assert.equal(data.totalOrders, 7);
    assert.equal(data.statuses.reduce((sum, row) => sum + row.count, 0), data.totalOrders);
    assert.equal(data.previousOrders, 1);
    assert.equal(data.newCustomers, 1); assert.equal(data.previousCustomers, 1);
    assert.equal(data.revenue.total, 1000); assert.equal(data.revenue.previous, 100);
    assert.equal(data.revenue.daily[0].cod, 500); assert.equal(data.revenue.daily.at(-1)?.cod, 200);
    assert.equal(data.bestSellers[0].id, alpha.id); assert.equal(data.bestSellers[0].quantity, 3); assert.equal(data.bestSellers[0].total, 900);
    assert.equal(data.bestSellers[1].id, beta.id); assert.equal(data.bestSellers[1].quantity, 1);
    assert.equal(data.lowStockCount, 1); assert.equal(data.lowStock[0].id, alpha.id);
    assert.equal(data.totalProducts, 3); assert.equal(data.addedProducts, 3);
    assert.equal(data.needsReviewCount, 1);
    assert.ok(data.activities.every(activity => activity.at >= range.start && activity.at < range.end));
    console.log("PASS: calendar validation, Vietnam midnight boundaries, equal previous period, empty data, actual status totals, customer roles, paid-date revenue and best sellers, refund/cancel/review/gateway exclusions, coupon distinction, current inventory excludes preorder/archived. Isolated DB.");
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

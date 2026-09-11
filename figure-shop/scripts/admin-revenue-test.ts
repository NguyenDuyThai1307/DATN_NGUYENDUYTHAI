import assert from "node:assert/strict";
import { buildRevenueReport, revenueWindow, type RevenueOrder } from "../src/lib/admin-revenue";

const now = new Date("2026-09-10T05:00:00Z");
const make = (overrides: Partial<RevenueOrder> = {}): RevenueOrder => ({
  total: 100, status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "COD",
  createdAt: new Date("2026-09-09T18:00:00Z"),
  payment: { status: "PAID", paidAt: new Date("2026-09-09T18:00:00Z"), needsReview: false }, ...overrides,
});
assert.equal(revenueWindow(7, now).start.toISOString(), "2026-09-03T17:00:00.000Z");
const report = buildRevenueReport([
  make(), make({ paymentMethod: "DEMO", total: 200 }), make({ paymentMethod: "BANK_TRANSFER", total: 300 }),
  make({ status: "CANCELLED" }), make({ paymentStatus: "REFUNDED" }), make({ paymentMethod: "VNPAY" }),
  make({ payment: { status: "PAID", paidAt: now, needsReview: true } }),
  make({ payment: null }), make({ payment: { status: "UNPAID", paidAt: null, needsReview: false } }),
  make({ paymentStatus: "UNPAID", total: 400 }),
  make({ createdAt: new Date("2025-01-01"), payment: { status: "PAID", paidAt: new Date("2026-09-03T16:59:59Z"), needsReview: false } }),
  make({ payment: { status: "PAID", paidAt: null, needsReview: false } }),
], 7, now);
assert.equal(report.total, 700);
assert.equal(report.cod, 200);
assert.equal(report.transfer, 500);
assert.equal(report.paidCount, 4);
assert.equal(report.previous, 100);
assert.equal(report.pending, 400);
assert.equal(report.estimatedDates, 1);
assert.equal(report.daily.at(-1)?.count, 4);
assert.equal(report.daily[0].count, 0);
assert.equal(buildRevenueReport([], 90, now).daily.length, 90);
assert.equal(buildRevenueReport([], 30, now).total, 0);
console.log("PASS: revenue totals, methods, excluded states, timezone boundaries, previous period, legacy dates and empty data");

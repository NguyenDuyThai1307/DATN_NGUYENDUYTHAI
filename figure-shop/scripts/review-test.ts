import assert from "node:assert/strict";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("reviews");
  const { prisma } = await import("../src/lib/prisma");
  const { saveProductReview, getProductReviews, deleteProductReview } = await import("../src/services/review.service");
  try {
    const a = await prisma.user.create({ data: { email: "a@test.local", name: "Customer A", passwordHash: "test" } });
    const b = await prisma.user.create({ data: { email: "b@test.local", passwordHash: "test" } });
    const product = await prisma.product.create({ data: { name: "Review test", slug: "review-test", price: 100, status: "ACTIVE" } });
    const review = { rating: 5, comment: "A detailed product review" };
    await assert.rejects(saveProductReview(a.id, product.id, review));
    const order = await prisma.order.create({ data: {
      userId: a.id, orderNumber: "REVIEW-TEST", subtotal: 100, total: 100,
      receiverName: "Test", receiverPhone: "0900000000", province: "Test", district: "Test", ward: "Test", addressDetail: "Test",
      items: { create: { productId: product.id, productName: product.name, productPrice: 100, quantity: 1, total: 100 } },
    } });
    for (const status of ["PENDING", "CANCELLED", "SHIPPED"] as const) {
      await prisma.order.update({ where: { id: order.id }, data: { status } });
      await assert.rejects(saveProductReview(a.id, product.id, review));
    }
    await prisma.order.update({ where: { id: order.id }, data: { status: "COMPLETED" } });
    for (const rating of [0, 6, 1.5]) await assert.rejects(saveProductReview(a.id, product.id, { ...review, rating }));
    await assert.rejects(saveProductReview(a.id, product.id, { ...review, comment: "          " }));
    await assert.rejects(saveProductReview(a.id, product.id, { ...review, comment: "a".repeat(2001) }));
    await saveProductReview(a.id, product.id, review);
    await saveProductReview(a.id, product.id, { ...review, rating: 4 });
    assert.equal(await prisma.productReview.count(), 1);
    await deleteProductReview(b.id, product.id);
    await assert.rejects(saveProductReview(b.id, product.id, review));
    const own = await getProductReviews(product.id, a.id);
    assert.equal(own.ownReview?.rating, 4);
    const publicData = await getProductReviews(product.id, null);
    assert.equal(publicData.total, 1); assert.equal(publicData.average, 4);
    assert.equal(publicData.ownReview, null); assert.equal(publicData.eligible, false);
    assert.equal(JSON.stringify(publicData).includes(a.email), false);
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({ data: { email: `page${i}@test.local`, passwordHash: "test" } });
      await prisma.productReview.create({ data: { userId: user.id, productId: product.id, rating: i, comment: "Pagination fixture" } });
    }
    const first = await getProductReviews(product.id, null, 1), last = await getProductReviews(product.id, null, 999);
    assert.equal(first.total, 6); assert.equal(first.average, 19 / 6);
    assert.equal(first.reviews.length, 5); assert.equal(last.reviews.length, 1); assert.equal(last.page, 2);
    assert.equal(first.reviews.some(row => row.id === last.reviews[0].id), false);
    await prisma.$disconnect();
    assert.equal((await getProductReviews(product.id, a.id)).ownReview?.rating, 4);
    await deleteProductReview(a.id, product.id);
    assert.equal((await getProductReviews(product.id, a.id)).ownReview, null);
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });
    await assert.rejects(saveProductReview(a.id, product.id, review));
    await assert.rejects(getProductReviews(product.id, null));
    console.log("PASS: completed purchase required, validation, edit without duplicates, owner-only delete, private fields excluded, aggregates/pagination, persistence, inactive product rejected (isolated DB).");
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

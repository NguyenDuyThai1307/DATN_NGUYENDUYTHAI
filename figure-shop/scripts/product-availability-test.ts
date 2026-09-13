import assert from "node:assert/strict";
import { freshPaymentDb } from "./payment-test-db";
import { productAvailabilitySchema } from "../src/validations/product.schema";

async function main() {
  await freshPaymentDb("product-availability");
  const { prisma } = await import("../src/lib/prisma");
  const { updateProductAvailability } = await import("../src/services/admin-product.service");
  try {
    for (const stock of [-1, 1.5, 2147483648, undefined]) {
      assert.equal(productAvailabilitySchema.safeParse({ type: "IN_STOCK", stock }).success, false);
    }
    assert.equal(productAvailabilitySchema.safeParse({ type: "ACTIVE" }).success, false);
    const product = await prisma.product.create({ data: {
      name: "Availability test", slug: "availability-test", price: 100000,
      stock: 5, status: "ACTIVE", type: "IN_STOCK",
      images: { create: { url: "/test.webp" } },
      promotion: { create: { name: "Test sale", type: "PERCENTAGE", value: 10,
        startsAt: new Date(0), endsAt: new Date("2099-01-01") } },
    } });
    const preorder = await updateProductAvailability(product.id, { type: "PREORDER" });
    assert.equal(preorder.type, "PREORDER");
    assert.equal(preorder.stock, 5);
    assert.equal((await prisma.promotion.findUniqueOrThrow({ where: { productId: product.id } })).isActive, false);
    const stocked = await updateProductAvailability(product.id, { type: "IN_STOCK", stock: 12 });
    assert.equal(stocked.type, "IN_STOCK");
    assert.equal(stocked.stock, 12);
    assert.equal(stocked.price, product.price);
    assert.equal(stocked.status, product.status);
    assert.equal(await prisma.productImage.count({ where: { productId: product.id } }), 1);
    assert.equal((await prisma.promotion.findUniqueOrThrow({ where: { productId: product.id } })).isActive, false);
    assert.equal((await updateProductAvailability(product.id, { type: "IN_STOCK", stock: 0 })).stock, 0);
    await assert.rejects(updateProductAvailability("missing-product", { type: "PREORDER" }));
    console.log("PASS: both transitions, stock validation, zero stock, promotion disabled, unrelated fields preserved, missing product rejected (isolated database).");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });

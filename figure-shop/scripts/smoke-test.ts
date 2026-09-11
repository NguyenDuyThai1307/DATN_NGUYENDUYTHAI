import assert from "node:assert/strict";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promotionSchema } from "../src/validations/promotion.schema";

type DisconnectablePrisma = {
  $disconnect: () => Promise<void>;
};

async function main() {
process.env.DEMO_PAYMENT_ENABLED = "true";
for (const [scope, target] of [
  ["PRODUCT", "productId"],
  ["CATEGORY", "categoryId"],
  ["BRAND", "brandId"],
] as const) {
  const form = new FormData();
  form.set("scope", scope);
  form.set(target, "qa-target");
  form.set("name", "QA Promotion Form");
  form.set("type", "PERCENTAGE");
  form.set("value", "20");
  form.set("startsAt", "2026-09-01T10:00");
  form.set("endsAt", "2026-09-30T10:00");
  form.set("isActive", "on");
  const input = Object.fromEntries(
    ["scope", "productId", "categoryId", "brandId", "name", "type", "value", "startsAt", "endsAt", "isActive"]
      .map((key) => [key, form.get(key)]),
  );
  assert.equal(promotionSchema.safeParse(input).success, true, scope);
  assert.equal(
    promotionSchema.safeParse({ ...input, [target]: null }).success,
    false,
    `${scope} must require its target`,
  );
}
const sourceDatabasePath = join(process.cwd(), "dev.db");
const temporaryDirectory = await mkdtemp(
  join(tmpdir(), "figure-shop-smoke-"),
);
const temporaryDatabasePath = join(temporaryDirectory, "smoke.db");

await copyFile(sourceDatabasePath, temporaryDatabasePath);

process.env.DATABASE_URL = `file:${temporaryDatabasePath.replace(/\\/g, "/")}`;

let prismaClient: DisconnectablePrisma | undefined;
let uploadedImagePath: string | undefined;

try {
  const [
    { prisma },
    productService,
    categoryService,
    brandService,
    storefrontProductService,
  ] =
    await Promise.all([
      import("../src/lib/prisma"),
      import("../src/services/admin-product.service"),
      import("../src/services/admin-category.service"),
      import("../src/services/admin-brand.service"),
      import("../src/services/product.service"),
    ]);

  prismaClient = prisma;

  const [
    promotionService,
    couponAdminService,
    cartService,
    orderService,
    productImageService,
  ] =
    await Promise.all([
      import("../src/services/admin-promotion.service"),
      import("../src/services/admin-coupon.service"),
      import("../src/services/cart.service"),
      import("../src/services/order.service"),
      import("../src/services/admin-product-image.service"),
    ]);
  const [{ markDemoPaymentAsPaid }, { StorefrontError }] =
    await Promise.all([
      import("../src/services/payment.service"),
      import("../src/lib/storefront-error"),
    ]);

  const runId = `qa-${Date.now()}`;

  const category = await categoryService.createAdminCategory({
    name: "QA Category",
    slug: `${runId}-category`,
    description: "Smoke test category",
  });
  const updatedCategory = await categoryService.updateAdminCategory(
    category.id,
    {
      name: "QA Category Updated",
      slug: `${runId}-category-updated`,
      description: "Updated smoke test category",
    },
  );
  assert.equal(updatedCategory.name, "QA Category Updated");

  const secondaryCategory = await categoryService.createAdminCategory({
    name: "QA Secondary Category",
    slug: `${runId}-secondary-category`,
    description: "Secondary category for multi-category smoke test",
  });

  const brand = await brandService.createAdminBrand({
    name: "QA Brand",
    slug: `${runId}-brand`,
    description: "Smoke test brand",
  });
  const updatedBrand = await brandService.updateAdminBrand(brand.id, {
    name: "QA Brand Updated",
    slug: `${runId}-brand-updated`,
    description: "Updated smoke test brand",
  });
  assert.equal(updatedBrand.name, "QA Brand Updated");

  const uploadedImageUrl = await productImageService.saveUploadedProductImage(
    new File([new Uint8Array([137, 80, 78, 71])], "qa-product.png", {
      type: "image/png",
    }),
  );
  assert.ok(uploadedImageUrl);
  uploadedImagePath = join(
    process.cwd(),
    "public",
    ...uploadedImageUrl.replace(/^\//, "").split("/"),
  );

  const product = await productService.createAdminProduct({
    name: "QA Figure",
    slug: `${runId}-figure`,
    description: "Smoke test figure",
    price: 100_000,
    stock: 5,
    categoryId: category.id,
    categoryIds: [category.id, secondaryCategory.id],
    brandId: brand.id,
    status: "ACTIVE",
    type: "IN_STOCK",
    imageUrl: uploadedImageUrl,
    imageAlt: "",
  });
  await productService.updateAdminProduct(product.id, {
    name: "QA Figure Updated",
    slug: `${runId}-figure-updated`,
    description: "Updated smoke test figure",
    price: 100_000,
    stock: 5,
    categoryId: category.id,
    categoryIds: [category.id, secondaryCategory.id],
    brandId: brand.id,
    status: "ACTIVE",
    type: "IN_STOCK",
    imageUrl: uploadedImageUrl,
    imageAlt: "",
  });
  const filteredProducts = await productService.getAdminProducts({
    query: runId,
    status: "ACTIVE",
  });
  assert.equal(filteredProducts.length, 1);
  assert.equal(filteredProducts[0]?.categories.length, 2);

  const startsAt = new Date(Date.now() - 60_000);
  const endsAt = new Date(Date.now() + 60 * 60 * 1000);
  const promotion = await promotionService.createAdminPromotion({
    scope: "PRODUCT",
    productId: product.id,
    name: "QA Promotion",
    type: "PERCENTAGE",
    value: 10,
    startsAt,
    endsAt,
    isActive: true,
  });
  const updatedPromotion = await promotionService.updateAdminPromotion(
    promotion.id,
    {
      scope: "PRODUCT",
      productId: product.id,
      name: "QA Promotion Updated",
      type: "PERCENTAGE",
      value: 15,
      startsAt,
      endsAt,
      isActive: true,
    },
  );
  assert.equal(updatedPromotion.value, 15);

  const categoryPromotion = await promotionService.createAdminPromotion({
    scope: "CATEGORY",
    categoryId: secondaryCategory.id,
    name: "QA Category Promotion",
    type: "PERCENTAGE",
    value: 20,
    startsAt,
    endsAt,
    isActive: true,
  });
  const productWithCategoryPromotion =
    await storefrontProductService.getProductBySlug(
      `${runId}-figure-updated`,
    );
  assert.equal(productWithCategoryPromotion?.promotion?.id, categoryPromotion.id);

  const brandPromotion = await promotionService.createAdminPromotion({
    scope: "BRAND",
    brandId: brand.id,
    name: "QA Brand Promotion",
    type: "FIXED_AMOUNT",
    value: 30_000,
    startsAt,
    endsAt,
    isActive: true,
  });
  const productWithBrandPromotion =
    await storefrontProductService.getProductBySlug(
      `${runId}-figure-updated`,
    );
  assert.equal(productWithBrandPromotion?.promotion?.id, brandPromotion.id);

  const coupon = await couponAdminService.createAdminCoupon({
    code: `${runId}-COUPON`.toUpperCase(),
    name: "QA Coupon",
    type: "FIXED_AMOUNT",
    value: 5_000,
    minOrderValue: 0,
    maxDiscountAmount: undefined,
    usageLimit: 10,
    startsAt,
    endsAt,
    isActive: true,
  });
  const updatedCoupon = await couponAdminService.updateAdminCoupon(
    coupon.id,
    {
      code: coupon.code,
      name: "QA Coupon Updated",
      type: "FIXED_AMOUNT",
      value: 10_000,
      minOrderValue: 0,
      maxDiscountAmount: undefined,
      usageLimit: 10,
      startsAt,
      endsAt,
      isActive: true,
    },
  );
  assert.equal(updatedCoupon.value, 10_000);

  const user = await prisma.user.create({
    data: {
      email: `${runId}@example.com`,
      name: "QA Smoke User",
      passwordHash: "not-used-in-smoke-test",
    },
  });

  await assert.rejects(
    () => cartService.addProductToCart(user.id, product.id, 6),
    (error: unknown) =>
      error instanceof StorefrontError && error.status === 409,
  );

  await cartService.addProductToCart(user.id, product.id, 2);
  await cartService.applyCouponToCart(user.id, coupon.code);

  const order = await orderService.createOrderFromCart(user.id, {
    receiverName: "QA Receiver",
    receiverPhone: "0900000000",
    province: "Ha Noi",
    district: "Nam Tu Liem",
    ward: "Cau Dien",
    addressDetail: "So 1 duong QA",
    note: "Automated smoke test",
    paymentMethod: "DEMO",
  });

  assert.equal(order.subtotal, 200_000);
  assert.equal(order.discountAmount, 70_000);
  assert.equal(order.couponDiscountAmount, 10_000);
  assert.equal(order.total, 130_000);

  const [productAfterOrder, cartAfterOrder, couponAfterOrder] =
    await Promise.all([
      prisma.product.findUniqueOrThrow({ where: { id: product.id } }),
      prisma.cart.findUniqueOrThrow({
        where: { userId: user.id },
        include: { items: true },
      }),
      prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } }),
    ]);

  assert.equal(productAfterOrder.stock, 3);
  assert.equal(cartAfterOrder.items.length, 0);
  assert.equal(cartAfterOrder.couponId, null);
  assert.equal(couponAfterOrder.usedCount, 1);

  const paidOrder = await markDemoPaymentAsPaid(order.id, user.id);
  assert.equal(paidOrder.status, "CONFIRMED");
  assert.equal(paidOrder.paymentStatus, "PAID");
  assert.equal(paidOrder.payment?.status, "PAID");

  await productService.archiveAdminProduct(product.id);
  const archivedProduct = await productService.getAdminProductById(product.id);
  assert.equal(archivedProduct?.status, "ARCHIVED");

  await promotionService.deactivateAdminPromotion(promotion.id);
  await promotionService.deactivateAdminPromotion(categoryPromotion.id);
  await promotionService.deactivateAdminPromotion(brandPromotion.id);
  await couponAdminService.deactivateAdminCoupon(coupon.id);
  const [
    inactivePromotion,
    inactiveCategoryPromotion,
    inactiveBrandPromotion,
    inactiveCoupon,
  ] = await Promise.all([
    promotionService.getAdminPromotionById(promotion.id),
    promotionService.getAdminPromotionById(categoryPromotion.id),
    promotionService.getAdminPromotionById(brandPromotion.id),
    couponAdminService.getAdminCouponById(coupon.id),
  ]);
  assert.equal(inactivePromotion?.isActive, false);
  assert.equal(inactiveCategoryPromotion?.isActive, false);
  assert.equal(inactiveBrandPromotion?.isActive, false);
  assert.equal(inactiveCoupon?.isActive, false);

  await prisma.product.delete({ where: { id: product.id } });
  await categoryService.deleteAdminCategory(category.id);
  await categoryService.deleteAdminCategory(secondaryCategory.id);
  await brandService.deleteAdminBrand(brand.id);

  console.log(
    "Smoke test passed: admin CRUD, image upload, scoped promotions, cart, checkout and payment.",
  );
} finally {
  await prismaClient?.$disconnect();
  if (uploadedImagePath) {
    await rm(uploadedImagePath, { force: true });
  }
  await rm(temporaryDirectory, { recursive: true, force: true });
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

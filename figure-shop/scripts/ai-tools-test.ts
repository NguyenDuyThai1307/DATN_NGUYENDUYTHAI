import assert from "node:assert/strict";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type DisconnectablePrisma = {
  $disconnect: () => Promise<void>;
};

async function main() {
  const sourceDatabasePath = join(process.cwd(), "dev.db");
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "figure-shop-ai-"));
  const temporaryDatabasePath = join(temporaryDirectory, "ai-tools.db");

  await copyFile(sourceDatabasePath, temporaryDatabasePath);
  process.env.DATABASE_URL = `file:${temporaryDatabasePath.replace(/\\/g, "/")}`;

  let prismaClient: DisconnectablePrisma | undefined;

  try {
    const [{ prisma }, aiProductService, aiService] = await Promise.all([
      import("../src/lib/prisma"),
      import("../src/services/ai-product.service"),
      import("../src/services/ai.service"),
    ]);

    prismaClient = prisma;

    const runId = `ai-${Date.now()}`;
    const category = await prisma.category.create({
      data: {
        name: `AI Category ${runId}`,
        slug: `${runId}-category`,
      },
    });
    const brand = await prisma.brand.create({
      data: {
        name: `AI Brand ${runId}`,
        slug: `${runId}-brand`,
      },
    });
    const now = Date.now();

    const discountedProduct = await prisma.product.create({
      data: {
        name: `AI Discounted Figure ${runId}`,
        slug: `${runId}-discounted`,
        description: "AI pricing regression product",
        price: 2_000_000,
        stock: 4,
        status: "ACTIVE",
        type: "IN_STOCK",
        categoryId: category.id,
        brandId: brand.id,
        promotion: {
          create: {
            name: "AI Test Promotion",
            type: "PERCENTAGE",
            value: 25,
            startsAt: new Date(now - 60_000),
            endsAt: new Date(now + 60 * 60 * 1000),
            isActive: true,
          },
        },
      },
    });

    const unavailableProduct = await prisma.product.create({
      data: {
        name: `AI Unavailable Figure ${runId}`,
        slug: `${runId}-unavailable`,
        price: 800_000,
        stock: 0,
        status: "ACTIVE",
        type: "IN_STOCK",
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    const preorderProduct = await prisma.product.create({
      data: {
        name: `AI Preorder Figure ${runId}`,
        slug: `${runId}-preorder`,
        price: 1_200_000,
        stock: 0,
        status: "ACTIVE",
        type: "PREORDER",
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    const budgetResults = await aiProductService.searchProductsForAi({
      query: runId,
      maxPrice: 1_600_000,
      onlyAvailable: false,
      sort: "PRICE_ASC",
      limit: 6,
    });
    const discountedReference = budgetResults.find(
      (product) => product.slug === discountedProduct.slug,
    );

    assert.ok(
      discountedReference,
      "Discounted product must be found by its final price, not original price.",
    );
    assert.equal(discountedReference.finalPrice, 1_500_000);
    assert.equal(discountedReference.discountPercent, 25);

    const availableResults = await aiProductService.searchProductsForAi({
      query: runId,
      type: "IN_STOCK",
      onlyAvailable: true,
      sort: "RELEVANCE",
      limit: 6,
    });
    assert.ok(
      availableResults.some(
        (product) => product.slug === discountedProduct.slug,
      ),
    );
    assert.ok(
      !availableResults.some(
        (product) => product.slug === unavailableProduct.slug,
      ),
      "Out-of-stock IN_STOCK products must be excluded.",
    );

    const preorderResults = await aiProductService.searchProductsForAi({
      query: runId,
      type: "PREORDER",
      onlyAvailable: true,
      sort: "PRICE_ASC",
      limit: 6,
    });
    assert.equal(preorderResults[0]?.slug, preorderProduct.slug);

    const detail = await aiProductService.getProductDetailsForAi(
      discountedProduct.slug,
    );
    assert.equal(detail?.category, category.name);
    assert.equal(detail?.brand, brand.name);
    assert.equal(detail?.finalPrice, 1_500_000);

    const comparison = await aiProductService.compareProductsForAi([
      discountedProduct.slug,
      preorderProduct.slug,
    ]);
    assert.deepEqual(
      comparison.products.map((product) => product.slug),
      [discountedProduct.slug, preorderProduct.slug],
    );
    assert.equal(comparison.missingSlugs.length, 0);

    const overview = await aiProductService.getCatalogOverviewForAi();
    assert.ok(overview.productCount >= 3);
    assert.ok(
      overview.categories.some(
        (item) => item.name === category.name && item.productCount === 3,
      ),
    );
    assert.ok(overview.discountedCount >= 1);

    const naturalProductQuestion = await aiService.createAiFallbackReply({
      message: `tư vấn thêm cho mình về mô hình ${runId}`,
      history: [],
    });
    assert.equal(
      naturalProductQuestion.products.length,
      3,
      "A natural product-specific question must keep the requested product keyword.",
    );
    assert.ok(
      naturalProductQuestion.products.every((product) =>
        product.name.toLowerCase().includes(runId.toLowerCase()),
      ),
      "A product-specific fallback must not include unrelated products.",
    );

    const shortProductQuestion = await aiService.createAiFallbackReply({
      message: `mô hình ${runId}`,
      history: [],
    });
    assert.equal(shortProductQuestion.products.length, 3);
    assert.ok(
      shortProductQuestion.products.every((product) =>
        product.name.toLowerCase().includes(runId.toLowerCase()),
      ),
      "A short product question must remain scoped to its product keyword.",
    );

    const missingProductQuestion = await aiService.createAiFallbackReply({
      message: "tư vấn thêm cho mình về mô hình khong-ton-tai-xyz",
      history: [],
    });
    assert.equal(missingProductQuestion.products.length, 0);
    assert.match(missingProductQuestion.message, /chưa tìm thấy sản phẩm/i);

    const fallbackReply = await aiService.createAiFallbackReply({
      message: "dưới 1,6 triệu",
      history: [
        {
          role: "user",
          content: "Figure đang giảm giá nhiều nhất",
        },
        {
          role: "assistant",
          content: "Bạn dự định chi khoảng bao nhiêu?",
        },
      ],
    });
    assert.ok(
      fallbackReply.products.some(
        (product) => product.slug === discountedProduct.slug,
      ),
      "Fallback must preserve the promotion intent from conversation history.",
    );
    assert.ok(
      fallbackReply.products.every(
        (product) =>
          product.discountPercent > 0 && product.finalPrice <= 1_600_000,
      ),
      "Fallback must combine the previous promotion intent with the latest budget.",
    );

    console.log(
      "AI tools test passed: search, availability, preorder, details, comparison, overview and contextual fallback.",
    );
  } finally {
    await prismaClient?.$disconnect();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

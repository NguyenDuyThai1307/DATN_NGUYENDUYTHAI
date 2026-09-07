import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { productCategories } from "../src/constants/product-categories";
import { hashPassword } from "../src/lib/password";
import { catalogProducts } from "./catalog-products";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const brandSeeds = [
  ["Bandai", "bandai", "Thương hiệu mô hình và đồ chơi sưu tầm Nhật Bản."],
  ["Bandai Spirits", "bandai-spirits", "Nhà sản xuất các dòng mô hình sưu tầm chính hãng."],
  ["Good Smile Company", "good-smile-company", "Thương hiệu nổi tiếng với Nendoroid và mô hình tỉ lệ."],
  ["Kotobukiya", "kotobukiya", "Nhà sản xuất mô hình trưng bày Nhật Bản."],
  ["Max Factory", "max-factory", "Nhà sản xuất dòng figma và mô hình sưu tầm."],
  ["Kaiyodo", "kaiyodo", "Nhà sản xuất dòng Amazing Yamaguchi."],
  ["KADOKAWA", "kadokawa", "Thương hiệu nội dung và mô hình nhân vật Nhật Bản."],
  ["Aniplex", "aniplex", "Thương hiệu anime và sản phẩm sưu tầm chính hãng."],
  ["Alter", "alter", "Nhà sản xuất mô hình tỉ lệ cao cấp."],
  ["APEX", "apex", "Nhà sản xuất mô hình nhân vật và trò chơi."],
  ["Riot Games", "riot", "Nhà phát triển trò chơi và sản phẩm sưu tầm chính hãng."],
  ["Banpresto", "banpresto", "Thương hiệu mô hình giải thưởng thuộc Bandai Spirits."],
  ["Taito", "taito", "Nhà sản xuất các dòng mô hình giải thưởng Coreful và AMP."],
  ["SEGA Fave", "sega-fave", "Nhà sản xuất mô hình giải thưởng Luminasta và SPM."],
  ["FuRyu", "furyu", "Nhà sản xuất mô hình giải thưởng và sản phẩm sưu tầm."],
  ["Prime 1 Studio", "prime-1-studio", "Nhà sản xuất tượng resin và polystone cao cấp."],
  ["Tsume Art", "tsume-art", "Thương hiệu tượng sưu tầm resin với các dòng HQS và Ikigai."],
  ["Infinity Studio", "infinity-studio", "Nhà sản xuất tượng resin tỉ lệ lớn và sản phẩm cao cấp."],
  ["Bandai Hobby", "bandai-hobby", "Thương hiệu mô hình lắp ráp Gunpla và Figure-rise Standard."],
  ["POP MART", "pop-mart", "Thương hiệu art toy và mô hình hộp mù."],
  ["Re-Ment", "re-ment", "Nhà sản xuất mô hình mini, trading figure và tiểu cảnh sưu tầm."],
  ["Volks", "volks", "Nhà sản xuất dòng búp bê sưu tầm Dollfie Dream."],
  ["Azone International", "azone", "Nhà sản xuất búp bê sưu tầm PureNeemo và Assault Lily."],
] as const;

type SeedMaps = {
  categoryIds: Map<string, string>;
  brandIds: Map<string, string>;
};

async function replaceProductImage(
  productId: string,
  imageUrl: string,
  alt: string,
) {
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, url: imageUrl, alt, sortOrder: 1 },
  });
}

async function syncProductCategories(
  productId: string,
  categorySlugs: string[],
  categoryIds: Map<string, string>,
) {
  const linkedCategoryIds = Array.from(
    new Set(
      categorySlugs.map((slug) => {
        const categoryId = categoryIds.get(slug);

        if (!categoryId) {
          throw new Error(`Missing category seed for ${slug}`);
        }

        return categoryId;
      }),
    ),
  );

  await prisma.productCategory.deleteMany({ where: { productId } });
  await prisma.productCategory.createMany({
    data: linkedCategoryIds.map((categoryId) => ({ productId, categoryId })),
  });
}

async function seedBaseProducts({ categoryIds, brandIds }: SeedMaps) {
  const products = [
    {
      name: "Mô hình Luffy Gear 5",
      slug: "luffy-gear-5-figure",
      description: "Mô hình Luffy Gear 5 phiên bản trưng bày.",
      price: 1_290_000,
      stock: 12,
      type: "IN_STOCK" as const,
      categorySlug: "action-figure",
      categorySlugs: ["action-figure"],
      brandSlug: "bandai",
      imageUrl: "/images/products/luffy-gear-5.jpg",
    },
    {
      name: "Mô hình tỉ lệ Hatsune Miku Sakura",
      slug: "miku-sakura-scale-figure",
      description: "Mô hình Hatsune Miku Sakura đang nhận đặt trước.",
      price: 1_890_000,
      stock: 0,
      type: "PREORDER" as const,
      categorySlug: "scale-figure",
      categorySlugs: ["scale-figure"],
      brandSlug: "good-smile-company",
      imageUrl: "/images/products/miku-sakura.jpg",
    },
    {
      name: "Mô hình Yasuo",
      slug: "yasuo-figure-riot",
      description: "Mô hình Yasuo lấy cảm hứng từ trò chơi Liên Minh Huyền Thoại.",
      price: 1_800_000,
      stock: 0,
      type: "PREORDER" as const,
      categorySlug: "scale-figure",
      categorySlugs: ["scale-figure"],
      brandSlug: "riot",
      imageUrl: "/images/products/yasuo-figure-riot.jpg",
    },
  ];

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);
    const brandId = brandIds.get(product.brandSlug);

    if (!categoryId || !brandId) {
      throw new Error(`Missing seed relation for ${product.slug}`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: "ACTIVE",
        type: product.type,
        categoryId,
        brandId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: "ACTIVE",
        type: product.type,
        categoryId,
        brandId,
      },
    });

    await replaceProductImage(savedProduct.id, product.imageUrl, product.name);
    await syncProductCategories(
      savedProduct.id,
      product.categorySlugs,
      categoryIds,
    );
  }
}

async function seedCatalogProducts({ categoryIds, brandIds }: SeedMaps) {
  for (const product of catalogProducts) {
    const categoryId = categoryIds.get(product.categorySlug);
    const brandId = brandIds.get(product.brandSlug);

    if (!categoryId || !brandId) {
      throw new Error(`Missing seed relation for ${product.slug}`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: "ACTIVE",
        type: product.type,
        categoryId,
        brandId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: "ACTIVE",
        type: product.type,
        categoryId,
        brandId,
      },
    });

    if (product.imageUrl) {
      await replaceProductImage(savedProduct.id, product.imageUrl, product.name);
    }

    await syncProductCategories(
      savedProduct.id,
      product.categorySlugs,
      categoryIds,
    );
  }
}

async function removeEmptyLegacyCategory() {
  const legacyCategory = await prisma.category.findUnique({
    where: { slug: "riot-entertainment" },
    include: { _count: { select: { products: true } } },
  });

  if (legacyCategory && legacyCategory._count.products === 0) {
    await prisma.category.delete({ where: { id: legacyCategory.id } });
  }
}

async function main() {
  const adminPasswordHash = await hashPassword("123456");

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const categoryIds = new Map<string, string>();
  for (const category of productCategories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categoryIds.set(category.slug, savedCategory.id);
  }

  const brandIds = new Map<string, string>();
  for (const [name, slug, description] of brandSeeds) {
    const savedBrand = await prisma.brand.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
    brandIds.set(slug, savedBrand.id);
  }

  const maps = { categoryIds, brandIds };
  await seedBaseProducts(maps);
  await seedCatalogProducts(maps);
  await removeEmptyLegacyCategory();

  console.log(`Seeded ${catalogProducts.length + 3} products successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

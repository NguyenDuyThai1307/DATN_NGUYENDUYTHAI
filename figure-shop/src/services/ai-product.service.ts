import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLinePricing } from "@/services/pricing.service";
import {
  getEffectiveProductPromotion,
  productPromotionInclude,
} from "@/services/promotion.service";
import type { AiProductReference } from "@/types/ai";
import type { AiProductSearchInput } from "@/validations/ai.schema";

const aiProductInclude = {
  ...productPromotionInclude,
  images: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.ProductInclude;

type AiProductRecord = Prisma.ProductGetPayload<{
  include: typeof aiProductInclude;
}>;

function toProductReference(product: AiProductRecord): AiProductReference {
  const promotion = getEffectiveProductPromotion(product);
  const pricing = calculateLinePricing({
    unitPrice: product.price,
    quantity: 1,
    promotion,
  });

  const promotionLabel = promotion
    ? promotion.type === "PERCENTAGE"
      ? `Giảm ${promotion.value}%`
      : `Giảm ${promotion.value.toLocaleString("vi-VN")} đồng`
    : null;
  const discountPercent =
    pricing.finalUnitPrice < product.price
      ? Math.round(
          ((product.price - pricing.finalUnitPrice) / product.price) * 100,
        )
      : 0;

  return {
    slug: product.slug,
    name: product.name,
    imageUrl: product.images[0]?.url ?? null,
    originalPrice: product.price,
    finalPrice: pricing.finalUnitPrice,
    stock: product.stock,
    type: product.type,
    brand: product.brand?.name ?? null,
    category: product.category?.name ?? null,
    promotionLabel,
    discountPercent,
  };
}

function buildSearchWhere(
  input: AiProductSearchInput,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (input.query) {
    where.OR = [
      { name: { contains: input.query } },
      { description: { contains: input.query } },
      { brand: { is: { name: { contains: input.query } } } },
      { category: { is: { name: { contains: input.query } } } },
    ];
  }

  if (input.category) {
    where.category = {
      is: {
        name: {
          contains: input.category,
        },
      },
    };
  }

  if (input.brand) {
    where.brand = {
      is: {
        name: {
          contains: input.brand,
        },
      },
    };
  }

  if (input.type) {
    where.type = input.type;
  }

  return where;
}

function matchesComputedFilters(
  product: AiProductReference,
  input: AiProductSearchInput,
) {
  if (input.minPrice !== undefined && product.finalPrice < input.minPrice) {
    return false;
  }

  if (input.maxPrice !== undefined && product.finalPrice > input.maxPrice) {
    return false;
  }

  if (input.hasPromotion === false && product.discountPercent > 0) {
    return false;
  }

  if (input.hasPromotion === true && product.discountPercent <= 0) {
    return false;
  }

  if (
    input.onlyAvailable &&
    product.type !== "PREORDER" &&
    product.stock <= 0
  ) {
    return false;
  }

  return true;
}

function sortProductReferences(
  products: AiProductReference[],
  sort: AiProductSearchInput["sort"],
) {
  if (sort === "NEWEST") {
    return products;
  }

  return products.sort((left, right) => {
    if (sort === "PRICE_ASC") {
      return left.finalPrice - right.finalPrice;
    }

    if (sort === "PRICE_DESC") {
      return right.finalPrice - left.finalPrice;
    }

    if (sort === "DISCOUNT") {
      return right.discountPercent - left.discountPercent;
    }

    return right.stock - left.stock;
  });
}

export async function searchProductsForAi(input: AiProductSearchInput) {
  const products = await prisma.product.findMany({
    where: buildSearchWhere(input),
    include: aiProductInclude,
    orderBy:
      input.sort === "NEWEST"
        ? [{ createdAt: "desc" }]
        : [{ stock: "desc" }, { createdAt: "desc" }],
  });

  const references = products
    .map(toProductReference)
    .filter((product) => matchesComputedFilters(product, input));

  return sortProductReferences(references, input.sort).slice(0, input.limit);
}

export async function getProductDetailsForAi(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: aiProductInclude,
  });

  if (!product) {
    return null;
  }

  return {
    ...toProductReference(product),
    description: product.description,
    productUrl: `/products/${product.slug}`,
  };
}

export async function compareProductsForAi(slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs));
  const products = await prisma.product.findMany({
    where: {
      slug: { in: uniqueSlugs },
      status: "ACTIVE",
    },
    include: aiProductInclude,
  });

  const productsBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );

  return {
    products: uniqueSlugs.flatMap((slug) => {
      const product = productsBySlug.get(slug);

      if (!product) {
        return [];
      }

      return [
        {
          ...toProductReference(product),
          description: product.description,
          productUrl: `/products/${product.slug}`,
        },
      ];
    }),
    missingSlugs: uniqueSlugs.filter((slug) => !productsBySlug.has(slug)),
  };
}

export async function getCatalogOverviewForAi() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    include: aiProductInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  const references = products.map(toProductReference);
  const categories = new Map<string, number>();
  const brands = new Map<string, number>();

  for (const product of references) {
    if (product.category) {
      categories.set(
        product.category,
        (categories.get(product.category) ?? 0) + 1,
      );
    }

    if (product.brand) {
      brands.set(product.brand, (brands.get(product.brand) ?? 0) + 1);
    }
  }

  const finalPrices = references.map((product) => product.finalPrice);

  return {
    productCount: references.length,
    inStockCount: references.filter(
      (product) => product.type === "IN_STOCK" && product.stock > 0,
    ).length,
    preorderCount: references.filter((product) => product.type === "PREORDER")
      .length,
    discountedCount: references.filter((product) => product.discountPercent > 0)
      .length,
    priceRange:
      finalPrices.length > 0
        ? {
            min: Math.min(...finalPrices),
            max: Math.max(...finalPrices),
          }
        : null,
    categories: Array.from(categories, ([name, productCount]) => ({
      name,
      productCount,
    })).sort((left, right) => right.productCount - left.productCount),
    brands: Array.from(brands, ([name, productCount]) => ({
      name,
      productCount,
    })).sort((left, right) => right.productCount - left.productCount),
  };
}

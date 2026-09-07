import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  productPromotionInclude,
  withEffectiveProductPromotion,
} from "@/services/promotion.service";

export type ProductSort =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc";

export type ActiveProductFilters = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  type?: "IN_STOCK" | "PREORDER";
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
};

const productInclude = {
  ...productPromotionInclude,
  images: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.ProductInclude;

function getProductOrderBy(
  sort: ProductSort | undefined,
): Prisma.ProductOrderByWithRelationInput {
  if (sort === "price_asc") {
    return {
      price: "asc",
    };
  }

  if (sort === "price_desc") {
    return {
      price: "desc",
    };
  }

  if (sort === "name_asc") {
    return {
      name: "asc",
    };
  }

  if (sort === "name_desc") {
    return {
      name: "desc",
    };
  }

  if (sort === "oldest") {
    return {
      createdAt: "asc",
    };
  }

  return {
    createdAt: "desc",
  };
}

function buildActiveProductWhere(
  filters: ActiveProductFilters,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };
  const andConditions: Prisma.ProductWhereInput[] = [];

  const query = filters.query?.trim();

  if (query) {
    andConditions.push({
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
      ],
    });
  }

  if (filters.categoryId) {
    andConditions.push({
      OR: [
        { categoryId: filters.categoryId },
        {
          categories: {
            some: {
              categoryId: filters.categoryId,
            },
          },
        },
      ],
    });
  }

  if (filters.brandId) {
    where.brandId = filters.brandId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};

    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

export async function getActiveProducts() {
  return getFilteredActiveProducts();
}

export async function getFilteredActiveProducts(
  filters: ActiveProductFilters = {},
) {
  const where = buildActiveProductWhere(filters);

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: getProductOrderBy(filters.sort),
  });

  const now = new Date();
  return products.map((product) => withEffectiveProductPromotion(product, now));
}

export async function getPaginatedActiveProducts(
  filters: ActiveProductFilters = {},
  page = 1,
  pageSize = 20,
) {
  const where = buildActiveProductWhere(filters);
  const total = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: getProductOrderBy(filters.sort),
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });
  const now = new Date();

  return {
    products: products.map((product) =>
      withEffectiveProductPromotion(product, now),
    ),
    total,
    currentPage,
    pageCount,
  };
}

export async function getProductFilterOptions() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    categories,
    brands,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: productInclude,
  });

  return product ? withEffectiveProductPromotion(product) : null;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: {
      slug,
    },
  });
}

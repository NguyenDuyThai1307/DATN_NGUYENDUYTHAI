import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ActiveProductFilters = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  type?: "IN_STOCK" | "PREORDER";
  sort?: ProductSort;
};

const productInclude = {
  category: true,
  brand: true,
  promotion: true,
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

  return {
    createdAt: "desc",
  };
}

export async function getActiveProducts() {
  return getFilteredActiveProducts();
}

export async function getFilteredActiveProducts(
  filters: ActiveProductFilters = {},
) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  const query = filters.query?.trim();

  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
        },
      },
      {
        description: {
          contains: query,
        },
      },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.brandId) {
    where.brandId = filters.brandId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  return prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: getProductOrderBy(filters.sort),
  });
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
  return prisma.product.findUnique({
    where: {
      slug,
    },
    include: productInclude,
  });
}
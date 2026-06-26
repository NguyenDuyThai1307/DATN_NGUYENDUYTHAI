import { prisma } from "@/lib/prisma";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { AdminProductInput } from "@/validations/product.schema";

const PRODUCT_IMAGE_FILE_PATTERN = /\.(jpe?g|png|webp|avif)$/i;

export type AdminProductFilters = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  type?: "IN_STOCK" | "PREORDER";
};

async function getLocalProductImageOptions() {
  try {
    const imageDirectory = join(
      process.cwd(),
      "public",
      "images",
      "products",
    );

    const fileNames = await readdir(imageDirectory);

    return fileNames
      .filter((fileName) => PRODUCT_IMAGE_FILE_PATTERN.test(fileName))
      .sort()
      .map((fileName) => ({
        label: fileName,
        url: `/images/products/${fileName}`,
      }));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

export async function getAdminProducts(
  filters: AdminProductFilters = {},
) {
  const query = filters.query?.trim();

  return prisma.product.findMany({
    where: {
      ...(query
        ? {
            OR: [
              {
                name: {
                  contains: query,
                },
              },
              {
                slug: {
                  contains: query,
                },
              },
            ],
          }
        : {}),
      ...(filters.categoryId
        ? {
            categoryId: filters.categoryId,
          }
        : {}),
      ...(filters.brandId
        ? {
            brandId: filters.brandId,
          }
        : {}),
      ...(filters.status
        ? {
            status: filters.status,
          }
        : {}),
      ...(filters.type
        ? {
            type: filters.type,
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function getAdminProductFilterOptions() {
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

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function getProductFormOptions() {
  const [categories, brands, imageOptions] = await Promise.all([
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
    getLocalProductImageOptions(),
  ]);

  return {
    categories,
    brands,
    imageOptions,
  };
}

export async function createAdminProduct(input: AdminProductInput) {
  return prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
      brandId: input.brandId,
      status: input.status,
      type: input.type,
      images: input.imageUrl
        ? {
            create: {
              url: input.imageUrl,
              alt: input.imageAlt || input.name,
              sortOrder: 0,
            },
          }
        : undefined,
    },
  });
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput,
) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
      brandId: input.brandId,
      status: input.status,
      type: input.type,
      images: {
        deleteMany: {},
        ...(input.imageUrl
          ? {
              create: {
                url: input.imageUrl,
                alt: input.imageAlt || input.name,
                sortOrder: 0,
              },
            }
          : {}),
      },
    },
  });
}

export async function archiveAdminProduct(id: string) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      status: "ARCHIVED",
    },
  });
}
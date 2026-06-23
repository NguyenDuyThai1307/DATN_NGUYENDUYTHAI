import { prisma } from "@/lib/prisma";
import type { AdminProductInput } from "@/validations/product.schema";

export async function getAdminProducts() {
  return prisma.product.findMany({
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
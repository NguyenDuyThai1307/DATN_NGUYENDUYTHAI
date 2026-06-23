import { prisma } from "@/lib/prisma";
import type { TaxonomyInput } from "@/validations/taxonomy.schema";

export async function getAdminBrands() {
  return prisma.brand.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getAdminBrandById(id: string) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
  });
}

export async function createAdminBrand(input: TaxonomyInput) {
  return prisma.brand.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
    },
  });
}

export async function updateAdminBrand(id: string, input: TaxonomyInput) {
  return prisma.brand.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
    },
  });
}

export async function deleteAdminBrand(id: string) {
  return prisma.brand.delete({
    where: {
      id,
    },
  });
}
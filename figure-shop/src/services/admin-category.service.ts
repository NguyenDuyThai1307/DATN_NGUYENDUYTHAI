import { prisma } from "@/lib/prisma";
import type { TaxonomyInput } from "@/validations/taxonomy.schema";

export async function getAdminCategories() {
  return prisma.category.findMany({
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

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({
    where: {
      id,
    },
  });
}

export async function createAdminCategory(input: TaxonomyInput) {
  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
    },
  });
}

export async function updateAdminCategory(id: string, input: TaxonomyInput) {
  return prisma.category.update({
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

export async function deleteAdminCategory(id: string) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}
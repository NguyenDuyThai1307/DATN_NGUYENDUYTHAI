import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock must be at least 0"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  type: z.enum(["IN_STOCK", "PREORDER"]),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
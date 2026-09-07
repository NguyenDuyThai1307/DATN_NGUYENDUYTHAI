import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  price: z.coerce.number().int().positive("Giá phải lớn hơn 0"),
  stock: z.coerce.number().int().min(0, "Tồn kho phải từ 0 trở lên"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  categoryIds: z.array(z.string()).default([]),
  brandId: z.string().min(1, "Vui lòng chọn thương hiệu"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  type: z.enum(["IN_STOCK", "PREORDER"]),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

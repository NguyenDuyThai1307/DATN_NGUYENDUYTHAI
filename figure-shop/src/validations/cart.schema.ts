import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  quantity: z.number().int().min(1).max(99).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, "Số lượng phải từ 0 trở lên")
    .max(99, "Số lượng không được lớn hơn 99"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

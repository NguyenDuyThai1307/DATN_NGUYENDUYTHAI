import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product is required"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be at least 0"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
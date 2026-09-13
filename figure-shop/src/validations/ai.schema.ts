import { z } from "zod";

export const aiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_500),
});

export const aiChatRequestSchema = z.object({
  conversationId: z.string().min(1).max(100).optional(),
  message: z.string().trim().min(1).max(800),
  history: z.array(aiChatMessageSchema).max(10).default([]),
});

export const aiProductSearchSchema = z.object({
  query: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(80).optional(),
  type: z.enum(["IN_STOCK", "PREORDER"]).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  hasPromotion: z.boolean().optional(),
  onlyAvailable: z.boolean().default(false),
  sort: z
    .enum(["RELEVANCE", "PRICE_ASC", "PRICE_DESC", "NEWEST", "DISCOUNT"])
    .default("RELEVANCE"),
  limit: z
    .number()
    .int()
    .min(1)
    .transform((value) => Math.min(value, 10))
    .default(5),
}).refine(
  (data) =>
    data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.minPrice <= data.maxPrice,
  {
    message: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa",
    path: ["maxPrice"],
  },
);

export const aiProductDetailSchema = z.object({
  slug: z.string().trim().min(1).max(160),
});

export const aiProductComparisonSchema = z.object({
  slugs: z.array(z.string().trim().min(1).max(160)).min(2).max(4),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;
export type AiProductSearchInput = z.infer<typeof aiProductSearchSchema>;

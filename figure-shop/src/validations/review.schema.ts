import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Nhận xét cần ít nhất 10 ký tự.").max(2000, "Nhận xét tối đa 2.000 ký tự."),
}).strict();

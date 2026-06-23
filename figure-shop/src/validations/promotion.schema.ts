import { z } from "zod";

export const promotionSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    name: z.string().min(1, "Promotion name is required"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().positive("Value must be greater than 0"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isActive: z.preprocess((value) => value === "on", z.boolean()),
  })
  .superRefine((data, context) => {
    if (data.endsAt <= data.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be after start date",
      });
    }

    if (data.type === "PERCENTAGE" && data.value > 100) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "Percentage cannot be greater than 100",
      });
    }
  });

export type PromotionInput = z.infer<typeof promotionSchema>;
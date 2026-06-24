import { z } from "zod";

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code must have at least 3 characters")
      .max(30, "Coupon code is too long")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Coupon code can only contain letters, numbers, _ and -",
      )
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().min(1, "Coupon name is required"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().positive("Value must be greater than 0"),
    minOrderValue: z.coerce
      .number()
      .int()
      .min(0, "Minimum order value cannot be negative"),
    maxDiscountAmount: optionalPositiveInt,
    usageLimit: optionalPositiveInt,
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

export type CouponInput = z.infer<typeof couponSchema>;

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must have at least 3 characters"),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
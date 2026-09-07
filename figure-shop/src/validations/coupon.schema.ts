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
      .min(3, "Mã coupon phải có ít nhất 3 ký tự")
      .max(30, "Mã coupon quá dài")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Mã coupon chỉ được chứa chữ cái, chữ số, dấu gạch dưới và dấu gạch ngang",
      )
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().min(1, "Vui lòng nhập tên coupon"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().positive("Giá trị phải lớn hơn 0"),
    minOrderValue: z.coerce
      .number()
      .int()
      .min(0, "Giá trị đơn hàng tối thiểu không được âm"),
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
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    if (data.type === "PERCENTAGE" && data.value > 100) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "Phần trăm không được lớn hơn 100",
      });
    }
  });

export type CouponInput = z.infer<typeof couponSchema>;

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Mã coupon phải có ít nhất 3 ký tự"),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

import { z } from "zod";

export const promotionSchema = z
  .object({
    scope: z.enum(["PRODUCT", "CATEGORY", "BRAND"]),
    productId: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().optional(),
    ),
    categoryId: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().optional(),
    ),
    brandId: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().optional(),
    ),
    name: z.string().min(1, "Vui lòng nhập tên khuyến mãi"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().positive("Giá trị phải lớn hơn 0"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isActive: z.preprocess((value) => value === "on", z.boolean()),
  })
  .superRefine((data, context) => {
    const targetByScope = {
      PRODUCT: data.productId,
      CATEGORY: data.categoryId,
      BRAND: data.brandId,
    };

    if (!targetByScope[data.scope]) {
      const field =
        data.scope === "PRODUCT"
          ? "productId"
          : data.scope === "CATEGORY"
            ? "categoryId"
            : "brandId";

      context.addIssue({
        code: "custom",
        path: [field],
        message: "Vui lòng chọn đối tượng áp dụng",
      });
    }

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

export type PromotionInput = z.infer<typeof promotionSchema>;

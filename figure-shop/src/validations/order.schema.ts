import { z } from "zod";

export const checkoutSchema = z.object({
  receiverName: z.string().trim().min(2, "Vui lòng nhập tên người nhận"),
  receiverPhone: z.string().trim().min(8, "Vui lòng nhập số điện thoại người nhận"),
  province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().trim().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã"),
  addressDetail: z.string().trim().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  note: z.string().trim().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "DEMO", "PAYOS", "VNPAY"]).default("COD"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

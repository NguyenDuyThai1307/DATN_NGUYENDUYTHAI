import { z } from "zod";

export const checkoutSchema = z.object({
  receiverName: z.string().trim().min(2, "Receiver name is required"),
  receiverPhone: z.string().trim().min(8, "Receiver phone is required"),
  province: z.string().trim().min(1, "Province is required"),
  district: z.string().trim().min(1, "District is required"),
  ward: z.string().trim().min(1, "Ward is required"),
  addressDetail: z.string().trim().min(5, "Address detail is required"),
  note: z.string().trim().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "DEMO"]).default("COD"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
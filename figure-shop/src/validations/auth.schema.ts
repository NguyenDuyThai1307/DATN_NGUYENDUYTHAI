import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.email("Địa chỉ email không hợp lệ").toLowerCase(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const loginSchema = z.object({
  email: z.email("Địa chỉ email không hợp lệ").toLowerCase(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(80, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại quá dài")
    .optional()
    .transform((value) => value || null),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

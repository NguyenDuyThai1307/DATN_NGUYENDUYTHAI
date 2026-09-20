import { z } from "zod";
export const adminUserQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  role: z.enum(["", "CUSTOMER", "STAFF", "ADMIN"]).default(""),
  status: z.enum(["", "active", "locked"]).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export const adminUserUpdateSchema = z.object({
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]),
  isActive: z.boolean(),
  expectedVersion: z.number().int().min(0),
}).strict();

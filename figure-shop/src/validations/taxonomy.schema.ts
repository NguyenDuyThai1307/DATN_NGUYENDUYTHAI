import { z } from "zod";

export const taxonomySchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  description: z.string().optional(),
});

export type TaxonomyInput = z.infer<typeof taxonomySchema>;
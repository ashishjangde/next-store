import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  image: z.instanceof(File).optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  image: z.instanceof(File).optional().nullable(),
  is_featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

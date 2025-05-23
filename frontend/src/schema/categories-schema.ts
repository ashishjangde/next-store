import { z } from "zod";

// Define the schemas with the correct types
export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Name is required and must be at least 2 characters"),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
  is_featured: z.boolean().default(false),
  active: z.boolean().default(true),
  parent_id: z.string().optional()
});

// Schema for updating a category
export const categoryUpdateSchema = z.object({
  name: z.string().min(2, "Name is required and must be at least 2 characters").optional(),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
  is_featured: z.boolean().optional(),
  active: z.boolean().optional(),
  parent_id: z.string().optional()
});

// Schema for adding an attribute to a category
export const categoryAttributeCreateSchema = z.object({
  attributeId: z.string(),
  required: z.boolean().default(false)
});

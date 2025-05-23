import { z } from "zod";

/**
 * Schema for creating a new attribute
 */
export const attributeCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["string", "number", "boolean", "date"]).default("string")
});

/**
 * Schema for updating an existing attribute
 */
export const attributeUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  type: z.enum(["string", "number", "boolean", "date"]).optional()
});

/**
 * Schema for creating a new attribute value
 */
export const attributeValueCreateSchema = z.object({
  value: z.string().min(1, "Value is required"),
  display_value: z.string().optional()
});

/**
 * Schema for updating an existing attribute value
 */
export const attributeValueUpdateSchema = z.object({
  value: z.string().min(1, "Value is required").optional(),
  display_value: z.string().optional()
});

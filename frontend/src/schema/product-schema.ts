import { z } from 'zod';

// Define the valid product types from the backend
const ProductTypeEnum = z.enum(['SIMPLE', 'PARENT', 'VARIANT']);

// Schema for creating a new product
export const productCreateSchema = z.object({
  // Required fields
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  price: z.number().min(0, "Price cannot be negative").or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(val => parseFloat(val))),
  category_id: z.string().uuid("Invalid category ID format"),
  
  // Optional fields
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional(),
  sku: z.string().optional(),
  images: z.array(
    z.instanceof(File, { message: "Invalid file" })
  ).optional(),
  parent_id: z.string().uuid("Invalid parent product ID format").optional(),
  brand: z.string().optional(),
  season: z.string().optional(),
  weight: z.number().min(0, "Weight cannot be negative").optional()
    .or(z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional()),
  is_active: z.boolean().optional().default(true),
  
  // Inventory-related fields
  initial_quantity: z.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative").optional()
    .or(z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()),
  low_stock_threshold: z.number().int("Threshold must be a whole number").min(1, "Threshold must be at least 1").optional()
    .or(z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()),
  
  // Attributes
  attribute_value_ids: z.array(z.string().uuid("Invalid attribute value ID format")).optional(),
});

// Schema for updating a product (all fields optional)
export const productUpdateSchema = productCreateSchema.partial();

// Schema for creating a variant product
export const variantProductCreateSchema = productCreateSchema
  .omit({ parent_id: true }) // Remove parent_id
  .extend({
    parent_id: z.string().uuid("Invalid parent product ID"), // Make parent_id required for variants
    attribute_value_ids: z.array(z.string().uuid("Invalid attribute value ID format"))
      .min(1, "At least one attribute value must be selected")
  });

// Type inference for form data
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type VariantProductCreateInput = z.infer<typeof variantProductCreateSchema>;

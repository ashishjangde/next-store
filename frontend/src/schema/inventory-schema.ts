import { z } from 'zod';

// Schema for updating a single product's inventory
export const inventoryUpdateSchema = z.object({
  quantity: z.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative")
    .or(z.string().regex(/^\d+$/, "Must be a valid number").transform(val => parseInt(val))),
  low_stock_threshold: z.number().int("Threshold must be a whole number").min(1, "Threshold must be at least 1").optional()
    .or(z.string().regex(/^\d+$/, "Must be a valid number").transform(val => parseInt(val)).optional()),
  reserved_quantity: z.number().int("Reserved quantity must be a whole number").min(0, "Reserved quantity cannot be negative").optional()
    .or(z.string().regex(/^\d+$/, "Must be a valid number").transform(val => parseInt(val)).optional()),
});

// Schema for a single variant inventory update
export const variantInventoryItemSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  inventory: inventoryUpdateSchema,
});

// Schema for updating multiple variant inventories at once
export const variationInventoryUpdateSchema = z.object({
  variants: z.array(variantInventoryItemSchema)
    .min(1, "At least one variant must be provided"),
});

// Type inference for form data
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
export type VariantInventoryItemInput = z.infer<typeof variantInventoryItemSchema>;
export type VariationInventoryUpdateInput = z.infer<typeof variationInventoryUpdateSchema>;

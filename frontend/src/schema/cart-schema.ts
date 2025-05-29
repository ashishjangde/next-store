import { z } from "zod";

export const AddToCartSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1")
});

export const UpdateCartItemSchema = z.object({
  cart_item_id: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1")
});

export const RemoveFromCartSchema = z.object({
  cart_item_id: z.string().min(1, "Cart item ID is required")
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof RemoveFromCartSchema>; 
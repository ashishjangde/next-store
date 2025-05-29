import { z } from "zod";

export const AddToWishlistSchema = z.object({
  product_id: z.string().min(1, "Product ID is required")
});

export const RemoveFromWishlistSchema = z.object({
  wishlist_item_id: z.string().min(1, "Wishlist item ID is required")
});

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>;
export type RemoveFromWishlistInput = z.infer<typeof RemoveFromWishlistSchema>; 
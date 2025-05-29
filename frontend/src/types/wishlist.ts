import { Product } from './product';

export interface WishlistItem {
  id: string;
  product: Product;
}

export interface Wishlist {
  items: WishlistItem[];
  total_items: number;
}

export interface RemoveFromWishlistInput {
  wishlist_item_id: string;
}

export interface WishlistCount {
  count: number;
} 
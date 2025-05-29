import { Product } from './product';

export interface WishlistItem {
  id: string;
  product: Product;
}

export interface Wishlist {
  items: {
    id: string;
    user_id: string;
    product_id: string;
    Product: Product;
  }[];
  totalItems: number;
}

export interface RemoveFromWishlistInput {
  productId: string;
}

export interface WishlistCount {
  count: number;
} 
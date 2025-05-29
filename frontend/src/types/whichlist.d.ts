export interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface Wishlist {
  items: WishlistItem[];
  total_items: number;
}

export interface AddToWishlistInput {
  product_id: string;
}

export interface RemoveFromWishlistInput {
  wishlist_item_id: string;
}

export interface WishlistCount {
  count: number;
}

export interface WishlistCheck {
  inWishlist: boolean;
}

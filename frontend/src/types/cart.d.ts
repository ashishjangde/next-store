export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface AddToCartInput {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cart_item_id: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  cart_item_id: string;
}

export interface CartCount {
  count: number;
}

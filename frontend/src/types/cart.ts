import { Product } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
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
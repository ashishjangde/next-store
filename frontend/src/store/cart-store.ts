import { create } from 'zustand';
import { CartActions } from '@/api-actions/cart-actions';
import { Cart, UpdateCartItemInput, RemoveFromCartInput } from '@/types/cart';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (data: { productId: string; quantity: number }) => Promise<void>;
  updateCartItem: (data: UpdateCartItemInput) => Promise<void>;
  removeFromCart: (data: RemoveFromCartInput) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  addToCart: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await CartActions.addToCart(data);
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add to cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItem: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await CartActions.updateCartItem(data);
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await CartActions.removeFromCart(data);
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove from cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      await CartActions.clearCart();
      set({ cart: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await CartActions.getCart();
      set({ cart: response.data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getTotalItems: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.product.price;
      return total + (price * item.quantity);
    }, 0);
  },

  getTotal: () => {
    return get().getSubtotal();
  },
}));

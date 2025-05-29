import { create } from 'zustand';
import { WishlistActions } from '@/api-actions/wishlist-actions';
import { Wishlist, RemoveFromWishlistInput } from '@/types/wishlist';

interface WishlistStore {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  inWishlist: string[];
  addToWishlist: (data: { productId: string }) => Promise<void>;
  removeFromWishlist: (data: RemoveFromWishlistInput) => Promise<void>;
  clearWishlist: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  checkInWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,
  inWishlist: [],

  addToWishlist: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await WishlistActions.addToWishlist(data);
      await get().fetchWishlist();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add to wishlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await WishlistActions.removeFromWishlist(data);
      await get().fetchWishlist();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove from wishlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearWishlist: async () => {
    try {
      set({ isLoading: true, error: null });
      await WishlistActions.clearWishlist();
      set({ wishlist: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear wishlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWishlist: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await WishlistActions.getWishlist();
      if (response.data) {
        const productIds = response.data.items.map(item => item.product_id);
        set({ 
          wishlist: response.data,
          inWishlist: productIds
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch wishlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkInWishlist: async (productId) => {
    try {
      const response = await WishlistActions.checkInWishlist(productId);
      const isInWishlist = response.data?.inWishlist || false;
      if (isInWishlist && !get().inWishlist.includes(productId)) {
        set(state => ({
          inWishlist: [...state.inWishlist, productId]
        }));
      } else if (!isInWishlist && get().inWishlist.includes(productId)) {
        set(state => ({
          inWishlist: state.inWishlist.filter(id => id !== productId)
        }));
      }
      return isInWishlist;
    } catch (error) {
      return false;
    }
  },

  isInWishlist: (productId: string) => {
    return get().inWishlist.includes(productId);
  },
})); 
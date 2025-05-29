import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { 
  Wishlist, 
  RemoveFromWishlistInput,
  WishlistCount,

} from "@/types/wishlist";

export const WishlistActions = {
  /**
   * Add a product to wishlist
   */
  addToWishlist: async (data: { productId: string }, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      "/whishlist",
      data,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get user's wishlist
   */
  getWishlist: async (cookies?: string): Promise<ApiResponse<Wishlist>> => {
    const response = await axiosInstance.get<ApiResponse<Wishlist>>(
      "/whishlist",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Remove item from wishlist
   */
  removeFromWishlist: async (data: RemoveFromWishlistInput, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      "/whishlist",
      { 
        data,
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      "/whishlist/clear",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Check if product is in wishlist
   */
  checkInWishlist: async (productId: string, cookies?: string): Promise<ApiResponse<{ inWishlist: boolean }>> => {
    const response = await axiosInstance.get<ApiResponse<{ inWishlist: boolean }>>(
      `/whishlist/check/${productId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get wishlist item count
   */
  getWishlistCount: async (cookies?: string): Promise<ApiResponse<WishlistCount>> => {
    const response = await axiosInstance.get<ApiResponse<WishlistCount>>(
      "/whishlist/count",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  }
};

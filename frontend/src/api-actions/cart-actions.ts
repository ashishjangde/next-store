import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { RemoveFromCartInput, UpdateCartItemInput } from "@/schema/cart-schema";
import { Cart, CartCount } from "@/types/cart";

export const CartActions = {
  /**
   * Add a product to cart
   */
  addToCart: async (data: { productId: string; quantity: number }, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      "/cart",
      data,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get user's cart
   */
  getCart: async (cookies?: string): Promise<ApiResponse<Cart>> => {
    const response = await axiosInstance.get<ApiResponse<Cart>>(
      "/cart",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (data: UpdateCartItemInput, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.put<ApiResponse<{ message: string }>>(
      "/cart",
      data,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (data: RemoveFromCartInput, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      "/cart",
      { 
        data,
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async (cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      "/cart/clear",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get cart item count
   */
  getCartCount: async (cookies?: string): Promise<ApiResponse<CartCount>> => {
    const response = await axiosInstance.get<ApiResponse<CartCount>>(
      "/cart/count",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  }
};

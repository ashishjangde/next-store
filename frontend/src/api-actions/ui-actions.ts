/**
 * UI API Actions
 * Handles all frontend data fetching for home page, categories, products, etc.
 */

import axiosInstance from "@/hooks/custom-axios-interceptor";

// Types for UI data
export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string; // Changed from image_url to image to match backend
  is_active: boolean;
  level: number;
  sort_order: number;
  _count?: {
    Products: number;
  };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  is_active: boolean;
  category?: Category;
  Inventory?: {
    price: number;
    discount_price?: number;
    quantity: number;
  };
  _count?: {
    OrderItems: number;
  };
}

export interface HomePageData {
  banners: Banner[];
  categories: Category[];
  featuredProducts: Array<{
    id: string;
    name: string;
    Products: Product[];
  }>;
  trendingProducts: Product[];
  suggestions?: Product[];
  newProducts: Product[];
}

export const UiActions = {
  /**
   * Get complete home page data
   * @param cookies Optional cookies for server-side requests
   */
  getHomePageData: async (cookies?: string): Promise<ApiResponse<HomePageData>> => {
    const response = await axiosInstance.get<ApiResponse<HomePageData>>(
      '/ui/home',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get authenticated home page data with personalized suggestions
   * @param cookies Optional cookies for server-side requests
   */
  getAuthenticatedHomePageData: async (cookies?: string): Promise<ApiResponse<HomePageData>> => {
    const response = await axiosInstance.get<ApiResponse<HomePageData>>(
      '/ui/home/authenticated',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get active banners
   * @param cookies Optional cookies for server-side requests
   */
  getActiveBanners: async (cookies?: string): Promise<ApiResponse<Banner[]>> => {
    const response = await axiosInstance.get<ApiResponse<Banner[]>>(
      '/ui/banners',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get categories for navigation
   * @param cookies Optional cookies for server-side requests
   */
  getCategories: async (cookies?: string): Promise<ApiResponse<Category[]>> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      '/ui/categories',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get featured products by category
   * @param cookies Optional cookies for server-side requests
   */
  getFeaturedProducts: async (cookies?: string): Promise<ApiResponse<Array<{ id: string; name: string; Products: Product[] }>>> => {
    const response = await axiosInstance.get<ApiResponse<Array<{ id: string; name: string; Products: Product[] }>>>(
      '/ui/products/featured',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get trending products
   * @param cookies Optional cookies for server-side requests
   */
  getTrendingProducts: async (cookies?: string): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      '/ui/products/trending',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get new products
   * @param limit Number of products to return
   * @param cookies Optional cookies for server-side requests
   */
  getNewProducts: async (limit = 6, cookies?: string): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      `/ui/products/new?limit=${limit}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get personalized product suggestions (requires authentication)
   * @param cookies Optional cookies for server-side requests
   */
  getUserSuggestions: async (cookies?: string): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      '/ui/products/suggestions',
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get products by category
   * @param categoryId Category ID
   * @param limit Number of products to return
   * @param cookies Optional cookies for server-side requests
   */
  getProductsByCategory: async (
    categoryId: string,
    limit = 10,
    cookies?: string
  ): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      `/ui/category/${categoryId}/products?limit=${limit}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get category page data
   * @param slug Category slug
   * @param cookies Optional cookies for server-side requests
   */
  getCategoryPageData: async (slug: string, cookies?: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/ui/category/${slug}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Record product view for personalization
   * @param productId Product ID
   * @param cookies Optional cookies for server-side requests
   */
  recordProductView: async (productId: string, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      `/ui/product/${productId}/view`,
      {},
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
};

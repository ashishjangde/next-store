/**
 * Promotion API Actions
 * Handles all promotion-related API calls for admin and public use
 */

import axiosInstance from "@/hooks/custom-axios-interceptor";

// Types for Promotion data
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  code?: string;
  type: 'DISCOUNT_CODE' | 'AUTOMATIC_DISCOUNT' | 'BUNDLE_OFFER' | 'SEASONAL_SALE';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discount_value: number;
  minimum_amount?: number;
  maximum_uses?: number;
  uses_per_user?: number;
  current_uses: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  applicable_categories: string[];
  applicable_products: string[];
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    usage_history: number;
  };
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  code?: string;
  type: 'DISCOUNT_CODE' | 'AUTOMATIC_DISCOUNT' | 'BUNDLE_OFFER' | 'SEASONAL_SALE';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discount_value: number;
  minimum_amount?: number;
  maximum_uses?: number;
  uses_per_user?: number;
  starts_at: Date;
  ends_at?: Date;
  applicable_categories?: string[];
  applicable_products?: string[];
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
  is_active?: boolean;
}

export interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  totalUsage: number;
  totalSavings: number;
}

export interface PromotionValidationResult {
  valid: boolean;
  promotion?: Promotion;
  discountAmount?: number;
  message?: string;
}

export const PromotionActions = {
  /**
   * Admin: Create a new promotion
   */
  createPromotion: async (promotion: CreatePromotionDto): Promise<ApiResponse<Promotion>> => {
    const response = await axiosInstance.post<ApiResponse<Promotion>>(
      '/admin/promotions',
      promotion
    );
    return response.data;
  },

  /**
   * Admin: Get all promotions with pagination
   */
  getAllPromotions: async (
    page = 1,
    limit = 10,
    status?: string
  ): Promise<ApiResponse<{
    data: Promotion[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await axiosInstance.get<ApiResponse<{
      data: Promotion[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>(
      `/admin/promotions?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Get promotion statistics
   */
  getPromotionStats: async (): Promise<ApiResponse<PromotionStats>> => {
    const response = await axiosInstance.get<ApiResponse<PromotionStats>>(
      '/admin/promotions/stats'
    );
    return response.data;
  },

  /**
   * Admin: Get promotion by ID
   */
  getPromotionById: async (id: string): Promise<ApiResponse<Promotion>> => {
    const response = await axiosInstance.get<ApiResponse<Promotion>>(
      `/admin/promotions/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Update promotion
   */
  updatePromotion: async (id: string, promotion: UpdatePromotionDto): Promise<ApiResponse<Promotion>> => {
    const response = await axiosInstance.put<ApiResponse<Promotion>>(
      `/admin/promotions/${id}`,
      promotion
    );
    return response.data;
  },

  /**
   * Admin: Delete promotion
   */
  deletePromotion: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/admin/promotions/${id}`
    );
    return response.data;
  },

  /**
   * Public: Validate promotion code
   */
  validatePromotionCode: async (
    code: string,
    userId?: string,
    orderAmount?: number
  ): Promise<ApiResponse<PromotionValidationResult>> => {
    const response = await axiosInstance.post<ApiResponse<PromotionValidationResult>>(
      '/promotions/validate',
      {
        code,
        userId,
        orderAmount,
      }
    );
    return response.data;
  },
};

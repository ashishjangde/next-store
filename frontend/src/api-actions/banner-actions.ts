import { axiosInstance } from "@/hooks/custom-axios-interceptor";

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    email: string;
    username?: string;
  };
}

export interface BannerCreateInput {
  title: string;
  description?: string;
  image: File;
  is_active?: boolean;
  sort_order?: number;
}

export interface BannerUpdateInput {
  title?: string;
  description?: string;
  image?: File;
  is_active?: boolean;
  sort_order?: number;
}

export interface BannerListResponse {
  banners: Banner[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const BannerActions = {
  /**
   * Get all banners (admin only)
   */
  getBanners: async (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<ApiResponse<BannerListResponse>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());

    const queryString = searchParams.toString();
    const url = `/banners${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get<ApiResponse<BannerListResponse>>(url);
    return response.data;
  },

  /**
   * Get a specific banner by ID (admin only)
   */
  getBannerById: async (id: string): Promise<ApiResponse<Banner>> => {
    const response = await axiosInstance.get<ApiResponse<Banner>>(`/banners/${id}`);
    return response.data;
  },

  /**
   * Create a new banner (admin only)
   */
  createBanner: async (bannerData: BannerCreateInput): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    
    formData.append('title', bannerData.title);
    if (bannerData.description) {
      formData.append('description', bannerData.description);
    }
    formData.append('image', bannerData.image);
    if (bannerData.is_active !== undefined) {
      formData.append('is_active', bannerData.is_active.toString());
    }
    if (bannerData.sort_order !== undefined) {
      formData.append('sort_order', bannerData.sort_order.toString());
    }

    const response = await axiosInstance.post<ApiResponse<Banner>>(
      '/banners',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Update an existing banner (admin only)
   */
  updateBanner: async (
    id: string,
    bannerData: BannerUpdateInput
  ): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    
    if (bannerData.title) {
      formData.append('title', bannerData.title);
    }
    if (bannerData.description !== undefined) {
      formData.append('description', bannerData.description);
    }
    if (bannerData.image) {
      formData.append('image', bannerData.image);
    }
    if (bannerData.is_active !== undefined) {
      formData.append('is_active', bannerData.is_active.toString());
    }
    if (bannerData.sort_order !== undefined) {
      formData.append('sort_order', bannerData.sort_order.toString());
    }

    const response = await axiosInstance.put<ApiResponse<Banner>>(
      `/banners/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a banner (admin only)
   */
  deleteBanner: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/banners/${id}`);
    return response.data;
  },

  /**
   * Get active banners for public display
   */
  getActiveBanners: async (): Promise<ApiResponse<Banner[]>> => {
    const response = await axiosInstance.get<ApiResponse<Banner[]>>('/ui/banners');
    return response.data;
  },
};

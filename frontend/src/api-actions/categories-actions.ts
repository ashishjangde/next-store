import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { CreateCategoryInput, UpdateCategoryInput } from "@/schema/categories-schema";

export const CategoryActions = {
  // Create a new category
  createCategory: async (
    categoryData: CreateCategoryInput,
    cookies?: string
  ): Promise<ApiResponse<ICategory>> => {
    const formData = new FormData();
    
    // Process form data similar to registerUser in auth-actions
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosInstance.post<ApiResponse<ICategory>>(
      "/categories",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(cookies ? { Cookie: cookies } : {}),
        },
      }
    );
    return response.data;
  },

  // Get all categories
  getAllCategories: async (
    options?: {
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    cookies?: string
  ): Promise<ApiResponse<ICategoriesResponse>> => {
    const params = new URLSearchParams();
    
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const url = `/categories${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await axiosInstance.get<ApiResponse<ICategoriesResponse>>(
      url,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Get featured categories
  getFeaturedCategories: async (
    cookies?: string
  ): Promise<ApiResponse<ICategory[]>> => {
    const response = await axiosInstance.get<ApiResponse<ICategory[]>>(
      "/categories/featured",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (
    categoryId: string,
    cookies?: string
  ): Promise<ApiResponse<ICategory>> => {
    const response = await axiosInstance.get<ApiResponse<ICategory>>(
      `/categories/${categoryId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (
    slug: string,
    cookies?: string
  ): Promise<ApiResponse<ICategory>> => {
    const response = await axiosInstance.get<ApiResponse<ICategory>>(
      `/categories/slug/${slug}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Update category by ID
  updateCategory: async (
    categoryId: string,
    categoryData: UpdateCategoryInput,
    cookies?: string
  ): Promise<ApiResponse<ICategory>> => {
    const formData = new FormData();
    
    // Process form data for update
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosInstance.put<ApiResponse<ICategory>>(
      `/categories/${categoryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(cookies ? { Cookie: cookies } : {}),
        },
      }
    );
    return response.data;
  },

  // Delete category by ID
  deleteCategory: async (
    categoryId: string,
    cookies?: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/categories/${categoryId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
};

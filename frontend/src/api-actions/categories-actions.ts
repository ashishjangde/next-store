import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { categoryCreateSchema, categoryUpdateSchema } from "@/schema/categories-schema";
import { z } from "zod";

// Type inference for form data
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export const CategoryActions = {
  /**
   * Get active root categories
   * Returns only active root level categories (level 0)
   * 
   * @param includeProducts Whether to include product IDs in the response
   * @param includeAttributes Whether to include category attributes in the response
   * @param cookies Optional cookies for server-side requests
   */
  getRootCategories: async (
    includeProducts = false, 
    includeAttributes = false,
    cookies?: string
  ): Promise<ApiResponse<Category[]>> => {
    const params = new URLSearchParams();
    if (includeProducts) params.append('includeProducts', 'true');
    if (includeAttributes) params.append('includeAttributes', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      `/categories/root?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Get all root categories (including inactive)
   * Admin only endpoint to get all root level categories
   * 
   * @param includeProducts Whether to include products in the response
   * @param includeAttributes Whether to include category attributes in the response
   * @param cookies Optional cookies for server-side requests
   */
  adminGetRootCategories: async (
    includeProducts = false,
    includeAttributes = false,
    cookies?: string
  ): Promise<ApiResponse<Category[]>> => {
    const params = new URLSearchParams();
    if (includeProducts) params.append('includeProducts', 'true');
    if (includeAttributes) params.append('includeAttributes', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      `/categories/admin/root?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get category by slug
   * Fetch a specific category by its URL-friendly slug
   * 
   * @param slug The URL-friendly slug of the category
   * @param includeProducts Whether to include product IDs in the response
   * @param includeAttributes Whether to include category attributes in the response
   * @param cookies Optional cookies for server-side requests
   */
  getCategoryBySlug: async (
    slug: string, 
    includeProducts = false, 
    includeAttributes = false,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    const params = new URLSearchParams();
    if (includeProducts) params.append('includeProducts', 'true');
    if (includeAttributes) params.append('includeAttributes', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/slug/${slug}?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get category by ID
   * Fetch an active category by its ID
   * 
   * @param id The ID of the category to fetch
   * @param includeProducts Whether to include products in the response
   * @param includeAttributes Whether to include attributes in the response
   * @param cookies Optional cookies for server-side requests
   */
  getCategoryById: async (
    id: string,
    includeProducts = false,
    includeAttributes = false,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    const params = new URLSearchParams();
    if (includeProducts) params.append('includeProducts', 'true');
    if (includeAttributes) params.append('includeAttributes', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/${id}?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Get category by ID (including inactive)
   * Fetch any category by its ID (admin access)
   * 
   * @param id The ID of the category to fetch
   * @param includeProducts Whether to include products in the response
   * @param includeAttributes Whether to include attributes in the response
   * @param cookies Optional cookies for server-side requests
   */
  adminGetCategoryById: async (
    id: string,
    includeProducts = false,
    includeAttributes = false,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    const params = new URLSearchParams();
    if (includeProducts) params.append('includeProducts', 'true');
    if (includeAttributes) params.append('includeAttributes', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/admin/${id}?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Create a new category
   * Creates a category with file upload support for image
   * 
   * @param categoryData The category data to create
   * @param cookies Optional cookies for server-side requests
   */
  createCategory: async (
    categoryData: any, 
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    let formData: FormData;
    
    // If categoryData is already FormData, use it directly
    if (categoryData instanceof FormData) {
      formData = categoryData;
    } else {
      // Otherwise create a new FormData instance
      formData = new FormData();
      
      // Add regular fields to FormData
      Object.entries(categoryData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        if (value instanceof File) {
          // Add file to FormData
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          // Convert booleans to strings
          formData.append(key, value.toString());
        } else {
          // Add other fields as is
          formData.append(key, value as string);
        }
      });
    }

    try {
      const response = await axiosInstance.post<ApiResponse<Category>>(
        '/categories', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(cookies ? { Cookie: cookies } : {})
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Category creation error:", error.response?.data);
      throw error;
    }
  },

  /**
   * ADMIN: Update an existing category
   * Updates a category with file upload support for image
   * 
   * @param id The ID of the category to update
   * @param categoryData The category data to update
   * @param cookies Optional cookies for server-side requests
   */
  updateCategory: async (
    id: string, 
    categoryData: CategoryUpdateInput,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    console.log("API calling updateCategory with:", categoryData);
    const formData = new FormData();
    
    // Add regular fields to FormData
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (value instanceof File) {
        // Add file to FormData
        formData.append(key, value);
      } else if (typeof value === 'boolean') {
        // Convert booleans to strings
        formData.append(key, value.toString());
      } else {
        // Add other fields as is
        formData.append(key, value as string);
      }
    });

    // Log what we're sending to the API
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[key] = `File: ${value.name}`;
      } else {
        formDataEntries[key] = String(value);
      }
    });
    console.log("Sending form data to API:", formDataEntries);
    
    const response = await axiosInstance.put<ApiResponse<Category>>(
      `/categories/${id}`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(cookies ? { Cookie: cookies } : {})
        }
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Add attribute to category
   * Assigns an attribute to a level 2 category with optional required flag
   * 
   * @param categoryId ID of the level 2 category
   * @param attributeId ID of the attribute to add
   * @param required Whether the attribute is required for products in this category
   * @param cookies Optional cookies for server-side requests
   */
  addAttributeToCategory: async (
    categoryId: string, 
    attributeId: string, 
    required = false,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      `/categories/${categoryId}/attributes`, 
      {
        attributeId,
        required
      },
      {
        headers: cookies ? { Cookie: cookies } : {}
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Remove attribute from category
   * Removes an attribute from a category
   * 
   * @param categoryId ID of the category
   * @param attributeId ID of the attribute to remove
   * @param cookies Optional cookies for server-side requests
   */
  removeAttributeFromCategory: async (
    categoryId: string, 
    attributeId: string,
    cookies?: string
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.delete<ApiResponse<Category>>(
      `/categories/${categoryId}/attributes/${attributeId}`,
      {
        headers: cookies ? { Cookie: cookies } : {}
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Delete a category
   * Deletes a category and all its associations
   * 
   * @param categoryId ID of the category to delete
   * @param cookies Optional cookies for server-side requests
   */
  deleteCategory: async (
    categoryId: string,
    cookies?: string
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
        `/categories/${categoryId}`,
        {
          headers: cookies ? { Cookie: cookies } : {}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },


 
};

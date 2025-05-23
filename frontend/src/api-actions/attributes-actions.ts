import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { 
  attributeCreateSchema, 
  attributeUpdateSchema, 
  attributeValueCreateSchema 
} from "@/schema/attributes-schema";
import { z } from "zod";

// Type inference for form data
export type AttributeCreateInput = z.infer<typeof attributeCreateSchema>;
export type AttributeUpdateInput = z.infer<typeof attributeUpdateSchema>;
export type AttributeValueCreateInput = z.infer<typeof attributeValueCreateSchema>;

export const AttributeActions = {
  /**
   * Get all attributes with pagination and search
   * 
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @param search Optional search term to filter attributes by name
   * @param includeValues Whether to include attribute values in the response
   * @param cookies Optional cookies for server-side requests
   */
  getAllAttributes: async (
    page = 1, 
    limit = 10,
    search = '',
    includeValues = true,
    cookies?: string
  ): Promise<ApiResponse<AttributesListResponse>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (includeValues === false) params.append('includeValues', 'false');
    
    const response = await axiosInstance.get<ApiResponse<AttributesListResponse>>(
      `/attributes?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get attribute by ID
   * 
   * @param id The ID of the attribute to get
   * @param includeValues Whether to include attribute values in the response
   * @param cookies Optional cookies for server-side requests
   */
  getAttributeById: async (
    id: string,
    includeValues = true,
    cookies?: string
  ): Promise<ApiResponse<Attribute>> => {
    const params = new URLSearchParams();
    if (includeValues === false) params.append('includeValues', 'false');
    
    const response = await axiosInstance.get<ApiResponse<Attribute>>(
      `/attributes/${id}?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Create a new attribute
   * Admin only endpoint
   * 
   * @param attributeData The attribute data to create
   * @param cookies Optional cookies for server-side requests
   */
  createAttribute: async (
    attributeData: AttributeCreateInput,
    cookies?: string
  ): Promise<ApiResponse<Attribute>> => {
    const response = await axiosInstance.post<ApiResponse<Attribute>>(
      '/attributes',
      attributeData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Update an existing attribute
   * Admin only endpoint
   * 
   * @param id The ID of the attribute to update
   * @param attributeData The attribute data to update
   * @param cookies Optional cookies for server-side requests
   */
  updateAttribute: async (
    id: string,
    attributeData: AttributeUpdateInput,
    cookies?: string
  ): Promise<ApiResponse<Attribute>> => {
    const response = await axiosInstance.patch<ApiResponse<Attribute>>(
      `/attributes/${id}`,
      attributeData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Delete an attribute
   * Admin only endpoint - Deletes an attribute and removes it from all categories and products
   * 
   * @param id The ID of the attribute to delete
   * @param cookies Optional cookies for server-side requests
   */
  deleteAttribute: async (
    id: string,
    cookies?: string
  ): Promise<ApiResponse<{ success: boolean, deleted: { attribute: string, productCount: number, categoryCount: number } }>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<{ 
        success: boolean,
        deleted: {
          attribute: string,
          productCount: number,
          categoryCount: number
        }
      }>>(
        `/attributes/${id}`,
        {
          headers: cookies ? { Cookie: cookies } : {},
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting attribute:", error);
      throw error;
    }
  },

  /**
   * Get attribute values
   * 
   * @param attributeId The ID of the attribute
   * @param cookies Optional cookies for server-side requests
   */
  getAttributeValues: async (
    attributeId: string,
    cookies?: string
  ): Promise<ApiResponse<AttributeValue[]>> => {
    const response = await axiosInstance.get<ApiResponse<AttributeValue[]>>(
      `/attributes/${attributeId}/values`,
      {
        headers: cookies ? { Cookie: cookies } : {}
      }
    );
    return response.data;
  },

  /**
   * Add a value to an attribute
   * Admin only endpoint
   * 
   * @param attributeId The ID of the attribute
   * @param valueData The value data to add
   * @param cookies Optional cookies for server-side requests
   */
  addAttributeValue: async (
    attributeId: string,
    valueData: AttributeValueCreateInput,
    cookies?: string
  ): Promise<ApiResponse<AttributeValue>> => {
    const response = await axiosInstance.post<ApiResponse<AttributeValue>>(
      `/attributes/${attributeId}/values`,
      valueData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Delete an attribute value
   * Admin only endpoint
   * 
   * @param valueId The ID of the attribute value to delete
   * @param cookies Optional cookies for server-side requests
   */
  deleteAttributeValue: async (
    valueId: string,
    cookies?: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ success: boolean }>>(
      `/attributes/values/${valueId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
  
  /**
   * Debug attribute structure
   * Only for development and debugging purposes
   * 
   * @param id The ID of the attribute
   * @param cookies Optional cookies for server-side requests
   */
  debugAttribute: async (
    id: string,
    cookies?: string
  ): Promise<any> => {
    const response = await axiosInstance.get<any>(
      `/attributes/debug/${id}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  }
};

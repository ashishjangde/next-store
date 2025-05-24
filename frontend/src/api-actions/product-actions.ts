import { axiosInstance } from "@/hooks/custom-axios-interceptor";

export const ProductActions = {
  /**
   * Create a new product
   * @param productData Product data with images
   * @param cookies Optional cookies for server-side requests
   * @returns The created product
   */
  createProduct: async (
    productData: ProductCreateInput,
    cookies?: string
  ): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    
    // Add all product fields to form data
    Object.entries(productData).forEach(([key, value]) => {
      if (value instanceof File || (Array.isArray(value) && value.every(item => item instanceof File))) {
        // Handle single file or array of files
        if (Array.isArray(value)) {
          value.forEach(file => {
            formData.append('images', file);
          });
        } else {
          formData.append(key, value);
        }
      } else if (Array.isArray(value)) {
        // Handle arrays of primitive values
        value.forEach(item => {
          formData.append(`${key}[]`, item?.toString() || '');
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosInstance.post<ApiResponse<Product>>(
      "/products", 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(cookies ? { Cookie: cookies } : {}),
        },
      }
    );
    
    return response.data;
  },

  /**
   * Get all products with pagination and optional filtering
   * @param params Search and filtering parameters
   * @param cookies Optional cookies for server-side requests
   * @returns List of products with pagination info
   */
  getAllProducts: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category_id?: string;
      vendor_id?: string;
      product_type?: ProductTypeEnum;
    } = {},
    cookies?: string
  ): Promise<ApiResponse<ProductListResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params.product_type) queryParams.append('product_type', params.product_type);
    
    const response = await axiosInstance.get<ApiResponse<ProductListResponse>>(
      `/products?${queryParams.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },

  /**
   * Get a product by ID or slug
   * @param idOrSlug Product ID or slug
   * @param includeOptions Additional data to include
   * @param cookies Optional cookies for server-side requests
   * @returns The requested product
   */
  getProductById: async (
    idOrSlug: string,
    includeOptions: {
      include_category?: boolean;
      include_attributes?: boolean;
      include_children?: boolean;
    } = {},
    cookies?: string
  ): Promise<ApiResponse<Product>> => {
    const queryParams = new URLSearchParams();
    
    if (includeOptions.include_category) queryParams.append('include_category', 'true');
    if (includeOptions.include_attributes) queryParams.append('include_attributes', 'true');
    if (includeOptions.include_children) queryParams.append('include_children', 'true');
    
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/products/${idOrSlug}?${queryParams.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },

  /**
   * Update an existing product
   * @param id Product ID
   * @param productData Updated product data
   * @param cookies Optional cookies for server-side requests
   * @returns The updated product
   */
  updateProduct: async (
    id: string,
    productData: ProductUpdateInput,
    cookies?: string
  ): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    
    // Add all product fields to form data
    Object.entries(productData).forEach(([key, value]) => {
      if (value instanceof File || (Array.isArray(value) && value.every(item => item instanceof File))) {
        // Handle single file or array of files
        if (Array.isArray(value)) {
          value.forEach(file => {
            formData.append('images', file);
          });
        } else {
          formData.append(key, value);
        }
      } else if (Array.isArray(value)) {
        // Handle arrays of primitive values
        value.forEach(item => {
          formData.append(`${key}[]`, item?.toString() || '');
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosInstance.put<ApiResponse<Product>>(
      `/products/${id}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(cookies ? { Cookie: cookies } : {}),
        },
      }
    );
    
    return response.data;
  },

  /**
   * Delete a product
   * @param id Product ID
   * @param cookies Optional cookies for server-side requests
   * @returns Success message
   */
  deleteProduct: async (
    id: string,
    cookies?: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/products/${id}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },

  /**
   * Add an attribute to a product
   * @param productId Product ID
   * @param attributeValueId Attribute value ID
   * @param cookies Optional cookies for server-side requests
   * @returns Updated product
   */
  addAttributeToProduct: async (
    productId: string,
    attributeValueId: string,
    cookies?: string
  ): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      `/products/${productId}/attributes`,
      { attributeValueId },
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },

  /**
   * Remove an attribute from a product
   * @param productId Product ID
   * @param attributeValueId Attribute value ID
   * @param cookies Optional cookies for server-side requests
   * @returns Updated product
   */
  removeAttributeFromProduct: async (
    productId: string,
    attributeValueId: string,
    cookies?: string
  ): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.delete<ApiResponse<Product>>(
      `/products/${productId}/attributes/${attributeValueId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  }
};
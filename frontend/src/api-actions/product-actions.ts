import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import { Product, ProductCreateInput, ProductUpdateInput } from "@/types/product";
import { ProductListResponse, ProductTypeEnum } from "@/types/product";


export const ProductActions = {
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


  getProductBySlug: async (
    slug: string,
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
      `/products/slug/${slug}?${queryParams.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },


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
  },

  getVendorParentProducts: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category_id?: string;
      include_category?: boolean;
      include_attributes?: boolean;
      include_children?: boolean;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    } = {},
    cookies?: string
  ): Promise<ApiResponse<ProductListResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.include_category) queryParams.append('include_category', 'true');
    if (params.include_attributes) queryParams.append('include_attributes', 'true');
    if (params.include_children) queryParams.append('include_children', 'true');
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const response = await axiosInstance.get<ApiResponse<ProductListResponse>>(
      `/products/vendor/parent?${queryParams.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  },

  getVendorProductById: async (
    id: string,
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
      `/products/vendor/${id}?${queryParams.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    
    return response.data;
  }
};
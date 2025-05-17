import { axiosInstance } from "@/hooks/custom-axios-interceptor";



interface VendorsResponse {
  vendors: (IVendor & { User: IUser })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  suspendedCount: number;
}

export const VendorActions = {
  // Register as a vendor
  registerAsVendor: async (
    vendorData: ICreateVendor,
    cookies?: string
  ): Promise<ApiResponse<IVendor>> => {
    const response = await axiosInstance.post<ApiResponse<IVendor>>(
      "/vendor",
      vendorData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
  
  // Get all vendors (admin only)
  getAllVendors: async (
    options?: {
      search?: string;
      page?: number;
      limit?: number;
      status?: VendorStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    cookies?: string
  ): Promise<ApiResponse<VendorsResponse>> => {
    const params = new URLSearchParams();
    
    // Filter out Next.js internal parameters and ensure proper encoding
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    // Construct the URL with the sanitized params
    const url = `/vendor${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('API Request URL:', url); // For debugging
    
    const response = await axiosInstance.get<ApiResponse<VendorsResponse>>(
      url,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Get current vendor profile
  getVendorProfile: async (
    cookies?: string
  ): Promise<ApiResponse<IVendor>> => {
    console.log('calling getVendorProfile');
    const response = await axiosInstance.get<ApiResponse<IVendor>>(
      "/vendor/profile",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Update current vendor profile
  updateVendorProfile: async (
    vendorData: IUpdateVendor,
    cookies?: string
  ): Promise<ApiResponse<IVendor>> => {
    const response = await axiosInstance.put<ApiResponse<IVendor>>(
      "/vendor/profile",
      vendorData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
  // Get vendor by ID (admin only)
  getVendorById: async (
    vendorId: string,
    cookies?: string
  ): Promise<ApiResponse<IVendor>> => {
    const response = await axiosInstance.get<ApiResponse<IVendor>>(
      `/vendor/${vendorId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
  // Delete vendor by ID (admin only)
  deleteVendorById: async (
    vendorId: string,
    cookies?: string
  ): Promise<
    ApiResponse<{
      message: string;
    }>
  > => {
    const response = await axiosInstance.delete<
      ApiResponse<{
        message: string;
      }>
    >(`/vendor/${vendorId}`, {
      headers: cookies ? { Cookie: cookies } : {},
    });
    return response.data;
  },

  // Update vendor status (approve or reject vendor application) (admin only)
  updateVendorStatus: async (
    vendorId: string,
    status: VendorStatus,
    cookies?: string
  ): Promise<ApiResponse<IVendor>> => {
    const response = await axiosInstance.put<ApiResponse<IVendor>>(
      `/vendor/${vendorId}/status`,
      { status },
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
};

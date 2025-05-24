import { axiosInstance } from "@/hooks/custom-axios-interceptor";

export const InventoryActions = {
  /**
   * Get inventories for all products belonging to the authenticated vendor
   * @param cookies Optional cookies for server-side requests
   * @returns Array of inventory items with product details
   */
  getVendorInventories: async (
    cookies?: string
  ): Promise<ApiResponse<Inventory[]>> => {
    const response = await axiosInstance.get<ApiResponse<Inventory[]>>(
      "/inventory/vendor",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get low stock products for the authenticated vendor
   * @param threshold Optional threshold value. If not provided, uses each product's own threshold
   * @param cookies Optional cookies for server-side requests
   * @returns Array of low stock products
   */
  getLowStockProducts: async (
    threshold?: number,
    cookies?: string
  ): Promise<ApiResponse<LowStockProduct[]>> => {
    const params = new URLSearchParams();
    if (threshold !== undefined) params.append('threshold', threshold.toString());
    
    const response = await axiosInstance.get<ApiResponse<LowStockProduct[]>>(
      `/inventory/low-stock?${params.toString()}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Get inventory for a specific product
   * @param productId The ID of the product to get inventory for
   * @param cookies Optional cookies for server-side requests
   * @returns Inventory data for the specified product
   */
  getProductInventory: async (
    productId: string,
    cookies?: string
  ): Promise<ApiResponse<Inventory>> => {
    const response = await axiosInstance.get<ApiResponse<Inventory>>(
      `/inventory/${productId}`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Update inventory for a specific product
   * @param productId The ID of the product to update inventory for
   * @param inventoryData The inventory data to update
   * @param cookies Optional cookies for server-side requests
   * @returns Updated inventory data
   */
  updateProductInventory: async (
    productId: string,
    inventoryData: InventoryUpdate,
    cookies?: string
  ): Promise<ApiResponse<Inventory>> => {
    const response = await axiosInstance.put<ApiResponse<Inventory>>(
      `/inventory/${productId}`,
      inventoryData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  /**
   * Update inventory for multiple product variants
   * @param parentProductId The ID of the parent product
   * @param updateData The inventory update data for multiple variants
   * @param cookies Optional cookies for server-side requests
   * @returns Updated inventory data for all variants
   */
  updateVariantInventories: async (
    parentProductId: string,
    updateData: VariationInventoryUpdate,
    cookies?: string
  ): Promise<ApiResponse<VariationInventoryResponse>> => {
    const response = await axiosInstance.put<ApiResponse<VariationInventoryResponse>>(
      `/inventory/parent/${parentProductId}/variants`,
      updateData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  }
};
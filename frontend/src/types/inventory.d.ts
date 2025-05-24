
/**
 * Basic product information for inventory-related responses
 */
interface ProductBasicInfo {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  price: number;
  images?: string[];
}

/**
 * Inventory data for a single product
 */
interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  reserved_quantity: number;
  last_updated: Date;
  Product?: ProductBasicInfo;
}

/**
 * Inventory update data for a single product
 */
interface InventoryUpdate {
  quantity: number;
  low_stock_threshold?: number;
  reserved_quantity?: number;
}

/**
 * Inventory update data for a product variant
 */
interface VariantInventoryItem {
  variantId: string;
  inventory: InventoryUpdate;
}

/**
 * Inventory update data for multiple product variants
 */
interface VariationInventoryUpdate {
  variants: VariantInventoryItem[];
}

/**
 * Response data for a variation inventory update
 */
interface VariationInventoryResponse {
  parent_id: string;
  parent_title: string;
  variants: Inventory[];
  total_updated: number;
}

/**
 * Low stock product data
 */
interface LowStockProduct {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  reserved_quantity: number;
  Product: ProductBasicInfo;
}

/**
 * Low stock variation data
 */
interface LowStockVariation {
  parent_id: string;
  parent_title: string;
  variants: LowStockProduct[];
}
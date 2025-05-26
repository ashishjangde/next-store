/**
 * Product types as defined in the database schema
 */
export type ProductTypeEnum = 'PARENT' | 'VARIANT';

/**
 * Basic product interface
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  slug: string;
  sku?: string;
  price: number;
  images?: string[];
  parent_id?: string;
  brand?: string;
  season?: string;
  weight?: number;
  is_active: boolean;
  product_type: ProductTypeEnum;
  created_at: Date;
  updated_at: Date;
  vendor_id: string;
  category?: Category;
  parent?: Product;
  children?: Product[];
  attributes?: {
    id: string;
    name: string;
    value: string;
    display_value?: string;
  }[];
  inventory?: {
    quantity: number;
    low_stock_threshold: number;
    reserved_quantity: number;
  };
}

/**
 * Product create input data
 */
export interface ProductCreateInput {
  title: string;
  description: string;
  slug?: string;
  sku?: string;
  price: number;
  images?: File[];
  parent_id?: string;
  brand?: string;
  season?: string;
  weight?: number;
  is_active?: boolean;
  category_id: string;
  initial_quantity?: number;
  low_stock_threshold?: number;
  attribute_value_ids?: string[];
}

/**
 * Product update input data - all fields are optional
 */
export interface ProductUpdateInput extends Partial<Omit<ProductCreateInput, 'images'>> {
  images?: string[] | File[];
}

/**
 * Product list response with pagination
 */
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  query?: string;
  filters?: any;
}
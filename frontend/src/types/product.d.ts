/**
 * Product types as defined in the database schema
 */
type ProductTypeEnum = 'PARENT' | 'VARIANT';

/**
 * Basic product interface
 */
interface Product {
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
  category_id: string;
  product_type: ProductTypeEnum;
  created_at: Date;
  updated_at: Date;
  vendor_id: string;
  category?: Category;
  parent?: Product;
  children?: Product[];
  ProductAttribute?: ProductAttribute[];
}

/**
 * Product attribute relationship
 */
interface ProductAttribute {
  product_id: string;
  attribute_value_id: string;
  AttributeValue?: {
    id: string;
    attribute_id: string;
    value: string;
    display_value?: string;
    Attribute?: Attribute;
  }
}

/**
 * Product create input data
 */
interface ProductCreateInput {
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
interface ProductUpdateInput extends Partial<ProductCreateInput> {}

/**
 * Product list response with pagination
 */
interface ProductListResponse {
  products: Product[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
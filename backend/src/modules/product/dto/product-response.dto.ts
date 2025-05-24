import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductType } from '@prisma/client';

class CategoryInfo {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category slug' })
  slug: string;
}

class InventoryInfo {
  @ApiProperty({ description: 'Quantity in stock' })
  quantity: number;

  @ApiProperty({ description: 'Low stock threshold' })
  low_stock_threshold: number;

  @ApiProperty({ description: 'Reserved quantity' })
  reserved_quantity: number;
}

class AttributeInfo {
  @ApiProperty({ description: 'Attribute ID' })
  id: string;

  @ApiProperty({ description: 'Attribute name' })
  name: string;

  @ApiProperty({ description: 'Attribute value' })
  value: string;

  @ApiPropertyOptional({ description: 'Attribute display value' })
  display_value?: string;
}

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product title' })
  title: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  sku?: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Product images', type: [String] })
  images: string[];

  @ApiProperty({ description: 'Product type', enum: ProductType })
  product_type: ProductType;

  @ApiPropertyOptional({ description: 'Parent product ID (for variants)' })
  parent_id?: string;

  @ApiPropertyOptional({ description: 'Product brand' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Product season' })
  season?: string;

  @ApiPropertyOptional({ description: 'Product weight in grams' })
  weight?: number;

  @ApiProperty({ description: 'Whether the product is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether the product is archived' })
  archived: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiPropertyOptional({ description: 'Category information', type: CategoryInfo })
  @Type(() => CategoryInfo)
  category?: CategoryInfo;

  @ApiPropertyOptional({ description: 'Inventory information', type: InventoryInfo })
  @Type(() => InventoryInfo)
  inventory?: InventoryInfo;

  @ApiPropertyOptional({ description: 'Product attributes', type: [AttributeInfo] })
  @Type(() => AttributeInfo)
  attributes?: AttributeInfo[];

  @ApiPropertyOptional({ description: 'Child products (variants)', type: [ProductResponseDto] })
  @Type(() => ProductResponseDto)
  children?: ProductResponseDto[];

  @ApiPropertyOptional({ description: 'Parent product (for variants)', type: ProductResponseDto })
  @Type(() => ProductResponseDto)
  parent?: ProductResponseDto;

  @ApiPropertyOptional({ description: 'Sibling products (other variants of the same parent)', type: [ProductResponseDto] })
  @Type(() => ProductResponseDto)
  siblings?: ProductResponseDto[];
}

export { ProductListResponseDto } from './product-list-response.dto';
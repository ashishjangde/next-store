import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoryResponseDto } from 'src/modules/category/dto/category-response-dto';
import { InventoryResponseDto } from 'src/modules/inventory/dto/inventory-response.dto';
import { ProductVariationResponseDto } from './product-variation-response.dto';

export class VendorDto {
  @ApiProperty({ description: 'The unique identifier of the vendor' })
  id: string;

  @ApiProperty({ description: 'The name of the shop' })
  shop_name: string;

  @ApiPropertyOptional({ description: 'User details of the vendor' })
  User?: {
    id: string;
    name: string;
    profile_picture?: string;
  };
}

export class ProductAttributeValueDto {
  @ApiProperty({ description: 'The attribute value ID' })
  attribute_value_id: string;

  @ApiProperty({ description: 'The attribute value details' })
  attributeValue: {
    id: string;
    value: string;
    display_value?: string;
    attribute: {
      id: string;
      name: string;
      type: string;
    }
  };
}

export class ProductResponseDto {
  @ApiProperty({ description: 'The unique identifier of the product' })
  id: string;

  @ApiProperty({ description: 'The title of the product' })
  title: string;

  @ApiProperty({ description: 'The description of the product' })
  description: string;

  @ApiPropertyOptional({ description: 'The Stock Keeping Unit code' })
  sku?: string;

  @ApiProperty({ description: 'The price of the product' })
  price: number;

  @ApiProperty({ description: 'The ID of the vendor who sells this product' })
  vendor_id: string;

  @ApiProperty({ description: 'The URLs of the product images' })
  images: string[];

  @ApiPropertyOptional({ description: 'The brand of the product' })
  brand?: string;

  @ApiPropertyOptional({ description: 'The intended gender for the product' })
  gender?: string;

  @ApiPropertyOptional({ description: 'The season the product is suitable for' })
  season?: string;

  @ApiPropertyOptional({ description: 'The weight of the product in grams' })
  weight?: number;

  @ApiPropertyOptional({ description: 'The primary color name' })
  color_name?: string;

  @ApiPropertyOptional({ description: 'The color family for filtering' })
  color_family?: string;

  @ApiProperty({ description: 'Whether the product is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether the product is archived' })
  archived: boolean;

  @ApiPropertyOptional({ description: 'The date when the product was archived' })
  archived_at?: Date;

  @ApiPropertyOptional({ description: 'The ID of the category this product belongs to' })
  category_id?: string;

  @ApiPropertyOptional({ 
    description: 'The category this product belongs to',
    type: () => CategoryResponseDto
  })
  @Type(() => CategoryResponseDto)
  category?: CategoryResponseDto;

  @ApiPropertyOptional({ 
    description: 'The vendor who sells this product',
    type: () => VendorDto
  })
  @Type(() => VendorDto)
  Vendor?: VendorDto;

  @ApiPropertyOptional({ 
    description: 'The variations of this product',
    type: () => [ProductVariationResponseDto]
  })
  @Type(() => ProductVariationResponseDto)
  Variations?: ProductVariationResponseDto[];

  @ApiPropertyOptional({ 
    description: 'The inventory of this product',
    type: () => InventoryResponseDto
  })
  @Type(() => InventoryResponseDto)
  Inventory?: InventoryResponseDto;

  @ApiPropertyOptional({ 
    description: 'The attribute values assigned to this product',
    type: () => [ProductAttributeValueDto]
  })
  @Type(() => ProductAttributeValueDto)
  attributeValues?: ProductAttributeValueDto[];

  @ApiProperty({ description: 'The creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updated_at?: Date;
}

export class ProductListResponseDto {
  @ApiProperty({ description: 'Array of products', type: [ProductResponseDto] })
  @Type(() => ProductResponseDto)
  data: ProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;
}

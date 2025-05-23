import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class ProductCreateDto {
  @ApiProperty({ example: 'Mens Cotton T-Shirt' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Comfortable cotton t-shirt for everyday wear' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'mens-cotton-t-shirt' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'TCT001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'vendor-uuid' })
  @IsString()
  @IsUUID()
  vendor_id: string;

  @ApiPropertyOptional({ example: ['image1.jpg', 'image2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ enum: ProductType, example: ProductType.PARENT })
  @IsOptional()
  @IsEnum(ProductType)
  product_type?: ProductType;

  @ApiPropertyOptional({ example: 'parent-product-uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ example: 'Nike' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Summer' })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ example: 250.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ example: 100, description: 'Initial inventory quantity' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  initial_quantity?: number;

  @ApiPropertyOptional({ example: 10, description: 'Low stock threshold for alerts' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ example: ['attr-value-1', 'attr-value-2'], description: 'Array of attribute value IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attribute_value_ids?: string[];
}

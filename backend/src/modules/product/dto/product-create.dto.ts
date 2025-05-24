import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class ProductCreateDto {  @ApiProperty({ example: 'Mens Cotton T-Shirt' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: 'Comfortable cotton t-shirt for everyday wear' })
  @IsString({ message: 'Description must be a string' })
  description: string;
  @ApiPropertyOptional({ example: 'mens-cotton-t-shirt', description: 'Automatically generated from title if not provided' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'TCT001' })
  @IsOptional()
  @IsString()
  sku?: string;  
  @ApiProperty({ example: 29.99 })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: ['image1.jpg', 'image2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

 

  @ApiPropertyOptional({ example: 'parent-product-uuid' })
  @IsOptional()
  @IsString()
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
    @ApiProperty({ example: 'category-uuid', required: true })
  @IsString({ message: 'Category ID must be a valid string' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  category_id: string;

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsUrl, Min, MaxLength, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class VariantDimensionsDto {
  @ApiProperty({ description: 'Variant length in cm' })
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty({ description: 'Variant width in cm' })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ description: 'Variant height in cm' })
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({ description: 'Variant weight in grams' })
  @IsNumber()
  @Min(0)
  weight: number;
}

export class ProductVariantCreateDto {
  @ApiProperty({ description: 'Variant name', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Variant description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Variant short description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  short_description?: string;

  @ApiProperty({ description: 'Variant SKU', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  sku: string;

  @ApiProperty({ description: 'Variant price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Variant compare price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compare_price?: number;

  @ApiPropertyOptional({ description: 'Variant cost price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @ApiProperty({ description: 'Variant stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @ApiPropertyOptional({ description: 'Variant low stock threshold', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  low_stock_threshold?: number;

  @ApiProperty({ description: 'Parent product ID' })
  @IsNotEmpty()
  @IsUUID()
  parent_id: string;

  @ApiPropertyOptional({ description: 'Variant images URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Variant thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Variant dimensions and weight' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantDimensionsDto)
  dimensions?: VariantDimensionsDto;

  @ApiPropertyOptional({ description: 'Variant meta title for SEO' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  meta_title?: string;

  @ApiPropertyOptional({ description: 'Variant meta description for SEO' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Variant tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Track inventory', default: true })
  @IsOptional()
  track_inventory?: boolean;

  @ApiPropertyOptional({ description: 'Allow backorders', default: false })
  @IsOptional()
  allow_backorders?: boolean;

  @ApiProperty({ description: 'Attribute value IDs to assign to variant' })
  @IsNotEmpty()
  @IsArray()
  @IsUUID(undefined, { each: true })
  attribute_value_ids: string[];
}

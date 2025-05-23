import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsUrl, Min, MaxLength, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '@prisma/client';

class VariantDimensionsUpdateDto {
  @ApiPropertyOptional({ description: 'Variant length in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ description: 'Variant width in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ description: 'Variant height in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ description: 'Variant weight in grams' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class ProductVariantUpdateDto {
  @ApiPropertyOptional({ description: 'Variant name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Variant description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Variant short description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  short_description?: string;

  @ApiPropertyOptional({ description: 'Variant SKU', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Variant price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

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

  @ApiPropertyOptional({ description: 'Variant stock quantity', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @ApiPropertyOptional({ description: 'Variant low stock threshold', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ description: 'Variant status', enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  status?: ProductType;

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
  @Type(() => VariantDimensionsUpdateDto)
  dimensions?: VariantDimensionsUpdateDto;

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

  @ApiPropertyOptional({ description: 'Track inventory' })
  @IsOptional()
  track_inventory?: boolean;

  @ApiPropertyOptional({ description: 'Allow backorders' })
  @IsOptional()
  allow_backorders?: boolean;
}

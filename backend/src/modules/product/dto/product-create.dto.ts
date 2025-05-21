import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductCreateDto {
  @ApiProperty({ description: 'The title of the product' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the product' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'The Stock Keeping Unit code' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'The brand of the product' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'The intended gender for the product', enum: ['Men\'s', 'Women\'s', 'Unisex', 'Kids'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'The season the product is suitable for', enum: ['Summer', 'Winter', 'Monsoon', 'All Season'] })
  @IsString()
  @IsOptional()
  season?: string;

  @ApiPropertyOptional({ description: 'The weight of the product in grams' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'The primary color name (e.g., "Navy Blue")' })
  @IsString()
  @IsOptional()
  color_name?: string;

  @ApiPropertyOptional({ description: 'The color family for filtering (e.g., "Blue")' })
  @IsString()
  @IsOptional()
  color_family?: string;

  @ApiPropertyOptional({ description: 'Whether the product is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'The ID of the category this product belongs to' })
  @IsUUID()
  category_id: string;

  @ApiPropertyOptional({ description: 'Array of attribute value IDs to assign to this product', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  attribute_value_ids?: string[];

  @ApiProperty({ description: 'The initial inventory quantity for this product' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'The low stock threshold for this product' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  low_stock_threshold?: number;
}

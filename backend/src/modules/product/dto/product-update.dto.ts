import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';

export class ProductUpdateDto {
  @ApiPropertyOptional({ description: 'The title of the product' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The description of the product' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'The Stock Keeping Unit code' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

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

  @ApiPropertyOptional({ description: 'The ID of the category this product belongs to' })
  @IsUUID()
  @IsOptional()
  category_id?: string;
}

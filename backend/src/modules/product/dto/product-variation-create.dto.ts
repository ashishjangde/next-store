import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class ProductVariationCreateDto {
  @ApiProperty({ description: 'The size of this variation' })
  @IsString()
  size: string;

  @ApiProperty({ description: 'The color of this variation' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ description: 'The Stock Keeping Unit code for this variation' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'The price modifier (can be positive or negative)' })
  @IsNumber()
  @IsOptional()
  price_mod?: number;

  @ApiProperty({ description: 'The initial inventory quantity for this variation' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'The low stock threshold for this variation' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  low_stock_threshold?: number;
}

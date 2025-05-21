import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VariationInventoryResponseDto } from 'src/modules/inventory/dto/inventory-response.dto';

export class ProductVariationResponseDto {
  @ApiProperty({ description: 'The unique identifier of the product variation' })
  id: string;

  @ApiProperty({ description: 'The ID of the product this variation belongs to' })
  product_id: string;

  @ApiProperty({ description: 'The size of this variation' })
  size: string;

  @ApiProperty({ description: 'The color of this variation' })
  color: string;

  @ApiPropertyOptional({ description: 'The Stock Keeping Unit code for this variation' })
  sku?: string;

  @ApiPropertyOptional({ description: 'The price modifier (can be positive or negative)' })
  price_mod?: number;

  @ApiProperty({ description: 'The URLs of the variation-specific images' })
  images: string[];

  @ApiPropertyOptional({ 
    description: 'The inventory of this variation',
    type: () => VariationInventoryResponseDto
  })
  @Type(() => VariationInventoryResponseDto)
  Inventory?: VariationInventoryResponseDto;
}

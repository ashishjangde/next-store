import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class InventoryUpdateDto {
  @ApiProperty({ description: 'The quantity in stock' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'The threshold for low stock alerts' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  low_stock_threshold?: number;
}

export class VariationInventoryUpdateDto {
  @ApiProperty({ description: 'The quantity in stock' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'The threshold for low stock alerts' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ description: 'The quantity currently reserved for orders' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reserved_quantity?: number;
}

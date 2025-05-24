import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsPositive, Min, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryUpdateDto {
  @ApiProperty({ description: 'Current stock quantity', example: 100 })
  @IsNumber()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Low stock threshold', example: 10 })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Low stock threshold must be positive' })
  low_stock_threshold?: number;

  @ApiPropertyOptional({ description: 'Reserved quantity (for pending orders)', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Reserved quantity cannot be negative' })
  reserved_quantity?: number;
}

export class VariantInventoryItemDto {
  @ApiProperty({ description: 'Variant product ID', example: '8f9dfe2e-a8c3-4ad7-b1f9-4e3a412e7890' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Inventory update data' })
  @ValidateNested()
  @Type(() => InventoryUpdateDto)
  inventory: InventoryUpdateDto;
}

export class VariationInventoryUpdateDto {
  @ApiProperty({ 
    description: 'Array of variant inventory updates',
    type: [VariantInventoryItemDto],
    minItems: 1
  })
  @ArrayMinSize(1, { message: 'At least one variant inventory must be provided' })
  @ValidateNested({ each: true })
  @Type(() => VariantInventoryItemDto)
  variants: VariantInventoryItemDto[];
}

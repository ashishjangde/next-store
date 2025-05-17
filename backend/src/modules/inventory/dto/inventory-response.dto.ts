import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductInfo {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Cotton T-Shirt'
  })
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 29.99
  })
  price: number;
}

export class InventoryResponseDto {
  @ApiProperty({
    description: 'Inventory ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  product_id: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 100
  })
  quantity: number;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2023-05-01T15:30:45.123Z'
  })
  last_updated: Date;

  @ApiProperty({
    description: 'Product details',
    type: ProductInfo
  })
  @Type(() => ProductInfo)
  Product: ProductInfo;
}

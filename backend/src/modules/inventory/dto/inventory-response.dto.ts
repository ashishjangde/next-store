import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ProductBasicInfoDto {
  @Expose()
  @ApiProperty({ example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Men\'s Cotton T-Shirt' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'mens-cotton-t-shirt' })
  slug: string;

  @Expose()
  @ApiPropertyOptional({ example: 'SKU12345' })
  sku?: string;

  @Expose()
  @ApiProperty({ example: 29.99 })
  price: number;
  
  @Expose()
  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  images?: string[];
}

@Exclude()
export class InventoryResponseDto {
  @Expose()
  @ApiProperty({ example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p' })
  id: string;

  @Expose()
  @ApiProperty({ example: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q' })
  product_id: string;

  @Expose()
  @ApiProperty({ example: 100 })
  quantity: number;

  @Expose()
  @ApiProperty({ example: 10 })
  low_stock_threshold: number;

  @Expose()
  @ApiProperty({ example: 5 })
  reserved_quantity: number;

  @Expose()
  @ApiProperty({ example: '2025-05-24T10:30:00.000Z' })
  last_updated: Date;

  @Expose()
  @ApiPropertyOptional()
  @Type(() => ProductBasicInfoDto)
  Product?: ProductBasicInfoDto;
}

@Exclude()
export class VariationInventoryResponseDto {
  @Expose()
  @ApiProperty({ example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p' })
  parent_id: string;

  @Expose()
  @ApiProperty({ example: 'Men\'s Cotton T-Shirt - Parent' })
  parent_title: string;

  @Expose()
  @ApiProperty({ type: [InventoryResponseDto] })
  @Type(() => InventoryResponseDto)
  variants: InventoryResponseDto[];

  @Expose()
  @ApiProperty({ example: 5 })
  total_updated: number;
}

@Exclude()
export class LowStockProductDto {
  @Expose()
  @ApiProperty({ example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p' })
  id: string;

  @Expose()
  @ApiProperty({ example: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q' })
  product_id: string;

  @Expose()
  @ApiProperty({ example: 5 })
  quantity: number;

  @Expose()
  @ApiProperty({ example: 10 })
  low_stock_threshold: number;

  @Expose()
  @ApiProperty({ example: 2 })
  reserved_quantity: number;

  @Expose()
  @ApiProperty()
  @Type(() => ProductBasicInfoDto)
  Product: ProductBasicInfoDto;
}

@Exclude()
export class LowStockVariationDto {
  @Expose()
  @ApiProperty({ example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p' })
  parent_id: string;

  @Expose()
  @ApiProperty({ example: 'Men\'s Cotton T-Shirt - Parent' })
  parent_title: string;

  @Expose()
  @ApiProperty({ type: [LowStockProductDto] })
  @Type(() => LowStockProductDto)
  variants: LowStockProductDto[];
}

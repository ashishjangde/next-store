import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty({ description: 'The unique identifier of the inventory record' })
  id: string;

  @ApiProperty({ description: 'The ID of the product this inventory belongs to' })
  product_id: string;

  @ApiProperty({ description: 'The quantity in stock' })
  quantity: number;

  @ApiProperty({ description: 'The threshold for low stock alerts' })
  low_stock_threshold: number;

  @ApiProperty({ description: 'When this inventory record was last updated' })
  last_updated: Date;
}

export class VariationInventoryResponseDto {
  @ApiProperty({ description: 'The unique identifier of the inventory record' })
  id: string;

  @ApiProperty({ description: 'The ID of the variation this inventory belongs to' })
  variation_id: string;

  @ApiProperty({ description: 'The quantity in stock' })
  quantity: number;

  @ApiProperty({ description: 'The threshold for low stock alerts' })
  low_stock_threshold: number;

  @ApiProperty({ description: 'The quantity currently reserved for orders' })
  reserved_quantity: number;

  @ApiProperty({ description: 'When this inventory record was last updated' })
  last_updated: Date;
}

export class LowStockProductDto {
  @ApiProperty({ description: 'Inventory details' })
  id: string;
  
  @ApiProperty({ description: 'Product ID' })
  product_id: string;
  
  @ApiProperty({ description: 'Quantity in stock' })
  quantity: number;
  
  @ApiProperty({ description: 'Low stock threshold' })
  low_stock_threshold: number;
  
  @ApiProperty({ description: 'Product details' })
  Product: {
    id: string;
    title: string;
    sku?: string;
    price: number;
    images: string[];
  };
}

export class LowStockVariationDto {
  @ApiProperty({ description: 'Inventory details' })
  id: string;
  
  @ApiProperty({ description: 'Variation ID' })
  variation_id: string;
  
  @ApiProperty({ description: 'Quantity in stock' })
  quantity: number;
  
  @ApiProperty({ description: 'Low stock threshold' })
  low_stock_threshold: number;
  
  @ApiProperty({ description: 'Variation details' })
  Variation: {
    id: string;
    size: string;
    color: string;
    sku?: string;
    Product: {
      id: string;
      title: string;
      sku?: string;
    }
  };
}

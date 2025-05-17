import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'Product title', example: 'Slim Fit Cotton T-Shirt' })
  title: string;

  @ApiProperty({ description: 'Product description', example: 'A comfortable slim fit t-shirt made of 100% cotton.' })
  description: string;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  price: number;

  @ApiProperty({ description: 'Vendor ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  vendor_id: string;

  @ApiProperty({ description: 'Product images URLs', example: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'] })
  images: string[];

  @ApiPropertyOptional({ description: 'Product brand', example: 'Nike' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Target gender', example: 'Men\'s' })
  gender?: string;

  @ApiPropertyOptional({ description: 'Product season', example: 'Summer' })
  season?: string;

  @ApiPropertyOptional({ description: 'Product weight in grams', example: 150 })
  weight?: number;

  @ApiPropertyOptional({ description: 'Primary color name', example: 'Navy Blue' })
  color_name?: string;

  @ApiPropertyOptional({ description: 'Color family for filtering', example: 'Blue' })
  color_family?: string;

  @ApiPropertyOptional({ description: 'Category information' })
  category?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiPropertyOptional({ description: 'Inventory information' })
  inventory?: {
    quantity: number;
    last_updated: Date;
  };

  @ApiPropertyOptional({ description: 'Vendor information' })
  vendor?: {
    shop_name: string;
    status: string;
  };

  @ApiPropertyOptional({ description: 'Apparel details' })
  apparel_details?: Record<string, any>;
}

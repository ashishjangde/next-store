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
  name: string;

  @ApiProperty({ 
    description: 'Product description',
    example: 'A comfortable cotton t-shirt perfect for daily wear'
  })
  description: string;

  @ApiProperty({ 
    description: 'Product price',
    example: 29.99
  })
  price: number;

  @ApiProperty({ 
    description: 'Product main image URL',
    example: 'https://example.com/images/t-shirt.jpg'
  })
  main_image: string;
}

export class CartItemDto {
  @ApiProperty({ 
    description: 'Cart item ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({ 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  user_id: string;

  @ApiProperty({ 
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  product_id: string;

  @ApiProperty({ 
    description: 'Quantity',
    example: 2
  })
  quantity: number;

  @ApiProperty({ 
    description: 'Product details',
    type: ProductInfo
  })
  @Type(() => ProductInfo)
  Product: ProductInfo;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Array of cart items',
    type: [CartItemDto]
  })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({
    description: 'Total number of items in the cart',
    example: 3
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total price of all items in the cart',
    example: 89.97
  })
  totalPrice: number;
}

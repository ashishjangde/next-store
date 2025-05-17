import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({
    description: 'The ID of the product to add to the cart',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product to add to the cart',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'The ID of the cart item to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty({ message: 'Cart item ID is required' })
  @IsString({ message: 'Cart item ID must be a string' })
  @IsUUID(4, { message: 'Cart item ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: 'The new quantity of the product',
    example: 2,
    minimum: 1
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}

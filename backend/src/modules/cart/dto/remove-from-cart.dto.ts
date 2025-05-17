import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RemoveFromCartDto {
  @ApiProperty({
    description: 'The ID of the cart item to remove',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty({ message: 'Cart item ID is required' })
  @IsString({ message: 'Cart item ID must be a string' })
  @IsUUID(4, { message: 'Cart item ID must be a valid UUID' })
  id: string;
}

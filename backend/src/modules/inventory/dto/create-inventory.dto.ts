import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  product_id: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 100,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Quantity cannot be negative' })
  @Type(() => Number)
  quantity: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
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

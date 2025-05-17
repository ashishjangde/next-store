import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateVendorDto {
  @ApiProperty({ example: 'Fashion Hub', required: false })
  @IsString({ message: 'Shop name must be a string' })
  @IsOptional()
  shop_name?: string;

  @ApiProperty({ example: '123 Fashion Street, Mumbai', required: false })
  @IsString({ message: 'Shop address must be a string' })
  @IsOptional()
  shop_address?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: 'Please provide a valid 10-digit phone number'
  })
  phone_number?: string;
}

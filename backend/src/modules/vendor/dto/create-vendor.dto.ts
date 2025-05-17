import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: '29AADCB2230M1ZB' })
  @IsString({ message: 'GST number must be a string' })
  @IsNotEmpty({ message: 'GST number is required' })
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Please provide a valid GST number format'
  })
  gst_number: string;

  @ApiProperty({ example: 'ABCDE1234F' })
  @IsString({ message: 'PAN number must be a string' })
  @IsNotEmpty({ message: 'PAN number is required' })
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Please provide a valid PAN number format'
  })
  pan_number: string;

  @ApiProperty({ example: 'Fashion Hub' })
  @IsString({ message: 'Shop name must be a string' })
  @IsNotEmpty({ message: 'Shop name is required' })
  shop_name: string;

  @ApiProperty({ example: '123 Fashion Street, Mumbai' })
  @IsString({ message: 'Shop address must be a string' })
  @IsNotEmpty({ message: 'Shop address is required' })
  shop_address: string;

  @ApiProperty({ example: '9876543210' })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]{10}$/, {
    message: 'Please provide a valid 10-digit phone number'
  })
  phone_number: string;
}

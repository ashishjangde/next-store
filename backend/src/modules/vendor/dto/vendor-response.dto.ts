import { ApiProperty } from '@nestjs/swagger';
import { VendorStatus } from '@prisma/client';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class VendorResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the vendor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the vendor account',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  user_id: string;

  @ApiProperty({
    description: 'GST number of the vendor',
    example: '29AADCB2230M1ZB',
  })
  gst_number: string;

  @ApiProperty({
    description: 'PAN number of the vendor',
    example: 'ABCDE1234F',
  })
  pan_number: string;

  @ApiProperty({
    description: 'Name of the shop',
    example: 'Fashion Hub',
  })
  shop_name: string;

  @ApiProperty({
    description: 'Address of the shop',
    example: '123 Fashion Street, Mumbai',
  })
  shop_address: string;

  @ApiProperty({
    description: 'Phone number of the vendor',
    example: '9876543210',
  })
  phone_number: string;

  @ApiProperty({
    description: 'Current status of the vendor account',
    enum: VendorStatus,
    example: 'PENDING',
  })
  status: VendorStatus;

  @ApiProperty({
    description: 'Date when the vendor was created',
    example: '2023-01-01T12:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date when the vendor was last updated',
    example: '2023-01-01T12:00:00Z',
  })
  updated_at: Date;

  user: UserResponseDto;
}

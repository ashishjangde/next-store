import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VendorStatus } from '@prisma/client';

export class UpdateVendorStatusDto {
  @ApiProperty({
    description: 'New status for the vendor',
    enum: VendorStatus,
    example: 'APPROVED',
  })
  @IsEnum(VendorStatus, { message: 'Status must be a valid vendor status' })
  status: VendorStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { VendorResponseDto } from './vendor-response.dto';

export class VendorRequestResponseDto extends VendorResponseDto {
  @ApiProperty({
    description: 'Message about the approval status',
    example: 'Your vendor application has been submitted and is pending admin approval',
  })
  message: string;
}

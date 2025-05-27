import { ApiProperty } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty({
    description: 'Banner ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Banner title',
    example: 'Summer Sale 2024'
  })
  title: string;

  @ApiProperty({
    description: 'Banner description',
    example: 'Get up to 50% off on summer collection'
  })
  description?: string;

  @ApiProperty({
    description: 'Banner image URL',
    example: 'https://example.com/banner.jpg'
  })
  image_url: string;

  @ApiProperty({
    description: 'Whether the banner is active',
    example: true
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Display order of the banner',
    example: 1
  })
  sort_order: number;

  @ApiProperty({
    description: 'ID of the admin who created the banner',
    example: 'uuid-string'
  })
  created_by: string;

  @ApiProperty({
    description: 'Banner creation date',
    example: '2024-05-27T10:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Banner last update date',
    example: '2024-05-27T10:00:00Z'
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Creator information',
    required: false
  })
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

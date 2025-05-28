import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class BannerUpdateDto {
  @ApiProperty({
    description: 'Banner title',
    example: 'Summer Sale 2024',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Banner description',
    example: 'Get up to 50% off on summer collection',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({
    description: 'Display order of the banner',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  @Type(() => Number)
  sort_order?: number;

  @ApiProperty({
    description: 'Whether the banner is active',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}

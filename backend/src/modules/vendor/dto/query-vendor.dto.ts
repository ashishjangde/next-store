import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorStatus } from '@prisma/client';

export class QueryVendorDto {
  @ApiProperty({ 
    description: 'Search term for shop name', 
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Page number (starting from 1)', 
    required: false,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of items per page', 
    required: false,
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Filter vendors by status', 
    required: false,
    enum: VendorStatus
  })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiProperty({ 
    description: 'Field to sort by (e.g. created_at, shop_name)', 
    required: false,
    default: 'created_at'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiProperty({ 
    description: 'Sort order (asc or desc)', 
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

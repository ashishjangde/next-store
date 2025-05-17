import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class ProductQueryDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', example: 10, required: false })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Field to order by', example: 'created_at', required: false })
  @IsString()
  @IsOptional()
  orderBy?: string = 'created_at';

  @ApiProperty({ description: 'Order direction', example: 'desc', required: false })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';

  @ApiProperty({ description: 'Filter by category ID', example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsString()
  @IsOptional()
  category_id?: string;

  @ApiProperty({ description: 'Filter by vendor ID', example: '550e8400-e29b-41d4-a716-446655440001', required: false })
  @IsString()
  @IsOptional()
  vendor_id?: string;

  @ApiProperty({ description: 'Search by title', example: 'cotton shirt', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by price range (min)', example: 10, required: false })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  min_price?: number;

  @ApiProperty({ description: 'Filter by price range (max)', example: 100, required: false })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  max_price?: number;
}

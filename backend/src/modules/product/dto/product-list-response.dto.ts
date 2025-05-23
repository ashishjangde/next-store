import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class ProductListResponseDto {
  @ApiProperty({ description: 'List of products', type: [ProductResponseDto] })
  products: ProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiPropertyOptional({ description: 'Search query used' })
  query?: string;

  @ApiPropertyOptional({ description: 'Applied filters' })
  filters?: any;
}

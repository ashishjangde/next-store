import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CategoryAttributeResponseDto } from './category-attribute-response.dto';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics'
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the category',
    example: 'All electronic devices and accessories'
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'electronics'
  })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: 'The URL of the category image',
    example: 'https://example.com/images/categories/electronics.jpg'
  })
  @Expose()
  image?: string;
  
  @ApiProperty({
    description: 'Category level (0: root, 1: subcategory, 2: leaf)',
    example: 0,
    enum: [0, 1, 2]
  })
  @Expose()
  level: number;

  @ApiProperty({
    description: 'Whether this category is featured on the homepage',
    example: false
  })
  @Expose()
  is_featured: boolean;

  @ApiProperty({
    description: 'Whether this category is active and visible to customers',
    example: true
  })
  @Expose()
  active: boolean;

  @ApiPropertyOptional({
    description: 'ID of the parent category (null for root categories)',
    example: null
  })
  @Expose()
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'Parent category (null for root categories)',
    type: () => CategoryResponseDto
  })
  @Expose()
  @Type(() => CategoryResponseDto)
  parent?: CategoryResponseDto;

  @ApiPropertyOptional({
    description: 'Child categories',
    type: [CategoryResponseDto]
  })
  @Expose()
  @Type(() => CategoryResponseDto)
  children?: CategoryResponseDto[];

  @ApiPropertyOptional({
    description: 'Category attributes',
    type: [CategoryAttributeResponseDto]
  })
  @Expose()
  @Type(() => CategoryAttributeResponseDto)
  attributes?: CategoryAttributeResponseDto[];

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2023-01-01T12:00:00.000Z'
  })
  @Expose()
  created_at: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2023-01-01T12:00:00.000Z'
  })
  @Expose()
  updated_at: Date;
}

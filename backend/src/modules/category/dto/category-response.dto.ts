import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Men\'s T-Shirts'
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'All types of t-shirts for men including round neck, v-neck, and polo'
  })
  description: string | null;

  @ApiProperty({
    description: 'Category slug (URL-friendly version of the name)',
    example: 'mens-t-shirts'
  })
  slug: string;

  @ApiProperty({
    description: 'Category image URL',
    example: 'https://example.com/images/mens-tshirts.jpg'
  })
  image: string | null;

  @ApiProperty({
    description: 'Whether this category is featured',
    example: false
  })
  is_featured: boolean;

  @ApiProperty({
    description: 'Whether this category is active',
    example: true
  })
  active: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 0
  })
  sort_order: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-05-01T15:30:45.123Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-05-05T10:15:30.456Z'
  })
  updated_at: Date;
}
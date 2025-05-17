import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Men\'s T-Shirts'
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'Category name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'All types of t-shirts for men including round neck, v-neck, and polo',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category slug (URL-friendly version of the name)',
    example: 'mens-t-shirts'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
  slug: string;
  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false,
    description: 'Category image file'
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    description: 'Whether this category should be featured',
    example: false,
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiProperty({
    description: 'Whether this category is active',
    example: true,
    required: false,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 0,
    required: false,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

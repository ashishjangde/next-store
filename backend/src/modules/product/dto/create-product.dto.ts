import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  IsPositive,
  MaxLength,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product title', example: 'Slim Fit Cotton T-Shirt' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Product description', example: 'A comfortable slim fit t-shirt made of 100% cotton.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Product images URLs', example: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({ description: 'Product brand', example: 'Nike' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Target gender', example: 'Men\'s' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Product season', example: 'Summer' })
  @IsString()
  @IsOptional()
  season?: string;

  @ApiPropertyOptional({ description: 'Product weight in grams', example: 150 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Primary color name', example: 'Navy Blue' })
  @IsString()
  @IsOptional()
  color_name?: string;

  @ApiPropertyOptional({ description: 'Color family for filtering', example: 'Blue' })
  @IsString()
  @IsOptional()
  color_family?: string;

  @ApiPropertyOptional({ description: 'Product category ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  category_id?: string;
}

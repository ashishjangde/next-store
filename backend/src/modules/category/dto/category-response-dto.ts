import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryAttributeResponseDto } from './category-attribute-response.dto';
import { Type } from 'class-transformer';



export class CategoryResponseDto {
    @ApiProperty({ description: 'The unique identifier of the category' })
    id: string;

    @ApiProperty({ description: 'The name of the category' })
    name: string;

    @ApiPropertyOptional({ description: 'The description of the category' })
    description?: string;

    @ApiProperty({ description: 'The URL-friendly slug of the category' })
    slug: string;

    @ApiPropertyOptional({ description: 'The image of the category' })
    image?: string;

    @ApiPropertyOptional({ description: 'Whether the category is featured or not' })
    is_featured: boolean;

    @ApiPropertyOptional({ description: 'Whether the category is active or not' })
    active: boolean;

    @ApiProperty({ description: 'The creation timestamp' })
    created_at: Date;

    @ApiProperty({ description: 'The last update timestamp' })
    updated_at: Date;

    @ApiPropertyOptional({ description: 'The ID of the parent category' })
    parent_id?: string;

    @ApiPropertyOptional({ 
        description: 'The parent category', 
        type: () => CategoryResponseDto 
    })
    @Type(() => CategoryResponseDto)
    parent?: CategoryResponseDto;

    @ApiPropertyOptional({ 
        description: 'The child categories', 
        type: () => [CategoryResponseDto]
    })
    @Type(() => CategoryResponseDto)
    children?: CategoryResponseDto[];

 
  @ApiPropertyOptional({
    description: "list of products"
  })
    products?: string[];

    @ApiPropertyOptional({ 
        description: 'The category attributes', 
        type: () => [CategoryAttributeResponseDto]
    })
    @Type(() => CategoryAttributeResponseDto)
    attributes?: CategoryAttributeResponseDto[];
}

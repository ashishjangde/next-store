import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CategoryCreateDto {
    @ApiProperty({ description: 'The name of the category' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'The description of the category' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'The image of the category'  ,format: 'binary'})
    @IsString()
    @IsOptional()
    image?: any;

    @ApiPropertyOptional({ description: 'Whether the category is featured or not' })
    @IsBoolean()
    @IsOptional()
    is_featured?: boolean;

    @ApiPropertyOptional({ description: 'Whether the category is active or not' })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiPropertyOptional({ description: 'The ID of the parent category' })
    @IsString()
    @IsOptional()
    parent_id?: string;
}

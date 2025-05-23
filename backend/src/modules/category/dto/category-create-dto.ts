import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CategoryCreateDto {
    @ApiProperty({ description: 'The name of the category' })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
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
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    is_featured?: boolean;

    @ApiPropertyOptional({ description: 'Whether the category is active or not' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    active?: boolean;

    @ApiPropertyOptional({ description: 'The ID of the parent category' })
    @IsString()
    @IsOptional()
    parent_id?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CategoryAttributeDto {
    @ApiProperty({ description: 'The ID of the attribute to add to the category' })
    @IsString()
    attributeId: string;

    @ApiPropertyOptional({ description: 'Whether the attribute is required for products in this category' })
    @IsBoolean()
    @IsOptional()
    required?: boolean;
}

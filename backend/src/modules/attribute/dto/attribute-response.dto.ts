import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeValueResponseDto } from './attribute-value-response.dto';
import { Transform, Type } from 'class-transformer';

export class AttributeResponseDto {
    @ApiProperty({ description: 'The unique identifier of the attribute' })
    id: string;

    @ApiProperty({ description: 'The name of the attribute' })
    name: string;

    @ApiPropertyOptional({ description: 'The description of the attribute' })
    description?: string;

    @ApiProperty({ description: 'The data type of the attribute' })
    type: string;

    @ApiPropertyOptional({ description: 'The values for this attribute', type: [AttributeValueResponseDto] })
    @Transform(({ value }) => {
        // Handle malformed array values
        if (!value) return [];
        if (!Array.isArray(value)) return [];
        if (Array.isArray(value[0])) return []; // Nested arrays are incorrect
        return value;
    })
    @Type(() => AttributeValueResponseDto)
    values?: AttributeValueResponseDto[];
    
    @ApiProperty({ description: 'The creation timestamp' })
    created_at: Date;

    @ApiProperty({ description: 'The last update timestamp' })
    updated_at: Date;
}

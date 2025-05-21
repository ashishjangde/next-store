import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeValueResponseDto {
    @ApiProperty({ description: 'The unique identifier of the attribute value' })
    id: string;

    @ApiProperty({ description: 'The ID of the attribute this value belongs to' })
    attribute_id: string;

    @ApiProperty({ description: 'The value of the attribute' })
    value: string;

    @ApiPropertyOptional({ description: 'The display value (if different from actual value)' })
    display_value?: string;
}

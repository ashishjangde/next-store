import { ApiProperty } from '@nestjs/swagger';
import { AttributeResponseDto } from 'src/modules/attribute/dto/attribute-response.dto';
import { Type } from 'class-transformer';

export class CategoryAttributeResponseDto {
    @ApiProperty({ description: 'The unique identifier of the category' })
    category_id: string;

    @ApiProperty({ description: 'The unique identifier of the attribute' })
    attribute_id: string;
    
    @ApiProperty({ description: 'Whether this attribute is required for products in this category' })
    required: boolean;

    @ApiProperty({ 
        description: 'The attribute details', 
        type: () => AttributeResponseDto 
    })
    @Type(() => AttributeResponseDto)
    attribute?: AttributeResponseDto;
}

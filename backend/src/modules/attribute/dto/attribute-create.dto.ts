import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class AttributeCreateDto {
    @ApiProperty({ description: 'The name of the attribute' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'The description of the attribute' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ 
        description: 'The data type of the attribute',
        enum: ['string', 'number', 'boolean', 'date'],
        default: 'string'
    })
    @IsString()
    @IsIn(['string', 'number', 'boolean', 'date'])
    @IsOptional()
    type?: string;
}

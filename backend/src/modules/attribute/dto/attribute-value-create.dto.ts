import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AttributeValueCreateDto {
    @ApiProperty({ description: 'The value of the attribute' })
    @IsString()
    value: string;

    @ApiPropertyOptional({ description: 'The display value (if different from actual value)' })
    @IsString()
    @IsOptional()
    display_value?: string;
}

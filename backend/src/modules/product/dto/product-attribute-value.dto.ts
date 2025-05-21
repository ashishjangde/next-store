import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class AssignProductAttributeValuesDto {
  @ApiProperty({
    description: 'Array of attribute value IDs to assign to the product',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
  })
  @IsArray()
  @IsNotEmpty()
  attributeValueIds: string[];
}

export class ProductAttributeValueResponseDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  attribute_value_id: string;

  @ApiProperty({ type: () => AttributeValueDto })
  attributeValue?: AttributeValueDto;
}

export class AttributeValueDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  attribute_id: string;

  @ApiProperty()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ required: false })
  display_value?: string;

  @ApiProperty({ type: () => AttributeDto })
  attribute?: AttributeDto;
}

export class AttributeDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  type: string;
}

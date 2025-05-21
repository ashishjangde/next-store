import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCustomAttributeDto {
  @ApiProperty({
    description: 'The key (name) of the custom attribute',
    example: 'pattern'
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'The value of the custom attribute',
    example: 'striped'
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CustomAttributesDto {
  @ApiProperty({
    description: 'Array of custom attributes to add to the product',
    type: [CreateCustomAttributeDto],
    example: [
      { key: 'pattern', value: 'striped' },
      { key: 'sleeve_type', value: 'full' }
    ]
  })
  @IsArray()
  @IsNotEmpty()
  attributes: CreateCustomAttributeDto[];
}

export class CustomAttributeResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsString()
  created_by: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

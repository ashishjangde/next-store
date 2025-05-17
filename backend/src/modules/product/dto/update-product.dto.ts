import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsUUID, IsPositive, MaxLength, Min } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // All properties become optional by extending PartialType
}

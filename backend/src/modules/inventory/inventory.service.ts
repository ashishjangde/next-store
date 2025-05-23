import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { ProductRepository } from 'src/repositories/product-repository';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { InventoryResponseDto, VariationInventoryResponseDto, LowStockProductDto, LowStockVariationDto } from './dto/inventory-response.dto';
import { InventoryUpdateDto, VariationInventoryUpdateDto } from './dto/inventory-update.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly productRepo: ProductRepository
  ) {}

 

}

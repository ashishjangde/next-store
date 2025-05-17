import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InventoryRepository } from 'src/repositories/inventory-repository'; 
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import ApiError from 'src/common/responses/ApiError';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async createInventory(createInventoryDto: CreateInventoryDto): Promise<InventoryResponseDto> {
    // Check if inventory for this product already exists
    const existingInventory = await this.inventoryRepository.findInventoryByProductId(
      createInventoryDto.product_id
    );

    if (existingInventory) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        `Inventory for product ID ${createInventoryDto.product_id} already exists`
      );
    }

    const inventory = await this.inventoryRepository.createInventory(createInventoryDto);
    if (!inventory) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create inventory');
    }

    // Get the inventory with product details
    const inventoryWithProduct = await this.inventoryRepository.findInventoryByProductId(
      createInventoryDto.product_id
    );
    return plainToClass(InventoryResponseDto, inventoryWithProduct);
  }

  async findAll(): Promise<InventoryResponseDto[]> {
    const inventories = await this.inventoryRepository.findAllInventory();
    return plainToClass(InventoryResponseDto, inventories);
  }

  async findLowStock(threshold: number): Promise<InventoryResponseDto[]> {
    const inventories = await this.inventoryRepository.findInventoryWithLowStock(threshold);
    return plainToClass(InventoryResponseDto, inventories);
  }

  async findByProductId(productId: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findInventoryByProductId(productId);
    if (!inventory) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Inventory not found for this product');
    }
    return plainToClass(InventoryResponseDto, inventory);
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<InventoryResponseDto> {
    // Verify inventory exists
    const inventory = await this.inventoryRepository.findInventoryByProductId(id);
    if (!inventory) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Inventory not found');
    }

    const updatedInventory = await this.inventoryRepository.updateInventoryQuantity(
      inventory.id,
      updateInventoryDto.quantity
    );

    if (!updatedInventory) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update inventory');
    }

    // Get updated inventory with product details
    const inventoryWithProduct = await this.inventoryRepository.findInventoryByProductId(id);
    return plainToClass(InventoryResponseDto, inventoryWithProduct);
  }

  async remove(id: string): Promise<void> {
    // Verify inventory exists
    const inventory = await this.inventoryRepository.findInventoryByProductId(id);
    if (!inventory) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Inventory not found');
    }

    const result = await this.inventoryRepository.deleteInventory(inventory.id);
    if (!result) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete inventory');
    }
  }
}

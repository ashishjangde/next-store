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

  async getProductInventory(productId: string) {
    this.logger.debug(`Getting inventory for product: ${productId}`);
    
    // Check if product exists
    const product = await this.productRepo.findProductById(productId);
    if (!product) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Product not found'
      );
    }
    
    const inventory = await this.inventoryRepo.findInventoryByProductId(productId);
    if (!inventory) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Inventory not found for this product'
      );
    }
    
    return plainToClass(InventoryResponseDto, inventory, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async updateProductInventory(productId: string, updateDto: InventoryUpdateDto, vendorId: string) {
    this.logger.debug(`Updating inventory for product: ${productId}`);
    
    // Check if product exists and belongs to the vendor
    const product = await this.productRepo.findProductById(productId);
    if (!product) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Product not found'
      );
    }
    
    if (product.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this inventory'
      );
    }
    
    // Find existing inventory
    const existingInventory = await this.inventoryRepo.findInventoryByProductId(productId);
    
    let updatedInventory;
    
    if (existingInventory) {
      // Update existing inventory
      updatedInventory = await this.inventoryRepo.updateInventory(productId, updateDto);
    } else {
      // Create new inventory
      updatedInventory = await this.inventoryRepo.createInventory({
        Product: {
          connect: {
            id: productId
          }
        },
        quantity: updateDto.quantity,
        low_stock_threshold: updateDto.low_stock_threshold || 10
      });
    }
    
    if (!updatedInventory) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update inventory'
      );
    }
    
    return plainToClass(InventoryResponseDto, updatedInventory, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getVariationInventory(variationId: string) {
    this.logger.debug(`Getting inventory for variation: ${variationId}`);
    
    // Check if variation exists
    const variation = await this.productRepo.findProductVariationById(variationId);
    if (!variation) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Variation not found'
      );
    }
    
    const inventory = await this.inventoryRepo.findVariationInventoryById(variationId);
    if (!inventory) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Inventory not found for this variation'
      );
    }
    
    return plainToClass(VariationInventoryResponseDto, inventory, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async updateVariationInventory(variationId: string, updateDto: VariationInventoryUpdateDto, vendorId: string) {
    this.logger.debug(`Updating inventory for variation: ${variationId}`);
    
    // Check if variation exists and belongs to the vendor
    const variation = await this.productRepo.findProductVariationById(variationId);
    if (!variation) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Variation not found'
      );
    }
    
    // Check if product belongs to vendor
    const product = await this.productRepo.findProductById(variation.product_id);
    if (product.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this inventory'
      );
    }
    
    // Find existing inventory
    const existingInventory = await this.inventoryRepo.findVariationInventoryById(variationId);
    
    let updatedInventory;
    
    if (existingInventory) {
      // Update existing inventory
      updatedInventory = await this.inventoryRepo.updateVariationInventory(variationId, updateDto);
    } else {
      // Create new inventory
      updatedInventory = await this.inventoryRepo.createVariationInventory({
        Variation: {
          connect: {
            id: variationId
          }
        },
        quantity: updateDto.quantity,
        low_stock_threshold: updateDto.low_stock_threshold || 5,
        reserved_quantity: updateDto.reserved_quantity || 0
      });
    }
    
    if (!updatedInventory) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update variation inventory'
      );
    }
    
    return plainToClass(VariationInventoryResponseDto, updatedInventory, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getLowStockProducts(threshold?: number) {
    this.logger.debug(`Getting low stock products with threshold: ${threshold || 'default'}`);

    const products = await this.inventoryRepo.getLowStockProducts(threshold);
    
    return plainToClass(LowStockProductDto, products, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getLowStockVariations(threshold?: number) {
    this.logger.debug(`Getting low stock variations with threshold: ${threshold || 'default'}`);

    const variations = await this.inventoryRepo.getLowStockVariations(threshold);
    
    return plainToClass(LowStockVariationDto, variations, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }
}

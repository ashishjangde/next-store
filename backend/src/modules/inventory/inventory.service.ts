import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { ProductRepository } from 'src/repositories/product-repository';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { InventoryResponseDto, VariationInventoryResponseDto, LowStockProductDto, LowStockVariationDto } from './dto/inventory-response.dto';
import { InventoryUpdateDto, VariationInventoryUpdateDto } from './dto/inventory-update.dto';
import { ProductType } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async getInventoryByProductId(productId: string): Promise<InventoryResponseDto> {
    try {
      // Check if product exists
      const product = await this.productRepo.findProductById(productId);
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      // Get inventory data
      const inventory = await this.inventoryRepo.getInventoryByProductId(productId);
      if (!inventory) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Inventory not found for this product');
      }

      // Add product info to the response
      const inventoryWithProduct = {
        ...inventory,
        Product: product
      };

      return plainToClass(InventoryResponseDto, inventoryWithProduct);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting inventory: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve inventory');
    }
  }

  async getInventoriesByVendorId(vendorId: string): Promise<InventoryResponseDto[]> {
    try {
      const inventories = await this.inventoryRepo.getInventoriesByVendorId(vendorId, true);
      
      if (!inventories || inventories.length === 0) {
        return [];
      }

      return plainToClass(InventoryResponseDto, inventories);
    } catch (error) {
      this.logger.error(`Error getting vendor inventories: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve vendor inventories');
    }
  }

  async updateInventory(vendorId: string, productId: string, updateDto: InventoryUpdateDto): Promise<InventoryResponseDto> {
    try {
      // Check if product exists and belongs to vendor
      const product = await this.productRepo.findVendorProductById(vendorId, productId);
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found or does not belong to this vendor');
      }

      // Update inventory
      const inventory = await this.inventoryRepo.updateInventory(productId, updateDto);
      if (!inventory) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Inventory not found for this product');
      }

      // Add product info to the response
      const inventoryWithProduct = {
        ...inventory,
        Product: product
      };

      return plainToClass(InventoryResponseDto, inventoryWithProduct);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error updating inventory: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update inventory');
    }
  }

  async updateVariantInventories(
    vendorId: string, 
    parentProductId: string, 
    updateDto: VariationInventoryUpdateDto
  ): Promise<VariationInventoryResponseDto> {
    try {
      // Check if parent product exists and belongs to vendor
      const parentProduct = await this.productRepo.findVendorProductById(
        vendorId, 
        parentProductId,
        false, // includeCategory
        false, // includeAttributes
        true   // includeChildren
      );

      if (!parentProduct) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Parent product not found or does not belong to this vendor');
      }

      // Ensure it's a parent product
      if (parentProduct.product_type !== ProductType.PARENT) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'The specified product is not a parent product');
      }

      // Check if all variants belong to this parent
      const variantIds = updateDto.variants.map(v => v.variantId);
      const childrenIds = parentProduct.children ? parentProduct.children.map(child => child.id) : [];
      
      // Check if all provided variant IDs are valid children of the parent
      const invalidVariants = variantIds.filter(id => !childrenIds.includes(id));
      if (invalidVariants.length > 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST, 
          `The following variants do not belong to this parent product: ${invalidVariants.join(', ')}`
        );
      }

      // Prepare updates
      const updates = updateDto.variants.map(v => ({
        variantId: v.variantId,
        data: v.inventory
      }));

      // Update inventories
      const updatedCount = await this.inventoryRepo.updateVariantInventories(parentProductId, updates);

      // Get updated inventories for response
      const updatedInventories: any[] = [];
      for (const variantId of variantIds) {
        const inventory = await this.inventoryRepo.getInventoryByProductId(variantId);
        if (inventory) {
          const variant = parentProduct.children.find(c => c.id === variantId);
          updatedInventories.push({
            ...inventory,
            Product: variant
          });
        }
      }

      const response = {
        parent_id: parentProductId,
        parent_title: parentProduct.title,
        variants: updatedInventories,
        total_updated: updatedCount
      };

      return plainToClass(VariationInventoryResponseDto, response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error updating variant inventories: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update variant inventories');
    }
  }

  async getLowStockProducts(vendorId: string, threshold?: number): Promise<LowStockProductDto[]> {
    try {
      const lowStockProducts = await this.inventoryRepo.getLowStockProducts(threshold, vendorId);
      
      if (!lowStockProducts || lowStockProducts.length === 0) {
        return [];
      }

      return plainToClass(LowStockProductDto, lowStockProducts);
    } catch (error) {
      this.logger.error(`Error getting low stock products: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve low stock products');
    }
  }
}

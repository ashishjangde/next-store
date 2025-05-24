import { Injectable, Logger } from '@nestjs/common';
import { Inventory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class InventoryRepository {
  private readonly logger = new Logger(InventoryRepository.name);
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async createInventory(data: {
    product_id: string;
    quantity: number;
    low_stock_threshold: number;
    reserved_quantity: number;
  }): Promise<Inventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.create({
          data
        })
      );
      
      if (inventory) {
        await this.redis.set(`inventory:product:${data.product_id}`, inventory);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error creating inventory: ${error.message}`, error);
      return null;
    }
  }

  async updateInventory(
    productId: string,
    data: Partial<Omit<Inventory, 'id' | 'product_id'>>
  ): Promise<Inventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.update({
          where: { product_id: productId },
          data
        })
      );
      
      if (inventory) {
        await this.redis.set(`inventory:product:${productId}`, inventory);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error updating inventory: ${error.message}`, error);
      return null;
    }
  }

  async getInventoryByProductId(productId: string): Promise<Inventory | null> {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(`inventory:product:${productId}`);
      if (cached) {
        return cached as Inventory;
      }

      // If not in cache, get from database
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.findUnique({
          where: { product_id: productId }
        })
      );

      // Cache the result if found
      if (inventory) {
        await this.redis.set(`inventory:product:${productId}`, inventory);
      }

      return inventory;
    } catch (error) {
      this.logger.error(`Error getting inventory by product ID: ${error.message}`, error);
      return null;
    }
  }

  async getInventoriesByVendorId(vendorId: string, includeProductDetails: boolean = false): Promise<any[] | null> {
    try {
      // Generate a cache key based on the request parameters
      const cacheKey = `inventory:vendor:${vendorId}:include:${includeProductDetails}`;
      
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return cached as any[];
      }

      // If not in cache, get from database with product relationship
      const inventories = await handleDatabaseOperations(() =>
        this.prisma.inventory.findMany({
          where: {
            Product: {
              vendor_id: vendorId
            }
          },
          include: {
            Product: includeProductDetails ? {
              include: {
                category: true
              }
            } : true
          }
        })
      );

      // Cache the result if found
      if (inventories && inventories.length > 0) {
        await this.redis.set(cacheKey, inventories, 300); // Cache for 5 minutes
      }

      return inventories;
    } catch (error) {
      this.logger.error(`Error getting inventories by vendor ID: ${error.message}`, error);
      return null;
    }
  }

  async getLowStockProducts(threshold?: number, vendorId?: string): Promise<any[] | null> {
    try {
      // Build the query based on parameters
      const where: any = {};
      
      // Use custom SQL condition if threshold is not provided
      if (threshold !== undefined) {
        where.quantity = {
          lte: threshold
        };
      } else {
        // Use Prisma raw query to compare with the product's own threshold
        where.quantity = {
          lte: Prisma.raw('low_stock_threshold')
        };
      }

      // Add vendor filter if provided
      if (vendorId) {
        where.Product = {
          vendor_id: vendorId
        };
      }

      // Get low stock products from database
      const lowStockProducts = await handleDatabaseOperations(() =>
        this.prisma.inventory.findMany({
          where,
          include: {
            Product: {
              include: {
                category: true
              }
            }
          }
        })
      );

      return lowStockProducts;
    } catch (error) {
      this.logger.error(`Error getting low stock products: ${error.message}`, error);
      return null;
    }
  }

  async updateVariantInventories(
    parentProductId: string, 
    updates: Array<{ variantId: string, data: Partial<Omit<Inventory, 'id' | 'product_id'>> }>
  ): Promise<number> {
    try {
      let updatedCount = 0;
      
      // Update each variant's inventory
      for (const update of updates) {
        const inventory = await this.updateInventory(update.variantId, update.data);
        if (inventory) {
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      this.logger.error(`Error updating variant inventories: ${error.message}`, error);
      return 0;
    }
  }
}

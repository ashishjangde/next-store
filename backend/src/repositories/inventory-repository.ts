import { Injectable, Logger } from '@nestjs/common';
import { Inventory, VariationInventory, Prisma } from '@prisma/client';
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

  // Main Product Inventory Methods
  async createInventory(data: Prisma.InventoryCreateInput): Promise<Inventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.create({ data })
      );

      if (inventory) {
        await this.redis.set(`inventory:product:${inventory.product_id}`, inventory, 3600);
      }
      return inventory;
    } catch (error) {
      this.logger.error(`Error creating inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async findInventoryByProductId(productId: string): Promise<Inventory | null> {
    const cacheKey = `inventory:product:${productId}`;
    try {
      const cached = await this.redis.get<Inventory>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.findUnique({
          where: { product_id: productId }
        })
      );

      if (inventory) {
        await this.redis.set(cacheKey, inventory, 3600);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error finding inventory by product ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateInventory(
    productId: string,
    data: Prisma.InventoryUpdateInput
  ): Promise<Inventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.inventory.update({
          where: { product_id: productId },
          data: {
            ...data,
            last_updated: new Date()
          }
        })
      );

      if (inventory) {
        await this.redis.set(`inventory:product:${productId}`, inventory, 3600);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error updating inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteInventory(productId: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.inventory.delete({
          where: { product_id: productId }
        })
      );

      await this.redis.del(`inventory:product:${productId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting inventory: ${error.message}`, error.stack);
      return false;
    }
  }

  // Variation Inventory Methods
  async createVariationInventory(data: Prisma.VariationInventoryCreateInput): Promise<VariationInventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.variationInventory.create({ data })
      );

      if (inventory) {
        await this.redis.set(`inventory:variation:${inventory.variation_id}`, inventory, 3600);
      }
      return inventory;
    } catch (error) {
      this.logger.error(`Error creating variation inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async findVariationInventoryById(variationId: string): Promise<VariationInventory | null> {
    const cacheKey = `inventory:variation:${variationId}`;
    try {
      const cached = await this.redis.get<VariationInventory>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const inventory = await handleDatabaseOperations(() =>
        this.prisma.variationInventory.findUnique({
          where: { variation_id: variationId }
        })
      );

      if (inventory) {
        await this.redis.set(cacheKey, inventory, 3600);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error finding variation inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateVariationInventory(
    variationId: string,
    data: Prisma.VariationInventoryUpdateInput
  ): Promise<VariationInventory | null> {
    try {
      const inventory = await handleDatabaseOperations(() =>
        this.prisma.variationInventory.update({
          where: { variation_id: variationId },
          data: {
            ...data,
            last_updated: new Date()
          }
        })
      );

      if (inventory) {
        await this.redis.set(`inventory:variation:${variationId}`, inventory, 3600);
      }
      
      return inventory;
    } catch (error) {
      this.logger.error(`Error updating variation inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteVariationInventory(variationId: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.variationInventory.delete({
          where: { variation_id: variationId }
        })
      );

      await this.redis.del(`inventory:variation:${variationId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting variation inventory: ${error.message}`, error.stack);
      return false;
    }
  }

  // Low stock monitoring methods
  async getLowStockProducts(threshold?: number): Promise<any[]> {
    try {
      const defaultThreshold = threshold || 10;
      
      const products = await handleDatabaseOperations(() =>
        this.prisma.$queryRaw`
          SELECT i.*, p.id as product_id, p.title, p.sku, p.price, p.images
          FROM "Inventory" i
          JOIN "Product" p ON i.product_id = p.id
          WHERE (i.quantity <= i.low_stock_threshold) OR 
                (i.low_stock_threshold IS NULL AND i.quantity <= ${defaultThreshold})
        `
      ) as any[];
      
      return products || [];
    } catch (error) {
      this.logger.error(`Error getting low stock products: ${error.message}`, error.stack);
      return [];
    }
  }

  async getLowStockVariations(threshold?: number): Promise<any[]> {
    try {
      const defaultThreshold = threshold || 5;
      
      const variations = await handleDatabaseOperations(() =>
        this.prisma.$queryRaw`
          SELECT vi.*, v.id as variation_id, v.size, v.color, v.sku,
                 p.id as product_id, p.title, p.sku as product_sku
          FROM "VariationInventory" vi
          JOIN "ProductVariation" v ON vi.variation_id = v.id
          JOIN "Product" p ON v.product_id = p.id
          WHERE (vi.quantity <= vi.low_stock_threshold) OR 
                (vi.low_stock_threshold IS NULL AND vi.quantity <= ${defaultThreshold})
        `
      ) as any[];
      
      return variations || [];
    } catch (error) {
      this.logger.error(`Error getting low stock variations: ${error.message}`, error.stack);
      return [];
    }
  }
}

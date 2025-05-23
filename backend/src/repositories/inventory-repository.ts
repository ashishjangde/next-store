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
}

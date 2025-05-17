import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { Inventory } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class InventoryRepository {
  private readonly logger = new Logger(InventoryRepository.name);

  constructor(private prisma: PrismaService) {}

  async createInventory(data: {
    product_id: string;
    quantity: number;
  }): Promise<Inventory | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.inventory.create({ data }),
      );
    } catch (error) {
      this.logger.error(`Error creating inventory: ${error.message}`, error.stack);
      return null;
    }
  }

  async findInventoryByProductId(productId: string): Promise<Inventory | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.inventory.findFirst({
          where: { product_id: productId },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding inventory by product ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateInventoryQuantity(id: string, quantity: number): Promise<Inventory | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.inventory.update({
          where: { id },
          data: { 
            quantity,
            last_updated: new Date()
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error updating inventory quantity: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteInventory(id: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.inventory.delete({
          where: { id },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting inventory: ${error.message}`, error.stack);
      return false;
    }
  }

  async findInventoryWithLowStock(threshold: number = 10): Promise<(Inventory & { Product: any })[]> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.inventory.findMany({
          where: {
            quantity: { lte: threshold },
          },
          include: {
            Product: true,
          },
        }),
      );
      return result || [];
    } catch (error) {
      this.logger.error(`Error finding low stock inventory: ${error.message}`, error.stack);
      return [];
    }
  }

  async findAllInventory(): Promise<(Inventory & { Product: any })[]> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.inventory.findMany({
          include: {
            Product: true,
          },
        }),
      );
      return result || [];
    } catch (error) {
      this.logger.error(`Error finding all inventory: ${error.message}`, error.stack);
      return [];
    }
  }
}

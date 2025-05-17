import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { CartItem } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class CartItemRepository {
  private readonly logger = new Logger(CartItemRepository.name);

  constructor(private prisma: PrismaService) {}

  async createCartItem(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.cartItem.create({
          data: {
            user_id: userId,
            product_id: productId,
            quantity,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error creating cart item: ${error.message}`, error.stack);
      return null;
    }
  }
  async findCartItemsByUserId(userId: string): Promise<(CartItem & { Product: any })[]> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.cartItem.findMany({
          where: {
            user_id: userId,
          },
          include: {
            Product: true,
          },
        }),
      );
      return result || [];
    } catch (error) {
      this.logger.error(`Error finding cart items: ${error.message}`, error.stack);
      return [];
    }
  }

  async findCartItem(userId: string, productId: string): Promise<CartItem | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.cartItem.findFirst({
          where: {
            user_id: userId,
            product_id: productId,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding cart item: ${error.message}`, error.stack);
      return null;
    }
  }

  async findCartItemById(id: string): Promise<CartItem | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.cartItem.findUnique({
          where: {
            id,
          },
          include: {
            Product: true,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding cart item by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.cartItem.update({
          where: {
            id,
          },
          data: {
            quantity,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error updating cart item quantity: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteCartItem(id: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.cartItem.delete({
          where: {
            id,
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting cart item: ${error.message}`, error.stack);
      return false;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.cartItem.deleteMany({
          where: {
            user_id: userId,
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error clearing cart: ${error.message}`, error.stack);
      return false;
    }
  }
  async countCartItems(userId: string): Promise<number> {
    try {
      const count = await handleDatabaseOperations(() =>
        this.prisma.cartItem.count({
          where: {
            user_id: userId,
          },
        }),
      );
      return count ?? 0;
    } catch (error) {
      this.logger.error(`Error counting cart items: ${error.message}`, error.stack);
      return 0;
    }
  }
}

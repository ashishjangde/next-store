import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { Wishlist } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class WishlistRepository {
  private readonly logger = new Logger(WishlistRepository.name);

  constructor(private prisma: PrismaService) {}

  async createWishlistItem(userId: string, productId: string): Promise<Wishlist | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.wishlist.create({
          data: {
            user_id: userId,
            product_id: productId,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error creating wishlist item: ${error.message}`, error.stack);
      return null;
    }
  }
  async findWishlistItemsByUserId(userId: string): Promise<(Wishlist & { Product: any })[]> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.wishlist.findMany({
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
      this.logger.error(`Error finding wishlist items: ${error.message}`, error.stack);
      return [];
    }
  }

  async findWishlistItem(userId: string, productId: string): Promise<Wishlist | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.wishlist.findFirst({
          where: {
            user_id: userId,
            product_id: productId,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding wishlist item: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteWishlistItem(id: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.wishlist.delete({
          where: {
            id,
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting wishlist item: ${error.message}`, error.stack);
      return false;
    }
  }

  async deleteWishlistItemByProductId(userId: string, productId: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.wishlist.deleteMany({
          where: {
            user_id: userId,
            product_id: productId,
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting wishlist item: ${error.message}`, error.stack);
      return false;
    }
  }

  async clearWishlist(userId: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.wishlist.deleteMany({
          where: {
            user_id: userId,
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error clearing wishlist: ${error.message}`, error.stack);
      return false;
    }
  }
  
  async countWishlistItems(userId: string): Promise<number> {
    try {
      const count = await handleDatabaseOperations(() =>
        this.prisma.wishlist.count({
          where: {
            user_id: userId,
          },
        }),
      );
      return count ?? 0;
    } catch (error) {
      this.logger.error(`Error counting wishlist items: ${error.message}`, error.stack);
      return 0;
    }
  }
}

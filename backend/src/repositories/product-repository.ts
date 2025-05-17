import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { Product } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class ProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(private prisma: PrismaService) {}

  async createProduct(data: {
    title: string;
    description: string;
    price: number;
    vendor_id: string;
    images: string[];
    brand?: string;
    gender?: string;
    season?: string;
    weight?: number;
    color_name?: string;
    color_family?: string;
    category_id?: string;
  }): Promise<Product | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.product.create({ data }),
      );
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      return null;
    }
  }

  async findAllProducts(
    page = 1,
    limit = 10,
    orderBy: string = 'created_at',
    order: 'asc' | 'desc' = 'desc',
    where: Record<string, any> = {},
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Use separate awaits to avoid TypeScript iterator error
      const result = await handleDatabaseOperations(async () => {
        const data = await this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: order },
          include: {
            category: true,
            Inventory: true,
            Vendor: {
              select: {
                shop_name: true,
                status: true,
              },
            },
            ApparelDetails: true,
          },
        });
        
        const total = await this.prisma.product.count({ where });
        return { data, total };
      });

      return {
        data: result?.data || [],
        total: result?.total || 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error getting products: ${error.message}`, error.stack);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
            Inventory: true,
            Vendor: {
              select: {
                shop_name: true,
                status: true,
              },
            },
            ApparelDetails: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding product by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async findProductsByVendorId(
    vendorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    try {
      return await this.findAllProducts(page, limit, 'created_at', 'desc', {
        vendor_id: vendorId,
      });
    } catch (error) {
      this.logger.error(
        `Error finding products by vendor ID: ${error.message}`,
        error.stack,
      );
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  async findProductsByCategoryId(
    categoryId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    try {
      return await this.findAllProducts(page, limit, 'created_at', 'desc', {
        category_id: categoryId,
      });
    } catch (error) {
      this.logger.error(
        `Error finding products by category ID: ${error.message}`,
        error.stack,
      );
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  async updateProduct(
    id: string,
    data: Partial<Product>,
  ): Promise<Product | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.product.update({
          where: { id },
          data,
        }),
      );
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.product.delete({
          where: { id },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting product: ${error.message}`, error.stack);
      return false;
    }
  }

  async productExists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.product.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking product exists: ${error.message}`, error.stack);
      return false;
    }
  }
}

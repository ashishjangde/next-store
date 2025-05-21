import { Injectable, Logger } from '@nestjs/common';
import { Product, ProductVariation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class ProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheProduct(product: Product): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `product:id:${product.id}`, value: product },
        { key: `product:sku:${product.sku}`, value: product }
      ]);
    } catch (error) {
      this.logger.error(`Error caching product: ${error.message}`, error);
    }
  }

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.create({ data })
      );

      if (product) {
        await this.cacheProduct(product);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      return null;
    }
  }

  async findProductById(
    id: string, 
    includeVariations: boolean = false,
    includeAttributes: boolean = false,
    includeInventory: boolean = false,
    includeCategory: boolean = false,
    includeVendor: boolean = false
  ): Promise<any | null> {
    const cacheKey = `product:id:${id}`;
    try {
      const cached = await this.redis.get<Product>(cacheKey);
      
      if (cached && !includeVariations && !includeAttributes && !includeInventory && !includeCategory && !includeVendor) {
        return cached;
      }

      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findUnique({
          where: { id },
          include: {
            Variations: includeVariations,
            attributeValues: includeAttributes ? {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            } : false,
            Inventory: includeInventory,
            category: includeCategory,
            Vendor: includeVendor && {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profile_picture: true
                  }
                }
              }
            }
          }
        })
      );

      if (product && !includeVariations && !includeAttributes && !includeInventory && !includeCategory && !includeVendor) {
        await this.redis.set(cacheKey, product, 3600);
      }
      
      return product;
    } catch (error) {
      this.logger.error(`Error finding product by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async findProductBySKU(
    sku: string,
    includeVariations: boolean = false,
    includeAttributes: boolean = false,
    includeInventory: boolean = false,
    includeCategory: boolean = false
  ): Promise<any | null> {
    const cacheKey = `product:sku:${sku}`;
    try {
      const cached = await this.redis.get<Product>(cacheKey);
      
      if (cached && !includeVariations && !includeAttributes && !includeInventory && !includeCategory) {
        return cached;
      }

      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findFirst({
          where: { sku },
          include: {
            Variations: includeVariations,
            attributeValues: includeAttributes ? {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            } : false,
            Inventory: includeInventory,
            category: includeCategory
          }
        })
      );

      if (product && !includeVariations && !includeAttributes && !includeInventory && !includeCategory) {
        await this.redis.set(cacheKey, product, 3600);
      }
      
      return product;
    } catch (error) {
      this.logger.error(`Error finding product by SKU: ${error.message}`, error.stack);
      return null;
    }
  }

  async findAllProducts(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {},
    sort: Record<string, 'asc' | 'desc'> = { created_at: 'desc' },
    includeVariations: boolean = false,
    includeAttributes: boolean = false,
    includeInventory: boolean = false,
    includeCategory: boolean = false
  ): Promise<{ data: any[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause based on filters
      const where: Prisma.ProductWhereInput = {
        ...filters.category_id && { category_id: filters.category_id },
        ...filters.vendor_id && { vendor_id: filters.vendor_id },
        ...filters.is_active !== undefined && { is_active: filters.is_active },
        ...filters.archived !== undefined && { archived: filters.archived },
        ...filters.price_min !== undefined && filters.price_max !== undefined && {
          price: {
            gte: parseFloat(filters.price_min),
            lte: parseFloat(filters.price_max)
          }
        },
        ...filters.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { brand: { contains: filters.search, mode: 'insensitive' } }
          ]
        },
        ...filters.brand && { brand: { contains: filters.brand, mode: 'insensitive' } },
        ...filters.color_family && { color_family: { contains: filters.color_family, mode: 'insensitive' } },
        ...filters.gender && { gender: { equals: filters.gender } }
      };

      // Convert sort object to Prisma orderBy format
      let orderBy: any = {};
      
      // Map API-friendly names to actual database field names
      if (sort.created_at) {
        orderBy.created_at = sort.created_at;
      } else if (sort.price) {
        orderBy.price = sort.price;
      } else if (sort.title) {
        orderBy.title = sort.title;
      } else {
        // Default sorting
        orderBy = { created_at: 'desc' };
      }

      const result = await handleDatabaseOperations(() => 
        Promise.all([
          this.prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
              Variations: includeVariations,
              attributeValues: includeAttributes ? {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true
                    }
                  }
                }
              } : false,
              Inventory: includeInventory,
              category: includeCategory
            }
          }),
          this.prisma.product.count({ where })
        ])
      );

      if (!result) {
        return { data: [], total: 0 };
      }

      const [products, total] = result;

      return {
        data: products,
        total
      };
    } catch (error) {
      this.logger.error(`Error finding all products: ${error.message}`, error.stack);
      return {
        data: [],
        total: 0
      };
    }
  }

  async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<Product | null> {
    try {
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.update({
          where: { id },
          data
        })
      );

      if (product) {
        // Clear old cache entries
        await this.redis.pipelineDel([
          `product:id:${id}`,
          product.sku ? `product:sku:${product.sku}` : ''
        ]);

        // Set new cache entries
        await this.cacheProduct(product);
      }

      return product;
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      return null;
    }
  }

  async softDeleteProduct(id: string): Promise<boolean> {
    try {
      const product = await this.findProductById(id);
      if (!product) return false;

      await handleDatabaseOperations(() =>
        this.prisma.product.update({
          where: { id },
          data: {
            is_active: false,
            archived: true,
            archived_at: new Date()
          }
        })
      );

      // Create archive record
      await handleDatabaseOperations(() =>
        this.prisma.archivedProduct.create({
          data: {
            original_id: id,
            data: product as any
          }
        })
      );

      // Clear cache
      await this.redis.pipelineDel([
        `product:id:${id}`,
        product.sku ? `product:sku:${product.sku}` : ''
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error soft-deleting product: ${error.message}`, error.stack);
      return false;
    }
  }

  async hardDeleteProduct(id: string): Promise<boolean> {
    try {
      const product = await this.findProductById(id);
      if (!product) return false;

      // Archive before deletion
      await handleDatabaseOperations(() =>
        this.prisma.archivedProduct.create({
          data: {
            original_id: id,
            data: product as any
          }
        })
      );

      // Delete related records
      await handleDatabaseOperations(() =>
        Promise.all([
          // Delete inventory
          this.prisma.inventory.deleteMany({
            where: { product_id: id }
          }),
          // Delete variations
          this.prisma.productVariation.deleteMany({
            where: { product_id: id }
          }),
          // Delete attribute values
          this.prisma.productAttributeValue.deleteMany({
            where: { product_id: id }
          }),
          // Delete the product
          this.prisma.product.delete({
            where: { id }
          })
        ])
      );

      // Clear cache
      await this.redis.pipelineDel([
        `product:id:${id}`,
        product.sku ? `product:sku:${product.sku}` : ''
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error hard-deleting product: ${error.message}`, error.stack);
      return false;
    }
  }

  // Product Variation Methods
  async createProductVariation(data: Prisma.ProductVariationCreateInput): Promise<ProductVariation | null> {
    try {
      const variation = await handleDatabaseOperations(() =>
        this.prisma.productVariation.create({ data })
      );

      // Invalidate product cache
      if (variation) {
        await this.redis.pipelineDel([
          `product:id:${variation.product_id}`
        ]);
      }

      return variation;
    } catch (error) {
      this.logger.error(`Error creating product variation: ${error.message}`, error.stack);
      return null;
    }
  }

  async findProductVariationById(id: string, includeInventory: boolean = false): Promise<any | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.productVariation.findUnique({
          where: { id },
          include: {
            Inventory: includeInventory,
            Product: true
          }
        })
      );
    } catch (error) {
      this.logger.error(`Error finding product variation by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateProductVariation(
    id: string,
    data: Prisma.ProductVariationUpdateInput
  ): Promise<ProductVariation | null> {
    try {
      const variation = await handleDatabaseOperations(() =>
        this.prisma.productVariation.update({
          where: { id },
          data,
          include: {
            Product: true
          }
        })
      );

      // Invalidate product cache
      if (variation) {
        await this.redis.pipelineDel([
          `product:id:${variation.product_id}`
        ]);
      }

      return variation;
    } catch (error) {
      this.logger.error(`Error updating product variation: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteProductVariation(id: string): Promise<boolean> {
    try {
      const variation = await this.findProductVariationById(id);
      if (!variation) return false;

      // Delete inventory record if it exists
      if (variation.Inventory) {
        await handleDatabaseOperations(() =>
          this.prisma.variationInventory.delete({
            where: { variation_id: id }
          })
        );
      }

      // Delete the variation
      await handleDatabaseOperations(() =>
        this.prisma.productVariation.delete({
          where: { id }
        })
      );

      // Invalidate product cache
      await this.redis.pipelineDel([
        `product:id:${variation.product_id}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error deleting product variation: ${error.message}`, error.stack);
      return false;
    }
  }

  // Product Attribute Value Methods
  async addAttributeValueToProduct(
    productId: string,
    attributeValueId: string
  ): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.productAttributeValue.create({
          data: {
            product_id: productId,
            attribute_value_id: attributeValueId
          }
        })
      );

      // Invalidate product cache
      await this.redis.pipelineDel([
        `product:id:${productId}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error adding attribute value to product: ${error.message}`, error.stack);
      return false;
    }
  }

  async removeAttributeValueFromProduct(
    productId: string,
    attributeValueId: string
  ): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.productAttributeValue.delete({
          where: {
            product_id_attribute_value_id: {
              product_id: productId,
              attribute_value_id: attributeValueId
            }
          }
        })
      );

      // Invalidate product cache
      await this.redis.pipelineDel([
        `product:id:${productId}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error removing attribute value from product: ${error.message}`, error.stack);
      return false;
    }
  }
}

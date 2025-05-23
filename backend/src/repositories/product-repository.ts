import { Injectable, Logger } from '@nestjs/common';
import { Product, Prisma, ProductType } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';
import { ElasticsearchService } from 'src/common/db/elasticsearch/elasticsearch.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class ProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private elasticsearch: ElasticsearchService
  ) {}

  private async cacheProduct(product: any): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `product:id:${product.id}`, value: product },
        { key: `product:slug:${product.slug}`, value: product }
      ]);
    } catch (error) {
      this.logger.error(`Error caching product: ${error.message}`, error);
    }
  }

  private async indexProductToElasticsearch(product: any): Promise<void> {
    try {
      await this.elasticsearch.indexDocument('products', product.id, {
        id: product.id,
        title: product.title,
        description: product.description,
        slug: product.slug,
        price: product.price,
        brand: product.brand,
        category: product.category?.name,
        is_active: product.is_active,
        archived: product.archived,
        created_at: product.created_at
      });
    } catch (error) {
      this.logger.error(`Error indexing product to Elasticsearch: ${error.message}`, error);
    }
  }

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.create({
          data,
          include: {
            category: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            },
            Vendor: true,
            Inventory: true
          }
        }),
      );

      if (product) {
        await this.cacheProduct(product);
        await this.indexProductToElasticsearch(product);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error);
      return null;
    }
  }

  async findProductById(id: string, includeCategory = false, includeAttributes = false, includeChildren = false): Promise<any | null> {
    try {
      const cacheKey = `product:id:${id}:cat:${includeCategory}:attr:${includeAttributes}:children:${includeChildren}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;

      const include: any = {
        Vendor: true,
        Inventory: true
      };

      if (includeCategory) {
        include.category = true;
      }

      if (includeAttributes) {
        include.attributeValues = {
          include: {
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        };
      }

      if (includeChildren) {
        include.children = {
          include: {
            Inventory: true,
            attributeValues: includeAttributes ? {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            } : undefined
          }
        };
      }

      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findUnique({
          where: { id },
          include
        }),
      );

      if (product) {
        await this.redis.set(cacheKey, product);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error finding product by ID: ${error.message}`, error);
      return null;
    }
  }

  async findProductBySlug(slug: string, includeCategory = false, includeAttributes = false, includeChildren = false): Promise<any | null> {
    try {
      const cacheKey = `product:slug:${slug}:cat:${includeCategory}:attr:${includeAttributes}:children:${includeChildren}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;

      const include: any = {
        Vendor: true,
        Inventory: true
      };

      if (includeCategory) {
        include.category = true;
      }

      if (includeAttributes) {
        include.attributeValues = {
          include: {
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        };
      }

      if (includeChildren) {
        include.children = {
          include: {
            Inventory: true,
            attributeValues: includeAttributes ? {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            } : undefined
          }
        };
      }

      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findUnique({
          where: { slug },
          include
        }),
      );

      if (product) {
        await this.redis.set(cacheKey, product);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error finding product by slug: ${error.message}`, error);
      return null;
    }
  }

  async findAllProducts(options?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: string;
    vendorId?: string;
    productType?: ProductType;
    isActive?: boolean;
    archived?: boolean;
    includeCategory?: boolean;
    includeAttributes?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: any[], total: number } | null> {
    try {
      const {
        skip = 0,
        take = 10,
        search,
        categoryId,
        vendorId,
        productType,
        isActive = true,
        archived = false,
        includeCategory = false,
        includeAttributes = false,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options || {};

      const where: Prisma.ProductWhereInput = {
        is_active: isActive,
        archived
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (vendorId) {
        where.vendor_id = vendorId;
      }

      if (productType) {
        where.product_type = productType;
      }

      const include: any = {
        Vendor: true,
        Inventory: true
      };

      if (includeCategory) {
        include.category = true;
      }

      if (includeAttributes) {
        include.attributeValues = {
          include: {
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        };
      }

      const validSortFields = ['created_at', 'updated_at', 'title', 'price'];
      const orderBy = {};
      const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      orderBy[actualSortField] = sortOrder;

      const result = await handleDatabaseOperations(() => Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include
        }),
        this.prisma.product.count({ where })
      ]));

      if (!result) return null;
      const [products, total] = result;

      return { products, total };
    } catch (error) {
      this.logger.error(`Error finding products: ${error.message}`, error);
      return null;
    }
  }
  async findVariantsByParentId(parentId: string): Promise<any[] | null> {
    try {
      const cacheKey = `product:variants:${parentId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached && Array.isArray(cached)) return cached;

      const variants = await handleDatabaseOperations(() =>
        this.prisma.product.findMany({
          where: {
            parent_id: parentId,
            product_type: 'VARIANT'
          },
          include: {
            Inventory: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            }
          }
        }),
      );

      if (variants) {
        await this.redis.set(cacheKey, variants);
      }
      return variants;
    } catch (error) {
      this.logger.error(`Error finding variants by parent ID: ${error.message}`, error);
      return null;
    }
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<any | null> {
    try {
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.update({
          where: { id },
          data,
          include: {
            category: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            },
            Vendor: true,
            Inventory: true,
            children: true
          }
        }),
      );

      if (product) {
        await this.cacheProduct(product);
        await this.indexProductToElasticsearch(product);
        // Clear related cache
        await this.redis.pipelineDel([
          `product:slug:${product.slug}`,
          `product:variants:${product.parent_id}`,
          `products:vendor:${product.vendor_id}`
        ]);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const product = await this.findProductById(id);
      if (!product) return false;

      await handleDatabaseOperations(() =>
        this.prisma.product.delete({
          where: { id }
        }),
      );

      // Remove from cache and Elasticsearch
      await this.redis.pipelineDel([
        `product:id:${id}`,
        `product:slug:${product.slug}`,
        `product:variants:${product.parent_id}`,
        `products:vendor:${product.vendor_id}`
      ]);

      await this.elasticsearch.deleteDocument('products', id);

      return true;
    } catch (error) {
      this.logger.error(`Error deleting product: ${error.message}`, error);
      return false;
    }
  }
  async addAttributeToProduct(productId: string, attributeValueId: string): Promise<any | null> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.productAttributeValue.create({
          data: {
            product_id: productId,
            attribute_value_id: attributeValueId
          },
          include: {
            product: true,
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        }),
      );

      if (result) {
        // Update product in Elasticsearch
        await this.updateProductInElasticsearch(productId);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error adding attribute to product: ${error.message}`, error);
      return null;
    }
  }

  async removeAttributeFromProduct(productId: string, attributeValueId: string): Promise<boolean> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.productAttributeValue.deleteMany({
          where: {
            product_id: productId,
            attribute_value_id: attributeValueId
          }
        }),
      );

      if (result && result.count > 0) {
        // Update product in Elasticsearch
        await this.updateProductInElasticsearch(productId);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error removing attribute from product: ${error.message}`, error);
      return false;
    }
  }

  async searchProducts(query: string, page: number = 1, pageSize: number = 20, filters: any = {}): Promise<any> {
    try {      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^3', 'description^2', 'sku', 'short_description'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [] as any[]
          }
        },
        from: (page - 1) * pageSize,
        size: pageSize,
        sort: [
          { _score: { order: 'desc' } },
          { created_at: { order: 'desc' } }
        ]
      };

      // Add filters
      if (filters.categoryId) {
        searchBody.query.bool.filter.push({
          term: { category_id: filters.categoryId }
        });
      }

      if (filters.vendorId) {
        searchBody.query.bool.filter.push({
          term: { vendor_id: filters.vendorId }
        });
      }

      if (filters.productType) {
        searchBody.query.bool.filter.push({
          term: { product_type: filters.productType }
        });
      }

      if (filters.priceRange) {
        searchBody.query.bool.filter.push({
          range: {
            price: {
              gte: filters.priceRange.min,
              lte: filters.priceRange.max
            }
          }
        });
      }

      if (filters.status) {
        searchBody.query.bool.filter.push({
          term: { status: filters.status }
        });
      }

      const searchResult = await this.elasticsearch.search('products', searchBody);
      
      return {
        products: searchResult.hits?.hits?.map(hit => hit._source) || [],
        total: searchResult.hits?.total?.value || 0,
        page,
        pageSize,
        totalPages: Math.ceil((searchResult.hits?.total?.value || 0) / pageSize)
      };
    } catch (error) {
      this.logger.error(`Error searching products: ${error.message}`, error);
      // Fallback to database search
      return this.searchProductsInDatabase(query, page, pageSize, filters);
    }
  }
  private async searchProductsInDatabase(query: string, page: number, pageSize: number, filters: any): Promise<any> {
    const whereCondition: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Add filters
    if (filters.categoryId) {
      whereCondition.category_id = filters.categoryId;
    }

    if (filters.vendorId) {
      whereCondition.vendor_id = filters.vendorId;
    }

    if (filters.productType) {
      whereCondition.product_type = filters.productType;
    }

    if (filters.priceRange) {
      whereCondition.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max
      };
    }    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereCondition,
        include: this.getProductIncludes(),
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { created_at: 'desc' }
        ]
      }),
      this.prisma.product.count({ where: whereCondition })
    ]);

    return {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  private async updateProductInElasticsearch(productId: string): Promise<void> {
    try {
      const product = await this.findProductById(productId);
      if (product) {
        await this.elasticsearch.updateDocument('products', productId, product);
      }
    } catch (error) {
      this.logger.error(`Error updating product in Elasticsearch: ${error.message}`, error);
    }
  }

  async findById(id: string): Promise<any | null> {
    return this.findProductById(id, true, true, true);
  }

  private getProductIncludes() {
    return {
      category: true,
      attributeValues: {
        include: {
          attributeValue: {
            include: {
              attribute: true
            }
          }
        }
      },
      Vendor: true,
      Inventory: true,
      children: true
    };
  }
}

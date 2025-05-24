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
      // Prepare a clean document for Elasticsearch with only the relevant fields
      const esDocument = {
        id: product.id,
        title: product.title,
        description: product.description,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        brand: product.brand,
        category_id: product.category_id,
        category: product.category?.name,
        vendor_id: product.vendor_id,
        parent_id: product.parent_id,
        product_type: product.product_type,
        is_active: product.is_active,
        archived: product.archived,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };

      await this.elasticsearch.indexDocument('products', product.id, esDocument);
      this.logger.log(`Product ${product.id} (${product.title}) indexed in Elasticsearch`);
    } catch (error) {
      this.logger.error(`Error indexing product to Elasticsearch: ${error.message}`, error);
      // We don't throw the error here as indexing failure shouldn't block the main operation
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
      // Generate a cache key that includes the request options
      const cacheKey = `product:id:${id}:cat:${includeCategory}:attr:${includeAttributes}:children:${includeChildren}`;
      
      // Try to get the product from Redis cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Product ${id} retrieved from cache`);
        return cached;
      }

      // Set up the database query with requested relations
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

      // Fetch product from database
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findUnique({
          where: { id },
          include
        }),
      );

      // If product found, cache it in Redis
      if (product) {
        await this.redis.set(cacheKey, product);
        this.logger.log(`Product ${id} cached in Redis`);
      }
      
      return product;
    } catch (error) {
      this.logger.error(`Error finding product by ID: ${error.message}`, error);
      return null;
    }
  }

  async findProductBySlug(slug: string, includeCategory = false, includeAttributes = false, includeChildren = false): Promise<any | null> {
    try {
      // First check Redis cache
      const cacheKey = `product:slug:${slug}:cat:${includeCategory}:attr:${includeAttributes}:children:${includeChildren}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;

      // Try to find product using Elasticsearch for better slug matching
      try {
        const esQuery = {
          query: {
            bool: {
              must: [
                {
                  term: {
                    slug: slug
                  }
                },
                {
                  term: {
                    is_active: true
                  }
                },
                {
                  term: {
                    archived: false
                  }
                }
              ]
            }
          },
          size: 1
        };

        const searchResult = await this.elasticsearch.search('products', esQuery);
        
        // If found in Elasticsearch, use the ID to fetch complete product from database
        if (searchResult.hits?.hits?.length > 0) {
          const productId = searchResult.hits.hits[0]._source.id;
          
          // Get full product from database with all requested relations
          return await this.findProductById(productId, includeCategory, includeAttributes, includeChildren);
        }
      } catch (esError) {
        // Log the error but continue with database search as fallback
        this.logger.error(`Error searching product by slug in Elasticsearch: ${esError.message}`, esError);
      }

      // Fall back to direct database query if not found in Elasticsearch
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

      // Cache the result in Redis
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

      // Use Elasticsearch for search queries to get better results
      if (search && search.trim() !== '') {
        try {
          // Convert options to Elasticsearch query
          const page = Math.floor(skip / take) + 1; // Calculate page from skip and take
          const pageSize = take;
          
          const filters = {
            categoryId,
            vendorId,
            productType,
            isActive,
            archived
          };
          
          const result = await this.searchProductsInElasticsearch(search, page, pageSize, filters, sortBy, sortOrder);
          
          // If we got results from Elasticsearch, enhance them with relationships from database
          if (result && result.products.length > 0) {
            const productIds = result.products.map(p => p.id);
            
            // Fetch complete products with their relationships from database
            if (includeCategory || includeAttributes) {
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
              
              const fullProducts = await this.prisma.product.findMany({
                where: { id: { in: productIds } },
                include
              });
              
              // Map the full products to preserve Elasticsearch ordering
              const orderedProducts = productIds.map(id => 
                fullProducts.find(p => p.id === id)
              ).filter(Boolean);
              
              return { 
                products: orderedProducts, 
                total: result.total
              };
            }
            
            // If no need for relationships, just return ES results
            return result;
          }
        } catch (esError) {
          // Log error but continue with database search as fallback
          this.logger.error(`Error searching in Elasticsearch: ${esError.message}`, esError);
          // We'll fall back to database search below
        }
      }

      // Use database directly for non-search queries or if ES failed
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
      const product = await this.findProductById(
        productId, 
        true,  // Include category for properly indexing category name
        false, // No need for attributes in the Elasticsearch index
        false  // No need for children in the Elasticsearch index
      );
      
      if (product) {
        // Prepare a clean document for Elasticsearch with only the relevant fields
        const esDocument = {
          id: product.id,
          title: product.title,
          description: product.description,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          brand: product.brand,
          category_id: product.category_id,
          category: product.category?.name,
          vendor_id: product.vendor_id,
          parent_id: product.parent_id,
          product_type: product.product_type,
          is_active: product.is_active,
          archived: product.archived,
          created_at: product.created_at,
          updated_at: product.updated_at,
        };

        await this.elasticsearch.updateDocument('products', productId, esDocument);
        this.logger.log(`Product ${product.id} (${product.title}) updated in Elasticsearch`);
      }
    } catch (error) {
      this.logger.error(`Error updating product in Elasticsearch: ${error.message}`, error);
      // We don't throw the error here as indexing failure shouldn't block the main operation
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

  private async searchProductsInElasticsearch(
    query: string, 
    page: number = 1, 
    pageSize: number = 20, 
    filters: any = {}, 
    sortBy: string = 'created_at', 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<any> {
    const searchBody: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['title^3', 'description^2', 'sku', 'short_description', 'brand'],
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
      sort: [] as any[]
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

    // Add is_active filter (similar to DB query)
    if (filters.isActive !== undefined) {
      searchBody.query.bool.filter.push({
        term: { is_active: filters.isActive }
      });
    }

    // Add archived filter (similar to DB query)
    if (filters.archived !== undefined) {
      searchBody.query.bool.filter.push({
        term: { archived: filters.archived }
      });
    }

    // Add sorting
    if (sortBy === '_score') {
      searchBody.sort.push({ _score: { order: sortOrder } });
    } else {
      const validSortFields = ['created_at', 'updated_at', 'title', 'price'];
      const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      
      // Add sorting by field
      const sortItem = {};
      sortItem[actualSortField] = { order: sortOrder };
      searchBody.sort.push(sortItem);
      
      // Always add a secondary score sort for relevance
      searchBody.sort.push({ _score: { order: 'desc' } });
    }

    const searchResult = await this.elasticsearch.search('products', searchBody);
    
    return {
      products: searchResult.hits?.hits?.map(hit => ({...hit._source, _score: hit._score})) || [],
      total: searchResult.hits?.total?.value || 0,
      page,
      pageSize,
      totalPages: Math.ceil((searchResult.hits?.total?.value || 0) / pageSize)
    };
  }

  /**
   * Search for products by slug using Elasticsearch
   * @param slug The product slug to search for
   * @param onlyActive Whether to only return active products (default: true)
   * @returns The product if found, null otherwise
   */
  async searchProductBySlug(slug: string, onlyActive: boolean = true): Promise<any | null> {
    try {
      // Build Elasticsearch query
      const esQuery: any = {
        query: {
          bool: {
            must: [
              {
                term: {
                  slug: slug
                }
              }
            ]
          }
        },
        size: 1
      };

      // Only include active, non-archived products by default
      if (onlyActive) {
        esQuery.query.bool.must.push(
          {
            term: {
              is_active: true
            }
          },
          {
            term: {
              archived: false
            }
          }
        );
      }

      const searchResult = await this.elasticsearch.search('products', esQuery);
      
      if (searchResult.hits?.hits?.length > 0) {
        return {
          ...searchResult.hits.hits[0]._source,
          _score: searchResult.hits.hits[0]._score
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error searching product by slug in Elasticsearch: ${error.message}`, error);
      return null;
    }
  }

  /**
   * Get all parent products for a specific vendor with pagination and filters
   */
  async findVendorParentProducts(options?: {
    vendorId: string,
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    archived?: boolean;
    includeCategory?: boolean;
    includeAttributes?: boolean;
    includeChildren?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: any[], total: number } | null> {
    try {
      const {
        vendorId,
        skip = 0,
        take = 10,
        search,
        categoryId,
        isActive = true,
        archived = false,
        includeCategory = false,
        includeAttributes = false,
        includeChildren = false,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options || {};

      // Try to get from cache first
      const cacheKey = `vendor:${vendorId}:parent-products:${JSON.stringify({
        skip, take, search, categoryId, isActive, archived, 
        includeCategory, includeAttributes, includeChildren, 
        sortBy, sortOrder
      })}`;
      
      const cached = await this.redis.get(cacheKey);
      if (cached && typeof cached === 'object' && 'products' in cached && 'total' in cached) {
        this.logger.log(`Vendor parent products retrieved from cache for vendor ${vendorId}`);
        return cached as { products: any[], total: number };
      }

      // Use Elasticsearch for search queries to get better results
      if (search && search.trim() !== '') {
        try {
          const page = Math.floor(skip / take) + 1;
          const pageSize = take;
          
          const filters = {
            vendorId,
            categoryId,
            isActive,
            archived,
            productType: 'PARENT' // Only parent products
          };
          
          const result = await this.searchProductsInElasticsearch(search, page, pageSize, filters, sortBy, sortOrder);
          
          // If we got results from Elasticsearch, enhance them with relationships
          if (result && result.products.length > 0) {
            const productIds = result.products.map(p => p.id);
            
            // Fetch complete products with their relationships from database
            const include = this.buildIncludeObject(includeCategory, includeAttributes, includeChildren);
            
            const fullProducts = await this.prisma.product.findMany({
              where: { 
                id: { in: productIds },
                vendor_id: vendorId,
                product_type: 'PARENT'
              },
              include
            });
            
            // Map the full products to preserve Elasticsearch ordering
            const orderedProducts = productIds.map(id => 
              fullProducts.find(p => p.id === id)
            ).filter(Boolean);
            
            const finalResult = { 
              products: orderedProducts, 
              total: result.total
            };

            // Cache the result
            await this.redis.set(cacheKey, finalResult, 300); // Cache for 5 minutes
            
            return finalResult;
          }
        } catch (esError) {
          this.logger.error(`Error searching in Elasticsearch: ${esError.message}`, esError);
          // We'll fall back to database search below
        }
      }

      // Build database query
      const where: Prisma.ProductWhereInput = {
        vendor_id: vendorId,
        product_type: 'PARENT',
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
      
      // Build include object
      const include = this.buildIncludeObject(includeCategory, includeAttributes, includeChildren);

      // Sort options
      const validSortFields = ['created_at', 'updated_at', 'title', 'price'];
      const orderBy = {};
      const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      orderBy[actualSortField] = sortOrder;

      // Execute database query
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

      const finalResult = { products, total };
      
      // Cache the result
      await this.redis.set(cacheKey, finalResult, 300); // Cache for 5 minutes
      
      return finalResult;
    } catch (error) {
      this.logger.error(`Error finding vendor parent products: ${error.message}`, error);
      return null;
    }
  }

  /**
   * Get a specific product by ID for a vendor
   * Ensures that the product belongs to the specified vendor
   */
  async findVendorProductById(
    vendorId: string,
    productId: string, 
    includeCategory = false, 
    includeAttributes = false, 
    includeChildren = false
  ): Promise<any | null> {
    try {
      // Generate a cache key that includes the request options
      const cacheKey = `vendor:${vendorId}:product:${productId}:cat:${includeCategory}:attr:${includeAttributes}:children:${includeChildren}`;
      
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Product ${productId} for vendor ${vendorId} retrieved from cache`);
        return cached;
      }
      
      // Build include object
      const include = this.buildIncludeObject(includeCategory, includeAttributes, includeChildren);
      
      // Fetch the product and ensure it belongs to the vendor
      const product = await handleDatabaseOperations(() =>
        this.prisma.product.findFirst({
          where: { 
            id: productId,
            vendor_id: vendorId
          },
          include
        }),
      );
      
      if (product) {
        // Cache the result
        await this.redis.set(cacheKey, product, 300); // Cache for 5 minutes
      }
      
      return product;
    } catch (error) {
      this.logger.error(`Error finding product ${productId} for vendor ${vendorId}: ${error.message}`, error);
      return null;
    }
  }
  
  /**
   * Helper method to build the include object for product queries
   */
  private buildIncludeObject(includeCategory = false, includeAttributes = false, includeChildren = false) {
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
    
    return include;
  }
}

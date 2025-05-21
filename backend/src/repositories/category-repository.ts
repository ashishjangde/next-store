import { Injectable, Logger } from '@nestjs/common';
import { Category, CategoryAttribute, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class CategoryRepository {
  private readonly logger = new Logger(CategoryRepository.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheCategory(category: Category): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `category:id:${category.id}`, value: category },
        { key: `category:slug:${category.slug}`, value: category }
      ]);
    } catch (error) {
      this.logger.error(`Error caching category: ${error.message}`, error);
    }
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      const category = await handleDatabaseOperations(() =>
        this.prisma.category.create({ data })
      );

      if (category) {
        await this.cacheCategory(category);
      }
      return category;
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error);
      return null;
    }
  }

  async findCategoryById(id: string, includeAttributes: boolean = false): Promise<any | null> {
    const cacheKey = `category:id:${id}`;
    try {
      const cached = await this.redis.get<Category>(cacheKey);
      
      if (cached && !includeAttributes) {
        return cached;
      }

      const category = await handleDatabaseOperations(() =>
        this.prisma.category.findUnique({
          where: { id },
          include: includeAttributes ? {
            attributes: { // Changed from categoryAttributes to attributes (matching Prisma schema relation)
              include: {
                attribute: true
              }
            },
            children: true,
            parent: true
          } : undefined
        })
      );

      if (category && !includeAttributes) {
        await this.redis.set(cacheKey, category, 3600);
      }
      
      return category;
    } catch (error) {
      this.logger.error(`Error finding category by ID: ${error.message}`, error);
      return null;
    }
  }

  async findCategoryBySlug(slug: string, includeAttributes: boolean = false, includeProducts: boolean = false): Promise<any | null> {
    const cacheKey = `category:slug:${slug}`;
    try {
      const cached = await this.redis.get<Category>(cacheKey);
      
      if (cached && !includeAttributes && !includeProducts) {
        return cached;
      }

      const category = await handleDatabaseOperations(() =>
        this.prisma.category.findUnique({
          where: { slug },
          include: {
            attributes: includeAttributes ? {
              include: {
                attribute: {
                  include: {
                    values: true
                  }
                }
              }
            } : false,
            children: {
              where: { active: true },
              orderBy: { name: 'asc' }
            },
            parent: true,
            products: includeProducts ? {
              where: { is_active: true },
              select: {
                id: true,
                title: true,
                price: true,
                images: true
              },
              take: 10 // Limit to 10 products per category in the API response
            } : false
          }
        })
      );

      if (category && !includeAttributes && !includeProducts) {
        await this.redis.set(cacheKey, category, 3600);
      }
      
      return category;
    } catch (error) {
      this.logger.error(`Error finding category by slug: ${error.message}`, error);
      return null;
    }
  }

  async findAllCategories(
    page: number = 1,
    limit: number = 10,
    parentId?: string,
    includeInactive: boolean = false,
    includeProducts: boolean = false,
    includeAttributes: boolean = false
  ): Promise<{ data: any[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: Prisma.CategoryWhereInput = {
        ...(parentId !== undefined ? { parent_id: parentId } : {}),
        ...(includeInactive ? {} : { active: true })
      };

      const result = await handleDatabaseOperations(() => 
        Promise.all([
          this.prisma.category.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
              children: {
                where: includeInactive ? {} : { active: true }
              },
              attributes: includeAttributes ? {
                include: {
                  attribute: {
                    include: {
                      values: true
                    }
                  }
                }
              } : false,
              products: includeProducts ? {
                where: { is_active: true },
                select: {
                  id: true,
                  title: true,
                  price: true,
                  images: true
                },
                take: 10
              } : false
            }
          }),
          this.prisma.category.count({ where })
        ])
      );

      if (!result) {
        return { data: [], total: 0 };
      }

      const [categories, total] = result;

      return {
        data: categories,
        total
      };
    } catch (error) {
      this.logger.error(`Error finding all categories: ${error.message}`, error);
      return {
        data: [],
        total: 0
      };
    }
  }

  async updateCategory(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category | null> {
    try {
      const category = await handleDatabaseOperations(() =>
        this.prisma.category.update({
          where: { id },
          data
        })
      );

      if (category) {
        // First delete old cache entries
        await this.redis.pipelineDel([
          `category:id:${id}`,
          `category:slug:${category.slug}`
        ]);

        // Then set new cache entries
        await this.cacheCategory(category);
      }

      return category;
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const category = await this.findCategoryById(id);
      if (!category) return false;

      // Delete all associated category attributes
      await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.deleteMany({
          where: { category_id: id }
        })
      );

      // Delete the category
      await handleDatabaseOperations(() =>
        this.prisma.category.delete({ where: { id } })
      );

      // Clear cache
      await this.redis.pipelineDel([
        `category:id:${id}`,
        `category:slug:${category.slug}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error deleting category: ${error.message}`, error);
      return false;
    }
  }

  // Methods for CategoryAttribute
  async addAttributeToCategory(
    categoryId: string,
    attributeId: string,
    required: boolean = false
  ): Promise<CategoryAttribute | null> {
    try {
      const categoryAttribute = await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.create({
          data: {
            category_id: categoryId,
            attribute_id: attributeId,
            required // Now matches the schema
          }
        })
      );

      // Invalidate category cache
      await this.redis.pipelineDel([
        `category:id:${categoryId}`
      ]);

      return categoryAttribute;
    } catch (error) {
      this.logger.error(`Error adding attribute to category: ${error.message}`, error);
      return null;
    }
  }

  async removeAttributeFromCategory(
    categoryId: string,
    attributeId: string
  ): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.delete({
          where: {
            category_id_attribute_id: {
              category_id: categoryId,
              attribute_id: attributeId
            }
          }
        })
      );

      // Invalidate category cache
      await this.redis.pipelineDel([
        `category:id:${categoryId}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error removing attribute from category: ${error.message}`, error);
      return false;
    }
  }

  async updateCategoryAttribute(
    categoryId: string,
    attributeId: string,
    required: boolean
  ): Promise<CategoryAttribute | null> {
    try {
      const categoryAttribute = await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.update({
          where: {
            category_id_attribute_id: {
              category_id: categoryId,
              attribute_id: attributeId
            }
          },
          data: {
            required // Now matches the schema
          }
        })
      );

      // Invalidate category cache
      await this.redis.pipelineDel([
        `category:id:${categoryId}`
      ]);

      return categoryAttribute;
    } catch (error) {
      this.logger.error(`Error updating category attribute: ${error.message}`, error);
      return null;
    }
  }

  async getCategoryAttributes(categoryId: string): Promise<any[]> {
    try {
      const categoryAttributes = await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.findMany({
          where: {
            category_id: categoryId
          },
          include: {
            attribute: true
          }
        })
      );

      return categoryAttributes ?? [];
    } catch (error) {
      this.logger.error(`Error getting category attributes: ${error.message}`, error);
      return [];
    }
  }
}
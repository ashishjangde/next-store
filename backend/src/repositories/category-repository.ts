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
      this.logger.debug(`Creating category with data: ${JSON.stringify({
        name: data.name,
        description: data.description,
        slug: data.slug,
        level: data.level,
        parent_id: data.parent?.connect?.id || null
      })}`);
      
      const category = await handleDatabaseOperations(() =>
        this.prisma.category.create({ data })
      );

      this.logger.debug(`Category created: ${JSON.stringify({
        id: category?.id,
        name: category?.name,
        level: category?.level,
        parent_id: category?.parent_id
      })}`);

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
            attributes: {
              include: {
                attribute: true
              }
            },
            parent: true
          } : {
            parent: true
          }
        })
      );

      // Log the retrieved category for debugging
      this.logger.debug(`Retrieved category by ID: ${JSON.stringify({
        id: category?.id,
        name: category?.name,
        level: category?.level,
        parent_id: category?.parent_id
      })}`);

      if (category && !includeAttributes) {
        await this.redis.set(cacheKey, category, 3600);
      }
      
      return category;
    } catch (error) {
      this.logger.error(`Error finding category by ID: ${error.message}`, error);
      return null;
    }
  }

  async findCategoryWithChildren(
    id: string, 
    includeInactive: boolean = false,
    includeProducts: boolean = false,
    includeAttributes: boolean = false
  ): Promise<any | null> {
    try {
      const category = await handleDatabaseOperations(() =>
        this.prisma.category.findUnique({
          where: { id },
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
              where: includeInactive ? {} : { active: true },
              include: {
                children: {
                  where: includeInactive ? {} : { active: true }
                }
              }
            },
            parent: true,
            products: includeProducts ? {
              where: { is_active: true },
              select: {
                id: true,
                title: true,
                price: true,
                images: true
              }
            } : false
          }
        })
      );
      
      return category;
    } catch (error) {
      this.logger.error(`Error finding category with children: ${error.message}`, error);
      return null;
    }
  }

  async categoryHasChildren(id: string): Promise<boolean> {
    try {
      const childCount = await handleDatabaseOperations(() =>
        this.prisma.category.count({
          where: { parent_id: id }
        })
      );
      
      // Fix TypeScript error by using a default value of 0 if childCount is null
      return (childCount ?? 0) > 0;
    } catch (error) {
      this.logger.error(`Error checking if category has children: ${error.message}`, error);
      return false; // Default to false on error
    }
  }

  async findCategoryBySlug(
    slug: string, 
    includeAttributes: boolean = false, 
    includeProducts: boolean = false
  ): Promise<any | null> {
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
              }
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

  async findRootCategories(
    includeInactive: boolean = false,
    includeProducts: boolean = false,
    includeAttributes: boolean = false
  ): Promise<any[]> {
    try {
      const rootCategories = await handleDatabaseOperations(() =>
        this.prisma.category.findMany({
          where: {
            parent_id: null,
            level: 0,
            ...(includeInactive ? {} : { active: true })
          },
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
              where: includeInactive ? {} : { active: true }
            },
            products: includeProducts ? {
              where: { is_active: true },
              select: {
                id: true,
                title: true,
                price: true,
                images: true
              },
              take: 10 // Limit to 10 products per category
            } : false
          },
          orderBy: { name: 'asc' }
        })
      );

      return rootCategories || [];
    } catch (error) {
      this.logger.error(`Error finding root categories: ${error.message}`, error);
      return [];
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
      // First get the category to get its slug
      const category = await this.findCategoryById(id);
      if (!category) return false;
      
      // First delete category attributes
      await this.prisma.categoryAttribute.deleteMany({
        where: { category_id: id }
      });
      
      // Delete the category
      await this.prisma.category.delete({
        where: { id }
      });
      
      // Clear cache
      await this.redis.pipelineDel([
        `category:id:${id}`,
        `category:slug:${category.slug}`
      ]);
      
      return true;
    } catch (error) {
      this.logger.error('Error deleting category:', error);
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
            required
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
            required
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
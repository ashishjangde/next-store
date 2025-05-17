import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { Category } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class CategoryRepository {
  private readonly logger = new Logger(CategoryRepository.name);

  constructor(private prisma: PrismaService) {}

  async createCategory(data: {
    name: string;
    description?: string;
    slug: string;
    image?: string;
    is_featured?: boolean;
    active?: boolean;
    sort_order?: number;
  }): Promise<Category | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.category.create({ data }),
      );
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      return null;
    }
  }

  async findCategoryById(id: string): Promise<Category | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.category.findUnique({
          where: { id },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding category by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.category.findUnique({
          where: { slug },
        }),
      );
    } catch (error) {
      this.logger.error(`Error finding category by slug: ${error.message}`, error.stack);
      return null;
    }
  }
  async findAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    try {
      const categories = await handleDatabaseOperations(() =>
        this.prisma.category.findMany({
          where: includeInactive ? undefined : { active: true },
          orderBy: { sort_order: 'asc' },
        }),
      );
      
      // Return empty array instead of null to satisfy the Promise<Category[]> return type
      return categories || [];
    } catch (error) {
      this.logger.error(`Error finding all categories: ${error.message}`, error.stack);
      return [];
    }
  }

  async findFeaturedCategories(): Promise<Category[]> {
    try {
      const categories = await handleDatabaseOperations(() =>
        this.prisma.category.findMany({
          where: { 
            active: true,
            is_featured: true 
          },
          orderBy: { sort_order: 'asc' },
        }),
      );
      
      return categories || [];
    } catch (error) {
      this.logger.error(`Error finding featured categories: ${error.message}`, error.stack);
      return [];
    }
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      slug?: string;
      image?: string;
      is_featured?: boolean;
      active?: boolean;
      sort_order?: number;
    },
  ): Promise<Category | null> {
    try {
      return await handleDatabaseOperations(() =>
        this.prisma.category.update({
          where: { id },
          data,
        }),
      );
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await handleDatabaseOperations(() =>
        this.prisma.category.delete({
          where: { id },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Error deleting category: ${error.message}`, error.stack);
      return false;
    }
  }
  async countProductsInCategory(id: string): Promise<number> {
    try {
      const count = await handleDatabaseOperations(() =>
        this.prisma.product.count({
          where: { category_id: id },
        }),
      );
      
      // Return 0 instead of null to satisfy the Promise<number> return type
      return count || 0;
    } catch (error) {
      this.logger.error(`Error counting products in category: ${error.message}`, error.stack);
      return 0;
    }
  }
}

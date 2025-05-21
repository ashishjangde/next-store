import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { CategoryRepository } from 'src/repositories/category-repository';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';
import { CategoryCreateDto } from './dto/category-create-dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { Prisma } from '@prisma/client';
import ApiError from 'src/common/responses/ApiError';
import { slugify } from 'src/common/utils/utils';
import { plainToClass } from 'class-transformer';
import { CategoryResponseDto } from './dto/category-response-dto';

@Injectable()
export class CategoryService {

  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly multerS3Service: MulterS3ConfigService
  ) {}

  async create(categoryCreateDto: CategoryCreateDto, file: Express.Multer.File | undefined) {
    this.logger.debug(`Creating new category: ${categoryCreateDto.name}`);
    
    // Check if parent category exists when parent_id is provided
    if (categoryCreateDto.parent_id) {
      const parentCategory = await this.categoryRepo.findCategoryById(categoryCreateDto.parent_id);
      if (!parentCategory) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          'Parent category not found'
        );
      }
    }
    
    // Generate slug from name
    const slug = slugify(categoryCreateDto.name);
    
    // Prepare category data
    const categoryData: Prisma.CategoryCreateInput = {
      name: categoryCreateDto.name,
      description: categoryCreateDto.description,
      slug,
      is_featured: categoryCreateDto.is_featured || false,
      active: categoryCreateDto.active !== undefined ? categoryCreateDto.active : true,
      ...(categoryCreateDto.parent_id && {
        parent: {
          connect: {
            id: categoryCreateDto.parent_id
          }
        }
      }),
    };
    
    // Handle file upload if provided
    if (file) {
      this.logger.debug('Processing category image upload');
      try {
        const multerOptions = this.multerS3Service.createMulterOptions('categoryImage');
        const fileInfo = await new Promise((resolve, reject) => {
          multerOptions.storage._handleFile(
            { file } as any,
            file,
            (error: any, info: any) => {
              if (error) {
                this.logger.error(`Upload handler error: ${error.message}`, error.stack);
                reject(error);
              } else {
                this.logger.debug(`Upload successful: ${JSON.stringify(info)}`);
                resolve(info);
              }
            }
          );
        });

        if (fileInfo) {
          categoryData.image = (fileInfo as any).url;
        }
      } catch (error) {
        this.logger.error(`File upload error: ${error.message}`, error.stack);
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to upload category image'
        );
      }
    }
    const category = await this.categoryRepo.createCategory(categoryData);
    
    if (!category) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create category'
      );
    }
    
    this.logger.debug(`Category created successfully: ${category.id}`);
    return plainToClass(CategoryResponseDto, category, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getCategoryBySlug(slug: string, includeChildren: boolean = false, includeProducts: boolean = false, includeAttributes: boolean = false) {
    this.logger.debug(`Getting category by slug: ${slug}, includeChildren: ${includeChildren}, includeProducts: ${includeProducts}, includeAttributes: ${includeAttributes}`);
    
    try {
      const category = await this.categoryRepo.findCategoryBySlug(
        slug, 
        includeAttributes,
        includeProducts
      );
      
      if (!category) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          `Category with slug '${slug}' not found`
        );
      }
      
      // If we don't need to include children or children are already included, return as is
      if (!includeChildren || (category.children && category.children.length > 0)) {
        return plainToClass(CategoryResponseDto, category, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true
        });
      }
      
      // Otherwise, fetch children explicitly
      const { data: children } = await this.categoryRepo.findAllCategories(
        1, 
        100, 
        category.id,
        false // Only include active children
      );
      
      // Add children to the category
      const result = {
        ...category,
        children: children || []
      };
      
      return plainToClass(CategoryResponseDto, result, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error getting category by slug: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve category'
      );
    }
  }

  async getAllCategories(page: number = 1, limit: number = 10, parentId?: string, includeInactive: boolean = false, includeProducts: boolean = false, includeAttributes: boolean = false) {
    try {
      const result = await this.categoryRepo.findAllCategories(
        page, 
        limit, 
        parentId, 
        includeInactive,
        includeProducts,
        includeAttributes
      );
      
      return {
        data: plainToClass(CategoryResponseDto, result.data, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true
        }),
        total: result.total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error(`Error getting categories: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories'
      );
    }
  }

  async getCategoryTree() {
    try {
      // First, get all root categories (those without a parent)
      const { data: rootCategories } = await this.categoryRepo.findAllCategories(
        1, 
        1000, // Large limit to get all root categories
        undefined, // Changed from null to undefined for parent_id
        false // Only active categories
      );
      
      // For each root category, recursively fetch its children
      const categoryTree = await Promise.all(
        rootCategories.map(async (rootCategory) => {
          return this.buildCategorySubtree(rootCategory);
        })
      );
      
      return plainToClass(CategoryResponseDto, categoryTree, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      this.logger.error(`Error getting category tree: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve category tree'
      );
    }
  }

  private async buildCategorySubtree(category: any) {
    // Fetch children for this category
    const { data: children } = await this.categoryRepo.findAllCategories(
      1,
      1000, // Large limit to get all children
      category.id,
      false // Only active categories
    );
    
    // If this category has children, recursively build subtree for each child
    if (children && children.length > 0) {
      const childrenWithSubtrees = await Promise.all(
        children.map(async (child) => {
          return this.buildCategorySubtree(child);
        })
      );
      
      return {
        ...category,
        children: childrenWithSubtrees
      };
    }
    
    // If no children, return the category as is
    return category;
  }

  async getTopLevelCategories(includeInactive: boolean = false, includeProducts: boolean = false, includeAttributes: boolean = false) {
    try {
      const { data: rootCategories, total } = await this.categoryRepo.findAllCategories(
        1, 
        1000,
        undefined,
        includeInactive,
        includeProducts,
        includeAttributes
      );
      
      return {
        data: plainToClass(CategoryResponseDto, rootCategories, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true
        }),
        total
      };
    } catch (error) {
      this.logger.error(`Error getting top level categories: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve top level categories'
      );
    }
  }

  async addAttributeToCategory(categoryId: string, attributeId: string, required: boolean = false) {
    try {
      // Check if category exists
      const category = await this.categoryRepo.findCategoryById(categoryId);
      if (!category) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }

      // Add the attribute to the category
      const result = await this.categoryRepo.addAttributeToCategory(categoryId, attributeId, required);
      if (!result) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to add attribute to category'
        );
      }

      // Get the updated category with attributes
      const updatedCategory = await this.categoryRepo.findCategoryById(categoryId, true);
      return plainToClass(CategoryResponseDto, updatedCategory, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error adding attribute to category: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add attribute to category'
      );
    }
  }

  async removeAttributeFromCategory(categoryId: string, attributeId: string) {
    try {
      // Check if category exists
      const category = await this.categoryRepo.findCategoryById(categoryId);
      if (!category) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }

      // Remove the attribute from the category
      const success = await this.categoryRepo.removeAttributeFromCategory(categoryId, attributeId);
      if (!success) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to remove attribute from category'
        );
      }

      // Get the updated category with attributes
      const updatedCategory = await this.categoryRepo.findCategoryById(categoryId, true);
      return plainToClass(CategoryResponseDto, updatedCategory, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error removing attribute from category: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove attribute from category'
      );
    }
  }

  async updateCategory(id: string, updateDto: CategoryUpdateDto, file?: Express.Multer.File) {
    try {
      // Check if the category exists
      const existingCategory = await this.categoryRepo.findCategoryById(id);
      if (!existingCategory) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }
      
      // Check if parent exists when parent_id is provided
      if (updateDto.parent_id) {
        // Prevent circular reference (category can't be its own parent)
        if (updateDto.parent_id === id) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Category cannot be its own parent'
          );
        }
        
        const parentCategory = await this.categoryRepo.findCategoryById(updateDto.parent_id);
        if (!parentCategory) {
          throw new ApiError(
            HttpStatus.NOT_FOUND,
            'Parent category not found'
          );
        }
      }
      
      // Prepare update data
      const updateData: Prisma.CategoryUpdateInput = {
        name: updateDto.name,
        description: updateDto.description,
        is_featured: updateDto.is_featured,
        active: updateDto.active,
        ...(updateDto.parent_id && {
          parent: {
            connect: {
              id: updateDto.parent_id
            }
          }
        })
      };
      
      // If the name is updated, update the slug
      if (updateDto.name && updateDto.name !== existingCategory.name) {
        updateData.slug = slugify(updateDto.name);
      }
      
      // Handle file upload if provided
      if (file) {
        this.logger.debug('Processing category image upload');
        try {
          // Delete old image if it exists
          if (existingCategory.image) {
            await this.multerS3Service.deleteFile(existingCategory.image);
          }
          
          const multerOptions = this.multerS3Service.createMulterOptions('categoryImage');
          const fileInfo = await new Promise((resolve, reject) => {
            multerOptions.storage._handleFile(
              { file } as any,
              file,
              (error: any, info: any) => {
                if (error) {
                  this.logger.error(`Upload handler error: ${error.message}`, error.stack);
                  reject(error);
                } else {
                  this.logger.debug(`Upload successful: ${JSON.stringify(info)}`);
                  resolve(info);
                }
              }
            );
          });

          if (fileInfo) {
            updateData.image = (fileInfo as any).url;
          }
        } catch (error) {
          this.logger.error(`File upload error: ${error.message}`, error.stack);
          throw new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to upload category image'
          );
        }
      }
      
      // Update the category
      const updatedCategory = await this.categoryRepo.updateCategory(id, updateData);
      
      if (!updatedCategory) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update category'
        );
      }
      
      return plainToClass(CategoryResponseDto, updatedCategory, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update category'
      );
    }
  }
}
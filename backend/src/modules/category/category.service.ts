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
    this.logger.debug(`Request data: ${JSON.stringify(categoryCreateDto, null, 2)}`);
    
    try {
      // Validate the input data
      if (!categoryCreateDto.name) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Name is required');
      }
      
      let level = 0; // Default level for root categories
      
      // Check if parent category exists when parent_id is provided
      if (categoryCreateDto.parent_id) {
        this.logger.debug(`Parent ID provided: ${categoryCreateDto.parent_id}`);
        
        const parentCategory = await this.categoryRepo.findCategoryById(categoryCreateDto.parent_id);
        if (!parentCategory) {
          throw new ApiError(HttpStatus.NOT_FOUND, `Parent category with ID ${categoryCreateDto.parent_id} not found`);
        }
        
        // Calculate level based on parent's level
        level = parentCategory.level + 1;
        
        // Check if level would exceed maximum allowed (2)
        if (level > 2) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST, 
            'Maximum category nesting depth (2) exceeded. Categories can only have a maximum depth of 2 levels.'
          );
        }
        
        this.logger.debug(`Setting category level to ${level} (parent level: ${parentCategory.level})`);
      } else {
        this.logger.debug('No parent ID provided, this will be a root category (level 0)');
      }
      
      // Generate slug from name
      const slug = slugify(categoryCreateDto.name);
      
      // Set boolean values with proper defaults
      const is_featured = categoryCreateDto.is_featured === true || false;
      const active = categoryCreateDto.active !== false; // Default to true if not explicitly set to false
    
      // Prepare category data with level (computed, not from DTO)
      const categoryData: Prisma.CategoryCreateInput = {
        name: categoryCreateDto.name,
        description: categoryCreateDto.description || null,
        slug,
        level,
        is_featured,
        active,
        ...(categoryCreateDto.parent_id && {
          parent: {
            connect: {
              id: categoryCreateDto.parent_id
            }
          }
        }),
      };
      
      this.logger.debug(`Category data being sent to repository: ${JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
        level,
        is_featured: categoryData.is_featured,
        active: categoryData.active,
        parent_id: categoryCreateDto.parent_id
      })}`);
      
      // Handle file upload if provided
      if (file) {
        try {
          const multerOptions = this.multerS3Service.createMulterOptions('categoryImage');
          
          const fileInfo = await new Promise((resolve, reject) => {
            multerOptions.storage._handleFile(
              { file } as any,
              file,
              (error: any, info: any) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(info);
                }
              }
            );
          });

          if (fileInfo) {
            categoryData.image = (fileInfo as any).url;
          }
        } catch (error) {
          this.logger.error(`File upload error: ${error.message}`);
          throw new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to upload category image'
          );
        }
      }
      
      // Create the category
      const category = await this.categoryRepo.createCategory(categoryData);
      
      if (!category) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to create category'
        );
      }
      
      return plainToClass(CategoryResponseDto, category, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create category: ${error.message}`
      );
    }
  }

  async getCategoryBySlug(slug: string, includeProducts: boolean = false, includeAttributes: boolean = false) {
    this.logger.debug(`Getting category by slug: ${slug}, includeProducts: ${includeProducts}, includeAttributes: ${includeAttributes}`);
    
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
      
      // Level 2 categories shouldn't have children
      if (category.level === 2) {
        category.children = [];
      }
      
      return plainToClass(CategoryResponseDto, category, {
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
  
  async getCategoryById(id: string, includeInactive: boolean = false, includeProducts: boolean = false, includeAttributes: boolean = false) {
    try {
      // Get the category with its children
      const category = await this.categoryRepo.findCategoryWithChildren(
        id, 
        includeInactive,
        includeProducts,
        includeAttributes
      );
      
      if (!category) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          `Category with id '${id}' not found`
        );
      }
      
      // Level 2 categories shouldn't have children
      if (category.level === 2) {
        category.children = [];
      }
      
      return plainToClass(CategoryResponseDto, category, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error getting category by ID: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve category'
      );
    }
  }

  async getRootCategories(includeInactive: boolean = false, includeProducts: boolean = false, includeAttributes: boolean = false) {
    try {
      const rootCategories = await this.categoryRepo.findRootCategories(
        includeInactive,
        includeProducts,
        includeAttributes
      );
      
      return plainToClass(CategoryResponseDto, rootCategories, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      this.logger.error(`Error getting root categories: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve root categories'
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
      
      // Check if category is level 2 (can have attributes)
      if (category.level !== 2) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST, 
          'Attributes can only be added to level 2 categories'
        );
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
      
      // Check if category is level 2 (can have attributes)
      if (category.level !== 2) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST, 
          'Only level 2 categories can have attributes'
        );
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
      this.logger.debug(`Updating category with ID: ${id}`);
      
      // Check if the category exists
      const existingCategory = await this.categoryRepo.findCategoryById(id);
      if (!existingCategory) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }
      
      // Calculate new level if parent is changing
      let newLevel = existingCategory.level;
      
      if (updateDto.parent_id !== undefined) {
        // If parent_id is null/empty, this becomes a root category
        if (!updateDto.parent_id) {
          newLevel = 0;
        } else if (updateDto.parent_id !== existingCategory.parent_id) {
          // Prevent circular reference
          if (updateDto.parent_id === id) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Category cannot be its own parent');
          }
          
          // Get parent to determine level
          const parentCategory = await this.categoryRepo.findCategoryById(updateDto.parent_id);
          if (!parentCategory) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Parent category not found');
          }
          
          // Calculate new level
          newLevel = parentCategory.level + 1;
          
          // Check if new level would exceed maximum (2)
          if (newLevel > 2) {
            throw new ApiError(
              HttpStatus.BAD_REQUEST,
              'Maximum category nesting depth (2) exceeded'
            );
          }
        }
      }
      
      // Check if the category has children and is trying to become level 2
      if (newLevel === 2) {
        const hasChildren = await this.categoryRepo.categoryHasChildren(id);
        if (hasChildren) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Cannot change to level 2: this category has children. Level 2 categories cannot have children.'
          );
        }
      }
      
      // Prepare update data
      const updateData: Prisma.CategoryUpdateInput = {
        name: updateDto.name,
        description: updateDto.description,
        is_featured: updateDto.is_featured,
        active: updateDto.active,
        level: newLevel, // Update the level
        ...(updateDto.parent_id !== undefined && {
          parent: updateDto.parent_id ? {
            connect: {
              id: updateDto.parent_id
            }
          } : {
            disconnect: true
          }
        })
      };
      
      // If the name is updated, update the slug
      if (updateDto.name && updateDto.name !== existingCategory.name) {
        updateData.slug = slugify(updateDto.name);
      }
      
      // Handle file upload if provided
      if (file) {
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
                  reject(error);
                } else {
                  resolve(info);
                }
              }
            );
          });

          if (fileInfo) {
            updateData.image = (fileInfo as any).url;
          }
        } catch (error) {
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
      
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update category: ${error.message}`
      );
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Check if the category exists
      const category = await this.categoryRepo.findCategoryById(id);
      if (!category) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }
      
      // Check if the category has child categories
      const hasChildren = await this.categoryRepo.categoryHasChildren(id);
      if (hasChildren) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Cannot delete category with child categories. Please move or delete the child categories first.'
        );
      }
      
      // Delete the category's image from storage if it exists
      if (category.image) {
        try {
          await this.multerS3Service.deleteFile(category.image);
        } catch (error) {
          // Just log the error but continue with category deletion
          this.logger.error(`Failed to delete category image: ${error.message}`);
        }
      }
      
      // Delete the category
      const result = await this.categoryRepo.deleteCategory(id);
      
      if (!result) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete category'
        );
      }
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete category: ${error.message}`
      );
    }
  }
}
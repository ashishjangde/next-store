import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CategoryRepository } from 'src/repositories/category-repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import ApiError from 'src/common/responses/ApiError';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly multerS3ConfigService: MulterS3ConfigService
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto, file?: Express.Multer.File): Promise<CategoryResponseDto> {
    // Check if category with the same slug already exists
    const existingCategory = await this.categoryRepository.findCategoryBySlug(createCategoryDto.slug);
    if (existingCategory) {
      throw new ApiError(HttpStatus.CONFLICT, 'Category with this slug already exists');
    }

    // Upload the image to S3 if provided
    if (file) {
      try {
        // Use the MulterS3ConfigService to handle file upload
        const multerOptions = this.multerS3ConfigService.createMulterOptions('categoryImage');
        
        // Use the storage to handle the file
        await new Promise<void>((resolve, reject) => {
          multerOptions.storage._handleFile({}, file, (err: any, info: any) => {
            if (err) {
              this.logger.error(`Failed to upload image: ${err.message}`);
              reject(err);
            } else {
              // Update the DTO with the image URL
              createCategoryDto.image = info.url;
              resolve();
            }
          });
        });
      } catch (error) {
        this.logger.error(`Error uploading category image: ${error.message}`, error.stack);
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Error uploading image');
      }
    }

    const category = await this.categoryRepository.createCategory(createCategoryDto);
    if (!category) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create category');
    }

    return plainToClass(CategoryResponseDto, category);
  }

  async getAllCategories(includeInactive: boolean = false): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAllCategories(includeInactive);
    return plainToClass(CategoryResponseDto, categories);
  }

  async getFeaturedCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findFeaturedCategories();
    return plainToClass(CategoryResponseDto, categories);
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findCategoryById(id);
    if (!category) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
    }

    return plainToClass(CategoryResponseDto, category);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findCategoryBySlug(slug);
    if (!category) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
    }

    return plainToClass(CategoryResponseDto, category);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, file?: Express.Multer.File): Promise<CategoryResponseDto> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findCategoryById(id);
    if (!existingCategory) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
    }

    // If slug is being updated, check that it's not already in use by another category
    if (updateCategoryDto.slug && updateCategoryDto.slug !== existingCategory.slug) {
      const categoryWithSlug = await this.categoryRepository.findCategoryBySlug(updateCategoryDto.slug);
      if (categoryWithSlug && categoryWithSlug.id !== id) {
        throw new ApiError(HttpStatus.CONFLICT, 'Category with this slug already exists');
      }
    }

    // Handle file upload if an image is provided
    if (file) {
      try {
        // Delete the old image if it exists
        if (existingCategory.image) {
          await this.multerS3ConfigService.deleteFile(existingCategory.image);
        }

        // Upload the new image
        const multerOptions = this.multerS3ConfigService.createMulterOptions('categoryImage');
        
        // Use the storage to handle the file
        await new Promise<void>((resolve, reject) => {
          multerOptions.storage._handleFile({}, file, (err: any, info: any) => {
            if (err) {
              this.logger.error(`Failed to upload image: ${err.message}`);
              reject(err);
            } else {
              // Update the DTO with the image URL
              updateCategoryDto.image = info.url;
              resolve();
            }
          });
        });
      } catch (error) {
        this.logger.error(`Error uploading category image: ${error.message}`, error.stack);
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Error uploading image');
      }
    }

    const updatedCategory = await this.categoryRepository.updateCategory(id, updateCategoryDto);
    if (!updatedCategory) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update category');
    }

    return plainToClass(CategoryResponseDto, updatedCategory);
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findCategoryById(id);
    if (!existingCategory) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
    }

    // Check if category has products
    const productCount = await this.categoryRepository.countProductsInCategory(id);
    if (productCount > 0) {
      throw new ApiError(
        HttpStatus.CONFLICT, 
        `Cannot delete category with products. This category has ${productCount} product(s)`
      );
    }

    // Delete the category image if it exists
    if (existingCategory.image) {
      try {
        await this.multerS3ConfigService.deleteFile(existingCategory.image);
      } catch (error) {
        this.logger.error(`Failed to delete category image: ${error.message}`, error.stack);
        // Continue with deletion even if image deletion failed
      }
    }

    const result = await this.categoryRepository.deleteCategory(id);
    if (!result) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete category');
    }
  }
}

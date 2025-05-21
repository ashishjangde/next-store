import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ProductRepository } from 'src/repositories/product-repository';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { CategoryRepository } from 'src/repositories/category-repository';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';
import { Prisma } from '@prisma/client';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { ProductVariationCreateDto } from './dto/product-variation-create.dto';
import { ProductVariationResponseDto } from './dto/product-variation-response.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepo: ProductRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly multerS3Service: MulterS3ConfigService
  ) {}

  async createProduct(
    vendorId: string,
    productCreateDto: ProductCreateDto,
    files: Express.Multer.File[] = []
  ) {
    this.logger.debug(`Creating new product: ${productCreateDto.title}`);
    
    // Check if category exists
    const category = await this.categoryRepo.findCategoryById(productCreateDto.category_id);
    if (!category) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Category not found'
      );
    }
    
    // Upload images
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.uploadProductImages(files);
    }
    
    // Prepare product data
    const productData: Prisma.ProductCreateInput = {
      title: productCreateDto.title,
      description: productCreateDto.description,
      sku: productCreateDto.sku,
      price: productCreateDto.price,
      brand: productCreateDto.brand,
      gender: productCreateDto.gender,
      season: productCreateDto.season,
      weight: productCreateDto.weight,
      color_name: productCreateDto.color_name,
      color_family: productCreateDto.color_family,
      is_active: productCreateDto.is_active !== undefined ? productCreateDto.is_active : true,
      images: imageUrls,
      category: {
        connect: {
          id: productCreateDto.category_id
        }
      },
      Vendor: {
        connect: {
          id: vendorId
        }
      }
    };
    
    // Create product in database
    const product = await this.productRepo.createProduct(productData);
    
    if (!product) {
      // Cleanup uploaded images if product creation fails
      await this.deleteProductImages(imageUrls);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create product'
      );
    }
    
    // Create inventory record
    if (productCreateDto.quantity >= 0) {
      await this.inventoryRepo.createInventory({
        Product: {
          connect: {
            id: product.id
          }
        },
        quantity: productCreateDto.quantity,
        low_stock_threshold: productCreateDto.low_stock_threshold || 10
      });
    }
    
    // Add attribute values
    if (productCreateDto.attribute_value_ids && productCreateDto.attribute_value_ids.length > 0) {
      for (const attributeValueId of productCreateDto.attribute_value_ids) {
        await this.productRepo.addAttributeValueToProduct(product.id, attributeValueId);
      }
    }
    
    this.logger.debug(`Product created successfully: ${product.id}`);
    
    // Get complete product with relationships
    const completeProduct = await this.productRepo.findProductById(
      product.id,
      true, // include variations
      true, // include attributes
      true, // include inventory
      true, // include category
      true  // include vendor
    );
    
    return plainToClass(ProductResponseDto, completeProduct, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async updateProduct(
    id: string,
    vendorId: string, // Used to verify the vendor owns this product
    productUpdateDto: ProductUpdateDto,
    files: Express.Multer.File[] = [],
    deleteImageUrls: string[] = []
  ) {
    this.logger.debug(`Updating product: ${id}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(id);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this product'
      );
    }
    
    // If category_id is provided, check if it exists
    if (productUpdateDto.category_id) {
      const category = await this.categoryRepo.findCategoryById(productUpdateDto.category_id);
      if (!category) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }
    }
    
    // Handle image updates
    let updatedImages = [...existingProduct.images];
    
    // Delete images if specified
    if (deleteImageUrls && deleteImageUrls.length > 0) {
      for (const imageUrl of deleteImageUrls) {
        await this.multerS3Service.deleteFile(imageUrl);
        updatedImages = updatedImages.filter(url => url !== imageUrl);
      }
    }
    
    // Upload new images
    if (files && files.length > 0) {
      const newImageUrls = await this.uploadProductImages(files);
      updatedImages = [...updatedImages, ...newImageUrls];
    }
    
    // Prepare update data
    const updateData: Prisma.ProductUpdateInput = {
      ...productUpdateDto,
      ...(updatedImages.length > 0 && { images: updatedImages }),
      ...(productUpdateDto.category_id && {
        category: {
          connect: {
            id: productUpdateDto.category_id
          }
        }
      })
    };
    
    // Update product in database
    const product = await this.productRepo.updateProduct(id, updateData);
    
    if (!product) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update product'
      );
    }
    
    // Get complete product with relationships
    const completeProduct = await this.productRepo.findProductById(
      product.id,
      true, // include variations
      true, // include attributes
      true, // include inventory
      true, // include category
      true  // include vendor
    );
    
    return plainToClass(ProductResponseDto, completeProduct, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getProduct(
    id: string,
    includeVariations: boolean = true,
    includeAttributes: boolean = true,
    includeInventory: boolean = true,
    includeCategory: boolean = true,
    includeVendor: boolean = true
  ) {
    this.logger.debug(`Getting product: ${id}`);
    
    const product = await this.productRepo.findProductById(
      id,
      includeVariations,
      includeAttributes,
      includeInventory,
      includeCategory,
      includeVendor
    );
    
    if (!product) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    // If the product is archived and inactive, only admin and the vendor should see it
    if (product.archived && !product.is_active) {
      // In a real-world scenario, we would check user roles here
      // For now, we'll allow everyone to see it
    }
    
    return plainToClass(ProductResponseDto, product, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {},
    sort: Record<string, 'asc' | 'desc'> = { created_at: 'desc' },
    includeVariations: boolean = false,
    includeAttributes: boolean = false,
    includeInventory: boolean = false,
    includeCategory: boolean = false
  ) {
    this.logger.debug(`Getting all products. Page: ${page}, Limit: ${limit}`);
    
    // Public users should only see active, non-archived products
    const isAdmin = filters.isAdminRequest === true;
    if (!isAdmin) {
      filters.is_active = true;
      filters.archived = false;
    }
    delete filters.isAdminRequest;
    
    const result = await this.productRepo.findAllProducts(
      page,
      limit,
      filters,
      sort,
      includeVariations,
      includeAttributes,
      includeInventory,
      includeCategory
    );
    
    return {
      data: plainToClass(ProductResponseDto, result.data, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      }),
      total: result.total,
      page,
      limit
    };
  }

  async deleteProduct(id: string, vendorId: string, permanent: boolean = false) {
    this.logger.debug(`Deleting product: ${id}, Permanent: ${permanent}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(id);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to delete this product'
      );
    }
    
    let success = false;
    
    if (permanent) {
      // Delete product images
      if (existingProduct.images && existingProduct.images.length > 0) {
        await this.deleteProductImages(existingProduct.images);
      }
      
      // Hard delete
      success = await this.productRepo.hardDeleteProduct(id);
    } else {
      // Soft delete
      success = await this.productRepo.softDeleteProduct(id);
    }
    
    if (!success) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete product'
      );
    }
    
    return { success: true };
  }

  async addVariation(
    productId: string,
    vendorId: string,
    variationDto: ProductVariationCreateDto,
    files: Express.Multer.File[] = []
  ) {
    this.logger.debug(`Adding variation to product: ${productId}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(productId);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this product'
      );
    }
    
    // Check if variation with this size and color already exists
    const existingVariations = await this.productRepo.findProductById(productId, true);
    const sizeColorMatch = existingVariations.Variations?.find(
      v => v.size === variationDto.size && v.color === variationDto.color
    );
    
    if (sizeColorMatch) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        `A variation with size ${variationDto.size} and color ${variationDto.color} already exists`
      );
    }
    
    // Upload variation images
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.uploadProductImages(files);
    }
    
    // Create variation
    const variation = await this.productRepo.createProductVariation({
      size: variationDto.size,
      color: variationDto.color,
      sku: variationDto.sku,
      price_mod: variationDto.price_mod,
      images: imageUrls,
      Product: {
        connect: {
          id: productId
        }
      }
    });
    
    if (!variation) {
      // Cleanup uploaded images if variation creation fails
      await this.deleteProductImages(imageUrls);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create product variation'
      );
    }
    
    // Create inventory record for this variation
    if (variationDto.quantity >= 0) {
      await this.inventoryRepo.createVariationInventory({
        Variation: {
          connect: {
            id: variation.id
          }
        },
        quantity: variationDto.quantity,
        low_stock_threshold: variationDto.low_stock_threshold || 5,
        reserved_quantity: 0
      });
    }
    
    // Get complete variation with inventory
    const completeVariation = await this.productRepo.findProductVariationById(
      variation.id,
      true // include inventory
    );
    
    return plainToClass(ProductVariationResponseDto, completeVariation, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async deleteVariation(
    productId: string,
    variationId: string,
    vendorId: string
  ) {
    this.logger.debug(`Deleting variation: ${variationId} from product: ${productId}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(productId);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this product'
      );
    }
    
    // Check if variation exists and belongs to this product
    const variation = await this.productRepo.findProductVariationById(variationId);
    
    if (!variation) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Variation not found');
    }
    
    if (variation.product_id !== productId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Variation does not belong to this product'
      );
    }
    
    // Delete variation images
    if (variation.images && variation.images.length > 0) {
      await this.deleteProductImages(variation.images);
    }
    
    // Delete variation
    const success = await this.productRepo.deleteProductVariation(variationId);
    
    if (!success) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete variation'
      );
    }
    
    return { success: true };
  }

  async addAttributeValueToProduct(productId: string, attributeValueId: string, vendorId: string) {
    this.logger.debug(`Adding attribute value to product: ${productId}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(productId);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this product'
      );
    }
    
    // Add attribute value
    const success = await this.productRepo.addAttributeValueToProduct(
      productId,
      attributeValueId
    );
    
    if (!success) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add attribute value to product'
      );
    }
    
    // Get updated product
    const updatedProduct = await this.productRepo.findProductById(
      productId,
      false, // include variations
      true,  // include attributes
      false, // include inventory
      false, // include category
      false  // include vendor
    );
    
    return plainToClass(ProductResponseDto, updatedProduct, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  async removeAttributeValueFromProduct(productId: string, attributeValueId: string, vendorId: string) {
    this.logger.debug(`Removing attribute value from product: ${productId}`);
    
    // Check if product exists and belongs to this vendor
    const existingProduct = await this.productRepo.findProductById(productId);
    
    if (!existingProduct) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
    }
    
    if (existingProduct.vendor_id !== vendorId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        'You are not authorized to update this product'
      );
    }
    
    // Remove attribute value
    const success = await this.productRepo.removeAttributeValueFromProduct(
      productId,
      attributeValueId
    );
    
    if (!success) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove attribute value from product'
      );
    }
    
    // Get updated product
    const updatedProduct = await this.productRepo.findProductById(
      productId,
      false, // include variations
      true,  // include attributes
      false, // include inventory
      false, // include category
      false  // include vendor
    );
    
    return plainToClass(ProductResponseDto, updatedProduct, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true
    });
  }

  // Helper methods for image handling
  private async uploadProductImages(files: Express.Multer.File[]): Promise<string[]> {
    this.logger.debug(`Uploading ${files.length} product images`);
    
    const uploadPromises = files.map(async (file) => {
      try {
        const multerOptions = this.multerS3Service.createMulterOptions('productImages');
        return new Promise<string>((resolve, reject) => {
          multerOptions.storage._handleFile(
            { file } as any,
            file,
            (error: any, info: any) => {
              if (error) {
                this.logger.error(`Upload handler error: ${error.message}`, error.stack);
                reject(error);
              } else {
                this.logger.debug(`Upload successful: ${JSON.stringify(info)}`);
                resolve(info.url);
              }
            }
          );
        });
      } catch (error) {
        this.logger.error(`File upload error: ${error.message}`, error.stack);
        throw error;
      }
    });
    
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error(`Error in batch image upload: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload product images'
      );
    }
  }

  private async deleteProductImages(imageUrls: string[]): Promise<void> {
    this.logger.debug(`Deleting ${imageUrls.length} product images`);
    
    const deletePromises = imageUrls.map(url => this.multerS3Service.deleteFile(url));
    
    try {
      await Promise.all(deletePromises);
    } catch (error) {
      this.logger.error(`Error deleting images: ${error.message}`, error.stack);
      // Log but don't throw, as we don't want to fail the operation if image cleanup fails
    }
  }
}

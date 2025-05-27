import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ProductRepository } from 'src/repositories/product-repository';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { CategoryRepository } from 'src/repositories/category-repository';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';
import { Prisma, ProductType } from '@prisma/client';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { ProductResponseDto, ProductListResponseDto } from './dto/product-response.dto';
import { generateSKU, slugify } from 'src/common/utils/utils';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';

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
    createDto: ProductCreateDto,
    files?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    try {      // Validate category exists
      const category = await this.categoryRepo.findCategoryById(createDto.category_id);
      if (!category) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found');
      }
      
      if (category.level !== 2) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Products can only be added to level 2 categories');
      }

      // Automatically determine product_type based on parent_id
      const productType = createDto.parent_id ? ProductType.VARIANT : ProductType.PARENT;

      // Validate parent product if parent_id is provided
      if (createDto.parent_id) {
        const parentProduct = await this.productRepo.findProductById(createDto.parent_id);
        if (!parentProduct) {
          throw new ApiError(HttpStatus.NOT_FOUND, 'Parent product not found');
        }
        
        if (parentProduct.product_type !== ProductType.PARENT) {
          throw new ApiError(HttpStatus.BAD_REQUEST, 'Parent product must have type PARENT');
        }
        
        if (parentProduct.vendor_id !== vendorId) {
          throw new ApiError(HttpStatus.FORBIDDEN, 'Cannot create variant for another vendor\'s product');
        }
      }     
      const slug = slugify(createDto.title);

      // Handle file uploads
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        try {
          const multerOptions = this.multerS3Service.createMulterOptions('productImages');
          
          for (const file of files) {
            const fileInfo = await new Promise((resolve, reject) => {
              multerOptions.storage._handleFile(
                { file } as any,
                file,
                (error: any, info: any) => {
                  if (error) reject(error);
                  else resolve(info);
                }
              );
            });
            
            if (fileInfo) {
              imageUrls.push((fileInfo as any).url);
            }
          }
        } catch (error) {
          throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload product images');
        }
      }   

      const sku = generateSKU({ brand: createDto.brand, categoryId: createDto.category_id, title: createDto.title, parentId: createDto.parent_id });
      
      const productData = {
        title: createDto.title,
        description: createDto.description,
        slug,
        sku: sku,
        price: createDto.price,
        brand: createDto.brand,
        season: createDto.season,
        weight: createDto.weight,
        product_type: productType,
        images: imageUrls,
        is_active: createDto.is_active,
        vendor_id: vendorId,
        category_id: createDto.category_id,
        parent_id: createDto.parent_id,
        attribute_value_ids: createDto.attribute_value_ids
      };

      const product = await this.productRepo.createProduct(productData);
      if (!product) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create product');
      }

      // Create inventory
      await this.inventoryRepo.createInventory({
        product_id: product.id,
        quantity: createDto.initial_quantity || 0,
        low_stock_threshold: createDto.low_stock_threshold || 10,
        reserved_quantity: 0
      });

      // Add attributes if provided
      if (createDto.attribute_value_ids && createDto.attribute_value_ids.length > 0) {
        for (const attributeValueId of createDto.attribute_value_ids) {
          await this.productRepo.addAttributeToProduct(product.id, attributeValueId);
        }
      }

      // Fetch complete product with relations
      const completeProduct = await this.productRepo.findProductById(
        product.id,
        true, // includeCategory
        true, // includeAttributes
        false // includeChildren
      );

      return plainToClass(ProductResponseDto, this.transformProductResponse(completeProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create product');
    }
  }

  async getProductById(
    id: string,
    includeCategory = false,
    includeAttributes = false,
    includeChildren = false
  ): Promise<ProductResponseDto> {
    try {
      const product = await this.productRepo.findProductById(
        id,
        includeCategory,
        includeAttributes,
        includeChildren
      );

      if (!product || !product.is_active || product.archived) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      // Enhanced product response with parent and siblings information
      const enhancedProduct = await this.enhanceProductWithRelations(product);

      return plainToClass(ProductResponseDto, this.transformProductResponse(enhancedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting product by ID: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve product');
    }
  }

  async getProductBySlug(
    slug: string,
    includeCategory = false,
    includeAttributes = false,
    includeChildren = false
  ): Promise<ProductResponseDto> {
    try {
      // Use the enhanced findProductBySlug method which now leverages Elasticsearch and Redis
      const product = await this.productRepo.findProductBySlug(
        slug,
        includeCategory,
        includeAttributes,
        includeChildren
      );

      if (!product || !product.is_active || product.archived) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      // Enhanced product response with parent and siblings information
      const enhancedProduct = await this.enhanceProductWithRelations(product);

      return plainToClass(ProductResponseDto, this.transformProductResponse(enhancedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting product by slug: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve product');
    }
  }

  async getAllProducts(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    vendorId?: string;
    productType?: ProductType;
    includeCategory?: boolean;
    includeAttributes?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        vendorId,
        productType,
        includeCategory = false,
        includeAttributes = false,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      const result = await this.productRepo.findAllProducts({
        skip,
        take: limit,
        search,
        categoryId,
        vendorId,
        productType,
        includeCategory,
        includeAttributes,
        sortBy,
        sortOrder
      });

      if (!result) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve products');
      }

      const transformedProducts = result.products.map(product => 
        this.transformProductResponse(product)
      );

      return plainToClass(ProductListResponseDto, {
        products: transformedProducts,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting all products: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve products');
    }
  }

  async getVendorVariants(vendorId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      const result = await this.productRepo.findAllProducts({
        skip,
        take: limit,
        search,
        vendorId,
        productType: ProductType.VARIANT,
        includeCategory: true,
        includeAttributes: true,
        sortBy,
        sortOrder
      });

      if (!result) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve variants');
      }

      const transformedProducts = result.products.map(product => 
        this.transformProductResponse(product)
      );

      return plainToClass(ProductListResponseDto, {
        products: transformedProducts,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting vendor variants: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve variants');
    }
  }

  async updateProduct(
    vendorId: string,
    productId: string,
    updateDto: ProductUpdateDto,
    files?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    try {
      const existingProduct = await this.productRepo.findProductById(productId);
      if (!existingProduct) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      if (existingProduct.vendor_id !== vendorId) {
        throw new ApiError(HttpStatus.FORBIDDEN, 'Cannot update another vendor\'s product');
      }

      // Handle file uploads
      let imageUrls = existingProduct.images;
      if (files && files.length > 0) {
        try {
          const multerOptions = this.multerS3Service.createMulterOptions('productImages');          // Keep existing images and add new ones
          const newImageUrls: string[] = [];
          for (const file of files) {
            const fileInfo = await new Promise((resolve, reject) => {
              multerOptions.storage._handleFile(
                { file } as any,
                file,
                (error: any, info: any) => {
                  if (error) reject(error);
                  else resolve(info);
                }
              );
            });
            
            if (fileInfo) {
              newImageUrls.push((fileInfo as any).url);
            }
          }
          
          // Append new images to existing ones
          imageUrls = [...existingProduct.images, ...newImageUrls];
        } catch (error) {
          throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload product images');
        }      }      // Extract inventory-related fields and attribute_value_ids from updateDto
      const { initial_quantity, low_stock_threshold, attribute_value_ids, ...productUpdateData } = updateDto;

      const updateData = {
        ...productUpdateData,
        images: imageUrls,
        ...(updateDto.title && { slug: slugify(updateDto.title) })
      };

      const updatedProduct = await this.productRepo.updateProduct(productId, updateData);

      // Update inventory if inventory fields are provided
      if (initial_quantity !== undefined || low_stock_threshold !== undefined) {
        const inventoryUpdateData: any = {};
        if (initial_quantity !== undefined) {
          inventoryUpdateData.quantity = initial_quantity;
        }
        if (low_stock_threshold !== undefined) {
          inventoryUpdateData.low_stock_threshold = low_stock_threshold;
        }
        
        await this.inventoryRepo.updateInventory(productId, inventoryUpdateData);
      }

      // Update attributes if attribute_value_ids is provided
      if (attribute_value_ids !== undefined && Array.isArray(attribute_value_ids)) {
        // For simplicity, we'll remove all existing attributes and add the new ones
        // First, get existing attributes
        const productWithAttributes = await this.productRepo.findProductById(productId, false, true, false);
        if (productWithAttributes?.attributeValues) {
          // Remove existing attributes
          for (const attrValue of productWithAttributes.attributeValues) {
            await this.productRepo.removeAttributeFromProduct(productId, attrValue.attributeValue.id);
          }
        }
        
        // Add new attributes
        for (const attributeValueId of attribute_value_ids) {
          await this.productRepo.addAttributeToProduct(productId, attributeValueId);
        }
      }
      if (!updatedProduct) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update product');
      }

      return plainToClass(ProductResponseDto, this.transformProductResponse(updatedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update product');
    }
  }

  async deleteProduct(vendorId: string, productId: string): Promise<boolean> {
    try {
      const product = await this.productRepo.findProductById(productId);
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      if (product.vendor_id !== vendorId) {
        throw new ApiError(HttpStatus.FORBIDDEN, 'Cannot delete another vendor\'s product');
      }

      // Delete product images
      for (const image of product.images) {
        try {
          await this.multerS3Service.deleteFile(image);
        } catch (error) {
          this.logger.error(`Failed to delete image: ${error.message}`);
        }
      }

      const success = await this.productRepo.deleteProduct(productId);
      if (!success) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete product');
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error deleting product: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete product');
    }
  }

  async addAttributeToProduct(vendorId: string, productId: string, attributeValueId: string): Promise<ProductResponseDto> {
    try {
      const product = await this.productRepo.findProductById(productId);
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      if (product.vendor_id !== vendorId) {
        throw new ApiError(HttpStatus.FORBIDDEN, 'Cannot modify another vendor\'s product');
      }

      await this.productRepo.addAttributeToProduct(productId, attributeValueId);
      
      const updatedProduct = await this.productRepo.findProductById(
        productId,
        true, // includeCategory
        true, // includeAttributes
        false // includeChildren
      );

      return plainToClass(ProductResponseDto, this.transformProductResponse(updatedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error adding attribute to product: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to add attribute to product');
    }
  }

  async removeAttributeFromProduct(vendorId: string, productId: string, attributeValueId: string): Promise<ProductResponseDto> {
    try {
      const product = await this.productRepo.findProductById(productId);
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found');
      }

      if (product.vendor_id !== vendorId) {
        throw new ApiError(HttpStatus.FORBIDDEN, 'Cannot modify another vendor\'s product');
      }

      const success = await this.productRepo.removeAttributeFromProduct(productId, attributeValueId);
      if (!success) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove attribute from product');
      }
      
      const updatedProduct = await this.productRepo.findProductById(
        productId,
        true, // includeCategory
        true, // includeAttributes
        false // includeChildren
      );

      return plainToClass(ProductResponseDto, this.transformProductResponse(updatedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error removing attribute from product: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove attribute from product');
    }
  }

  async searchProducts(query: string, options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    vendorId?: string;
  }): Promise<ProductListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        categoryId,
        vendorId
      } = options;      const skip = (page - 1) * limit;

      const result = await this.productRepo.searchProducts(
        query,
        page,
        limit,
        {
          categoryId,
          vendorId
        }
      );

      if (!result) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to search products');
      }

      const transformedProducts = result.products.map(product => 
        this.transformProductResponse(product)
      );

      return plainToClass(ProductListResponseDto, {
        products: transformedProducts,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error searching products: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to search products');
    }
  }

  /**
   * Get all parent products for a specific vendor with pagination and filters
   */
  async getVendorParentProducts(
    vendorId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      includeCategory?: boolean;
      includeAttributes?: boolean;
      includeChildren?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<ProductListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        includeCategory = false,
        includeAttributes = false,
        includeChildren = false,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;
      
      const skip = (page - 1) * limit;
      
      const result = await this.productRepo.findVendorParentProducts({
        vendorId,
        skip,
        take: limit,
        search,
        categoryId,
        includeCategory,
        includeAttributes,
        includeChildren,
        sortBy,
        sortOrder
      });
      
      if (!result) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve vendor products');
      }
      
      const transformedProducts = result.products.map(product => 
        this.transformProductResponse(product)
      );
      
      return plainToClass(ProductListResponseDto, {
        products: transformedProducts,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting vendor parent products: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve vendor products');
    }
  }
  
  /**
   * Get a specific product by ID for a vendor
   * Ensures that the product belongs to the specified vendor
   */
  async getVendorProductById(
    vendorId: string,
    productId: string,
    includeCategory = false,
    includeAttributes = false,
    includeChildren = false
  ): Promise<ProductResponseDto> {
    try {
      const product = await this.productRepo.findVendorProductById(
        vendorId,
        productId,
        includeCategory,
        includeAttributes,
        includeChildren
      );
      
      if (!product) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found or does not belong to this vendor');
      }
      
      // Enhanced product response with parent and siblings information
      const enhancedProduct = await this.enhanceProductWithRelations(product);
      
      return plainToClass(ProductResponseDto, this.transformProductResponse(enhancedProduct));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      this.logger.error(`Error getting vendor product by ID: ${error.message}`, error.stack);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve vendor product');
    }
  }

  /**
   * Get featured products for home page display
   * Returns active products with high ratings or marked as featured
   */
  async getFeaturedProducts(limit: number = 8): Promise<ProductResponseDto[]> {
    try {
      const result = await this.productRepo.findAllProducts({
        skip: 0,
        take: limit,
        isActive: true,
        archived: false,
        includeCategory: true,
        includeAttributes: false,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (!result) {
        return [];
      }

      const transformedProducts = result.products.map(product => 
        this.transformProductResponse(product)
      );

      return transformedProducts.map(product => 
        plainToClass(ProductResponseDto, product)
      );
    } catch (error) {
      this.logger.error(`Error getting featured products: ${error.message}`, error.stack);
      return [];
    }
  }

  private transformProductResponse(product: any): any {
    const transformed = {
      id: product.id,
      title: product.title,
      description: product.description,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      images: product.images,
      product_type: product.product_type,
      parent_id: product.parent_id,
      brand: product.brand,
      season: product.season,
      weight: product.weight,
      is_active: product.is_active,
      archived: product.archived,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    if (product.category) {
      transformed['category'] = {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      };
    }

    if (product.Inventory) {
      transformed['inventory'] = {
        quantity: product.Inventory.quantity,
        low_stock_threshold: product.Inventory.low_stock_threshold,
        reserved_quantity: product.Inventory.reserved_quantity
      };
    }    if (product.attributeValues) {
      transformed['attributes'] = product.attributeValues.map((av: any) => ({
        id: av.attributeValue.id,
        name: av.attributeValue.attribute.name,
        value: av.attributeValue.value,
        display_value: av.attributeValue.display_value
      }));
    }

    if (product.children) {
      transformed['children'] = product.children.map((child: any) => this.transformProductResponse(child));
    }

    // Include parent product information if available
    if (product.parent) {
      transformed['parent'] = this.transformProductResponse(product.parent);
    }

    // Include siblings information if available
    if (product.siblings && Array.isArray(product.siblings)) {
      transformed['siblings'] = product.siblings.map((sibling: any) => 
        this.transformProductResponse(sibling)
      );
    }

    return transformed;
  }

  private async enhanceProductWithRelations(product: any): Promise<any> {
    // Make a copy of the product to avoid modifying the original
    const enhancedProduct = { ...product };

    // If product is a variant, fetch its parent and other siblings
    if (product.product_type === ProductType.VARIANT && product.parent_id) {
      try {
        // Fetch parent product with all its variants (siblings)
        const parentProduct = await this.productRepo.findProductById(
          product.parent_id,
          true, // includeCategory
          true, // includeAttributes
          true  // includeChildren - this will include all siblings
        );

        if (parentProduct) {
          // Add parent data to the enhanced product
          enhancedProduct.parent = this.transformProductResponse(parentProduct);
          
          // Add siblings (excluding the current product)
          if (parentProduct.children && Array.isArray(parentProduct.children)) {
            enhancedProduct.siblings = parentProduct.children
              .filter(sibling => sibling.id !== product.id) // Exclude current product
              .map(sibling => this.transformProductResponse(sibling));
          }
        }
      } catch (error) {
        this.logger.error(`Error fetching parent and siblings: ${error.message}`, error.stack);
      }
    } 
    // If product is a parent, make sure children/variants are included
    else if (product.product_type === ProductType.PARENT && !product.children) {
      try {
        // Fetch variants if they weren't already included
        const variants = await this.productRepo.findVariantsByParentId(product.id);
        if (variants && Array.isArray(variants) && variants.length > 0) {
          enhancedProduct.children = variants;
        }
      } catch (error) {
        this.logger.error(`Error fetching variants: ${error.message}`, error.stack);
      }
    }

    return enhancedProduct;
  }
}

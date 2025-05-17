import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ProductRepository } from '../../repositories/product-repository';
import { InventoryService } from '../inventory/inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createProductDto: CreateProductDto, vendorId: string) {
    try {
      const product = await this.productRepository.createProduct({
        ...createProductDto,
        vendor_id: vendorId,
      });

      if (!product) {
        throw new BadRequestException('Failed to create product');
      }

      // Create initial inventory with 0 quantity
      await this.inventoryService.createInventory({
        product_id: product.id,
        quantity: 0,
      });

      return product;
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: ProductQueryDto) {
    try {
      const { page, limit, orderBy, order, category_id, vendor_id, search, min_price, max_price } = query;
      
      // Build where clause based on query params
      const where: any = {};
      
      if (category_id) {
        where.category_id = category_id;
      }
      
      if (vendor_id) {
        where.vendor_id = vendor_id;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (min_price !== undefined || max_price !== undefined) {
        where.price = {};
        
        if (min_price !== undefined) {
          where.price.gte = min_price;
        }
        
        if (max_price !== undefined) {
          where.price.lte = max_price;
        }
      }
      
      return await this.productRepository.findAllProducts(
        page,
        limit,
        orderBy,
        order,
        where,
      );
    } catch (error) {
      this.logger.error(`Error finding products: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productRepository.findProductById(id);
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      
      return product;
    } catch (error) {
      this.logger.error(`Error finding product: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByVendorId(vendorId: string, query: ProductQueryDto) {
    try {
      const { page, limit } = query;
      return await this.productRepository.findProductsByVendorId(vendorId, page, limit);
    } catch (error) {
      this.logger.error(`Error finding vendor products: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByCategoryId(categoryId: string, query: ProductQueryDto) {
    try {
      const { page, limit } = query;
      return await this.productRepository.findProductsByCategoryId(categoryId, page, limit);
    } catch (error) {
      this.logger.error(`Error finding category products: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Check if product exists
      const exists = await this.productRepository.productExists(id);
      
      if (!exists) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      
      const updatedProduct = await this.productRepository.updateProduct(id, updateProductDto);
      
      if (!updatedProduct) {
        throw new BadRequestException('Failed to update product');
      }
      
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if product exists
      const exists = await this.productRepository.productExists(id);
      
      if (!exists) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      
      const deleted = await this.productRepository.deleteProduct(id);
      
      if (!deleted) {
        throw new BadRequestException('Failed to delete product');
      }
      
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting product: ${error.message}`, error.stack);
      throw error;
    }
  }
}

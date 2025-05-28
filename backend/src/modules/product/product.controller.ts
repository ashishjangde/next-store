import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/decorators/roles-decorator';
import { GetUser } from '../../common/decorators/user.decorator';
import { Roles, ProductType, Users } from '@prisma/client';
import ApiResponseClass from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import ApiError from 'src/common/responses/ApiError';

import { ProductService } from './product.service';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { VendorRepositories } from '../../repositories/vendor-repositories';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly vendorRepository: VendorRepositories,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product. Only vendors can create products.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation failed',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed'),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Category level must be 2 or parent product type mismatch',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Invalid category or parent'),
  })  async createProduct(
    @Body() createProductDto: ProductCreateDto,
    @UploadedFiles() images: Express.Multer.File[],
    @GetUser() user: Users,
  ) {
      // Get vendor information using user ID
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // Use vendor.id if exists, otherwise user.id (for admin users)
      const vendorId = vendor?.id || user.id;

      const product = await this.productService.createProduct(vendorId, createProductDto, images);
      return new ApiResponseClass(product);
   
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products with pagination and search',
    description: 'Retrieve products with optional filters, search, and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'category_id', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'vendor_id', required: false, type: String, description: 'Filter by vendor' })
  @ApiQuery({ name: 'product_type', required: false, enum: ProductType, description: 'Filter by product type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
  })
  async getAllProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
    @Query('vendor_id') vendorId?: string,
    @Query('product_type') productType?: ProductType,
  ) {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const result = await this.productService.getAllProducts({
        page: pageNum,
        limit: limitNum,
        search,
        categoryId,
        vendorId,
        productType,
      });

      return new ApiResponseClass(result);
   
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Retrieve a single product by its slug with optional includes for category, attributes, and children',
  })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiQuery({ name: 'include_category', required: false, type: Boolean, description: 'Include category details' })
  @ApiQuery({ name: 'include_attributes', required: false, type: Boolean, description: 'Include product attributes' })
  @ApiQuery({ name: 'include_children', required: false, type: Boolean, description: 'Include child products/variants' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found'),
  })
  async getProductBySlug(
    @Param('slug') slug: string,
    @Query('include_category') includeCategory: string = 'false',
    @Query('include_attributes') includeAttributes: string = 'false',
    @Query('include_children') includeChildren: string = 'false',
  ) {
    const product = await this.productService.getProductBySlug(
      slug,
      includeCategory === 'true',
      includeAttributes === 'true',
      includeChildren === 'true'
    );

    return new ApiResponseClass(product);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID or slug',
    description: 'Retrieve a single product with optional includes for category, attributes, and children',
  })
  @ApiParam({ name: 'id', description: 'Product ID or slug' })
  @ApiQuery({ name: 'include_category', required: false, type: Boolean, description: 'Include category details' })
  @ApiQuery({ name: 'include_attributes', required: false, type: Boolean, description: 'Include product attributes' })
  @ApiQuery({ name: 'include_children', required: false, type: Boolean, description: 'Include child products/variants' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found'),
  })
  async getProductById(
    @Param('id') id: string,
    @Query('include_category') includeCategory: string = 'false',
    @Query('include_attributes') includeAttributes: string = 'false',
    @Query('include_children') includeChildren: string = 'false',
  ) {

      const product = await this.productService.getProductById(
        id,
        includeCategory === 'true',
        includeAttributes === 'true',
        includeChildren === 'true'
      );

      return new ApiResponseClass(product);
   
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update an existing product. Vendors can only update their own products.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found'),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this product',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Unauthorized'),
  })  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: ProductUpdateDto,
    @UploadedFiles() images: Express.Multer.File[],
    @GetUser() user: Users,
  ) {
      // Get vendor information using user ID
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // Use vendor.id if exists, otherwise user.id (for admin users)
      const vendorId = vendor?.id || user.id;

      const product = await this.productService.updateProduct(vendorId, id, updateProductDto, images);

      return new ApiResponseClass(product);
   
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete product',
    description: 'Delete a product. Vendors can only delete their own products.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found'),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this product',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Unauthorized'),
  })
  async deleteProduct(@Param('id') id: string, @GetUser() user: Users) {

      // Get vendor information using user ID - following original pattern
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // Use vendor.id if exists, otherwise user.id (for admin users)
      const vendorId = vendor?.id || user.id;

      await this.productService.deleteProduct(vendorId, id);

      return new ApiResponseClass({ message: 'Product deleted successfully' });
  
  }

  // Attribute management routes
  @Post(':id/attributes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add attribute to product',
    description: 'Add an attribute value to a product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async addAttributeToProduct(
    @Param('id') productId: string,
    @Body() body: { attributeValueId: string },
    @GetUser() user: Users,
  ) {
      // Get vendor information using user ID - following original pattern
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // Use vendor.id if exists, otherwise user.id (for admin users)
      const vendorId = vendor?.id || user.id;

      const result = await this.productService.addAttributeToProduct(vendorId, productId, body.attributeValueId);

      return new ApiResponseClass(result);
   
  }

  @Delete(':id/attributes/:attributeValueId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove attribute from product',
    description: 'Remove an attribute value from a product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'attributeValueId', description: 'Attribute Value ID' })
  async removeAttributeFromProduct(
    @Param('id') productId: string,
    @Param('attributeValueId') attributeValueId: string,
    @GetUser() user: Users,
  ) {
      // Get vendor information using user ID - following original pattern
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // Use vendor.id if exists, otherwise user.id (for admin users)
      const vendorId = vendor?.id || user.id;

      const result = await this.productService.removeAttributeFromProduct(vendorId, productId, attributeValueId);

      return new ApiResponseClass(result);
   
  }

  /**
   * Routes for vendor parent products
   */
  @Get('vendor/parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all parent products for the authenticated vendor',
    description: 'Retrieve all parent products for the vendor with optional filters, search, and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'category_id', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'include_category', required: false, type: Boolean, description: 'Include category details' })
  @ApiQuery({ name: 'include_attributes', required: false, type: Boolean, description: 'Include product attributes' })
  @ApiQuery({ name: 'include_children', required: false, type: Boolean, description: 'Include child products/variants' })
  @ApiQuery({ name: 'sort_by', required: false, type: String, description: 'Field to sort by (created_at, title, price)' })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parent products retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized'),
  })
  async getVendorParentProducts(
    @GetUser() user: Users,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
    @Query('include_category') includeCategory: string = 'false',
    @Query('include_attributes') includeAttributes: string = 'false',
    @Query('include_children') includeChildren: string = 'false',
    @Query('sort_by') sortBy: string = 'created_at',
    @Query('sort_order') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
      // Get vendor information using user ID
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {
        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to access vendor products'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const result = await this.productService.getVendorParentProducts(
        vendorId,
        {
          page: pageNum,
          limit: limitNum,
          search,
          categoryId,
          includeCategory: includeCategory === 'true',
          includeAttributes: includeAttributes === 'true',
          includeChildren: includeChildren === 'true',
          sortBy,
          sortOrder
        }
      );
      
      return new ApiResponseClass(result);
    
  }
  
  @Get('vendor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a specific vendor product by ID',
    description: 'Retrieve a product that belongs to the authenticated vendor',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'include_category', required: false, type: Boolean, description: 'Include category details' })
  @ApiQuery({ name: 'include_attributes', required: false, type: Boolean, description: 'Include product attributes' })
  @ApiQuery({ name: 'include_children', required: false, type: Boolean, description: 'Include child products/variants' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or does not belong to this vendor',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found or does not belong to this vendor'),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized'),
  })
  async getVendorProductById(
    @GetUser() user: Users,
    @Param('id') productId: string,
    @Query('include_category') includeCategory: string = 'false',
    @Query('include_attributes') includeAttributes: string = 'false',
    @Query('include_children') includeChildren: string = 'false',
  ) {
      // Get vendor information using user ID
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {
        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to access vendor products'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const product = await this.productService.getVendorProductById(
        vendorId,
        productId,
        includeCategory === 'true',
        includeAttributes === 'true',
        includeChildren === 'true'
      );
      
      return new ApiResponseClass(product);
    
  }
}

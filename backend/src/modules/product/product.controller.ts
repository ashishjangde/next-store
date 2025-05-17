import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/decorators/roles-decorator';
import { Roles } from '@prisma/client';
import { Public } from '../../common/decorators/public-decorator';
import { ApiCustomResponse } from '../../common/responses/ApiResponse';
import ApiError, { ApiCustomErrorResponse } from '../../common/responses/ApiError';
import CustomApiResponse from '../../common/responses/ApiResponse';
import { Request } from 'express';

// Extended Request type that includes the user property
interface RequestWithUser extends Request {
  user: {
    id: string;
    roles: Roles[];
    [key: string]: any;
  };
}

@ApiTags('Products')
@Controller('products')
@ApiExtraModels(ProductResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Admin and vendor only endpoint to create a new product'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    schema: ApiCustomResponse(ProductResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin or vendor access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Forbidden - Admin or vendor access required')
  })
  async create(@Body() createProductDto: CreateProductDto, @Req() req: RequestWithUser) {
    const product = await this.productService.create(createProductDto, req.user.id);
    return new CustomApiResponse(product);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Get all products with optional filtering and pagination'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    schema: ApiCustomResponse([ProductResponseDto])
  })
  async findAll(@Query() query: ProductQueryDto) {
    const products = await this.productService.findAll(query);
    return new CustomApiResponse(products);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Get a specific product by its ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    schema: ApiCustomResponse(ProductResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found')
  })
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return new CustomApiResponse(product);
  }

  @Get('vendor/:vendorId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get products by vendor ID',
    description: 'Admin and vendor only endpoint to get products for a specific vendor'
  })
  @ApiParam({
    name: 'vendorId',
    description: 'Vendor ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    schema: ApiCustomResponse([ProductResponseDto])
  })
  async findByVendorId(@Param('vendorId') vendorId: string, @Query() query: ProductQueryDto, @Req() req: RequestWithUser) {
    // Only allow vendors to see their own products unless the user is an admin
    if (req.user.roles.includes(Roles.VENDOR) && !req.user.roles.includes(Roles.ADMIN)) {
      if (req.user.id !== vendorId) {
        const error = new ApiError(HttpStatus.FORBIDDEN, 'You can only view your own products');
        return new CustomApiResponse([], error);
      }
    }
    
    const products = await this.productService.findByVendorId(vendorId, query);
    return new CustomApiResponse(products);
  }

  @Get('category/:categoryId')
  @Public()
  @ApiOperation({
    summary: 'Get products by category ID',
    description: 'Get products for a specific category'
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    schema: ApiCustomResponse([ProductResponseDto])
  })
  async findByCategoryId(@Param('categoryId') categoryId: string, @Query() query: ProductQueryDto) {
    const products = await this.productService.findByCategoryId(categoryId, query);
    return new CustomApiResponse(products);
  }

  @Put(':id')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product',
    description: 'Admin and vendor only endpoint to update a product'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    schema: ApiCustomResponse(ProductResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - You can only update your own products',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'You can only update your own products')
  })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: RequestWithUser) {
    // Check if product belongs to the vendor (unless the user is an admin)
    if (req.user.roles.includes(Roles.VENDOR) && !req.user.roles.includes(Roles.ADMIN)) {
      const product = await this.productService.findOne(id);
      if (product.vendor_id !== req.user.id) {
        const error = new ApiError(HttpStatus.FORBIDDEN, 'You can only update your own products');
        return new CustomApiResponse(null, error);
      }
    }
    
    const product = await this.productService.update(id, updateProductDto);
    return new CustomApiResponse(product);
  }

  @Delete(':id')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product',
    description: 'Admin and vendor only endpoint to delete a product'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
    schema: ApiCustomResponse({ message: 'Product deleted successfully' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - You can only delete your own products',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'You can only delete your own products')
  })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Check if product belongs to the vendor (unless the user is an admin)
    if (req.user.roles.includes(Roles.VENDOR) && !req.user.roles.includes(Roles.ADMIN)) {
      const product = await this.productService.findOne(id);
      if (product.vendor_id !== req.user.id) {
        const error = new ApiError(HttpStatus.FORBIDDEN, 'You can only delete your own products');
        return new CustomApiResponse(null, error);
      }
    }
    
    await this.productService.remove(id);
    return new CustomApiResponse({ message: 'Product deleted successfully' });
  }
}

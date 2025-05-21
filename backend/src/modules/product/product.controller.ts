import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, 
  UseGuards, HttpStatus, UseInterceptors, UploadedFiles, UploadedFile
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiQuery, 
  ApiConsumes, ApiBody, ApiParam, ApiExtraModels 
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { Roles } from '@prisma/client';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { ProductVariationCreateDto } from './dto/product-variation-create.dto';
import { ProductResponseDto, ProductListResponseDto } from './dto/product-response.dto';
import { ProductVariationResponseDto } from './dto/product-variation-response.dto';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import ApiResponse from 'src/common/responses/ApiResponse';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public-decorator';

@Controller('products')
@ApiTags('Products')
@ApiExtraModels(ProductResponseDto, ProductListResponseDto, ProductVariationResponseDto)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({
    summary: 'Create a product',
    description: 'Create a new product with optional multiple images',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: false }))
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    schema: ApiCustomResponse(ProductResponseDto),
  })
  async createProduct(
    @Body() createDto: ProductCreateDto,
    @GetUser('id') vendorId: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.createProduct(
      vendorId,
      createDto,
      files,
    );
    return new ApiResponse<ProductResponseDto>(product);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve all products with filtering and pagination',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search in title, description, brand',
  })
  @ApiQuery({
    name: 'price_min',
    type: Number,
    required: false,
    description: 'Min price',
  })
  @ApiQuery({
    name: 'price_max',
    type: Number,
    required: false,
    description: 'Max price',
  })
  @ApiQuery({
    name: 'brand',
    type: String,
    required: false,
    description: 'Filter by brand',
  })
  @ApiQuery({
    name: 'color',
    type: String,
    required: false,
    description: 'Filter by color family',
  })
  @ApiQuery({
    name: 'gender',
    type: String,
    required: false,
    description: 'Filter by gender',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort field:direction (e.g. price:asc, created_at:desc)',
  })
  @ApiQuery({
    name: 'includeVariations',
    type: Boolean,
    required: false,
    description: 'Include product variations',
  })
  @ApiQuery({
    name: 'includeAttributes',
    type: Boolean,
    required: false,
    description: 'Include product attributes',
  })
  @ApiQuery({
    name: 'includeInventory',
    type: Boolean,
    required: false,
    description: 'Include inventory information',
  })
  @ApiQuery({
    name: 'includeCategory',
    type: Boolean,
    required: false,
    description: 'Include category details',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    schema: ApiCustomResponse(ProductListResponseDto),
  })
  async getAllProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('price_min') priceMin?: number,
    @Query('price_max') priceMax?: number,
    @Query('brand') brand?: string,
    @Query('color') colorFamily?: string,
    @Query('gender') gender?: string,
    @Query('sort') sort?: string,
    @Query('includeVariations') includeVariations?: string,
    @Query('includeAttributes') includeAttributes?: string,
    @Query('includeInventory') includeInventory?: string,
    @Query('includeCategory') includeCategory?: string,
  ): Promise<ApiResponse<ProductListResponseDto>> {
    // Build filters object
    const filters: Record<string, any> = {};
    if (categoryId) filters.category_id = categoryId;
    if (search) filters.search = search;
    if (priceMin && priceMax) {
      filters.price_min = priceMin;
      filters.price_max = priceMax;
    }
    if (brand) filters.brand = brand;
    if (colorFamily) filters.color_family = colorFamily;
    if (gender) filters.gender = gender;
    filters.is_active = true; // Public route should only return active products

    // Parse sort parameter
    const sortObj: Record<string, 'asc' | 'desc'> = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj[field] = direction === 'asc' ? 'asc' : 'desc';
    } else {
      sortObj.created_at = 'desc'; // Default sort
    }

    const result = await this.productService.getAllProducts(
      page ? +page : 1,
      limit ? +limit : 10,
      filters,
      sortObj,
      includeVariations === 'true',
      includeAttributes === 'true',
      includeInventory === 'true',
      includeCategory === 'true',
    );

    return new ApiResponse<ProductListResponseDto>(result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Get('admin')
  @ApiOperation({
    summary: 'Admin - Get all products',
    description:
      'Admin access to retrieve all products including inactive and archived',
  })
  @ApiQuery({
    name: 'includeInactive',
    type: Boolean,
    required: false,
    description: 'Include inactive products',
  })
  @ApiQuery({
    name: 'includeArchived',
    type: Boolean,
    required: false,
    description: 'Include archived products',
  })
  // Same other query params as public route...
  async adminGetAllProducts(
    @Query() query: Record<string, any>,
  ): Promise<ApiResponse<ProductListResponseDto>> {
    // Similar implementation as getAllProducts but with admin flags
    const filters = { ...query };
    filters.isAdminRequest = true; // Flag for admin request to bypass active/archived filters

    // Parse sort parameter
    const sortObj: Record<string, 'asc' | 'desc'> = {};
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      sortObj[field] = direction === 'asc' ? 'asc' : 'desc';
    } else {
      sortObj.created_at = 'desc'; // Default sort
    }

    const result = await this.productService.getAllProducts(
      query.page ? +query.page : 1,
      query.limit ? +query.limit : 10,
      filters,
      sortObj,
      query.includeVariations === 'true',
      query.includeAttributes === 'true',
      query.includeInventory === 'true',
      query.includeCategory === 'true',
    );

    return new ApiResponse<ProductListResponseDto>(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Get detailed information about a specific product',
  })
  @ApiQuery({
    name: 'includeVariations',
    type: Boolean,
    required: false,
    description: 'Include product variations',
  })
  @ApiQuery({
    name: 'includeAttributes',
    type: Boolean,
    required: false,
    description: 'Include product attributes',
  })
  @ApiQuery({
    name: 'includeInventory',
    type: Boolean,
    required: false,
    description: 'Include inventory information',
  })
  @ApiQuery({
    name: 'includeCategory',
    type: Boolean,
    required: false,
    description: 'Include category details',
  })
  @ApiQuery({
    name: 'includeVendor',
    type: Boolean,
    required: false,
    description: 'Include vendor details',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Product found',
    schema: ApiCustomResponse(ProductResponseDto),
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found'),
  })
  async getProduct(
    @Param('id') id: string,
    @Query('includeVariations') includeVariations?: string,
    @Query('includeAttributes') includeAttributes?: string,
    @Query('includeInventory') includeInventory?: string,
    @Query('includeCategory') includeCategory?: string,
    @Query('includeVendor') includeVendor?: string,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.getProduct(
      id,
      includeVariations === 'true',
      includeAttributes === 'true',
      includeInventory === 'true',
      includeCategory === 'true',
      includeVendor === 'true',
    );

    return new ApiResponse<ProductResponseDto>(product);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Put(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update an existing product',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: false }))
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    schema: ApiCustomResponse(ProductResponseDto),
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateDto: ProductUpdateDto,
    @GetUser('id') vendorId: string,
    @UploadedFiles() files?: Express.Multer.File[],
    @Body('deleteImages') deleteImages?: string,
  ): Promise<ApiResponse<ProductResponseDto>> {
    // Parse the deleteImages string into an array
    let deleteImageUrls: string[] = [];
    if (deleteImages) {
      try {
        deleteImageUrls = JSON.parse(deleteImages);
      } catch (error) {
        // If parsing fails, assume it's a single URL
        deleteImageUrls = [deleteImages];
      }
    }

    const product = await this.productService.updateProduct(
      id,
      vendorId,
      updateDto,
      files,
      deleteImageUrls,
    );

    return new ApiResponse<ProductResponseDto>(product);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Soft delete (archive) a product or hard delete it permanently',
  })
  @ApiQuery({
    name: 'permanent',
    type: Boolean,
    required: false,
    description: 'Whether to permanently delete the product',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
    schema: ApiCustomResponse({ success: true }),
  })
  async deleteProduct(
    @Param('id') id: string,
    @GetUser('id') vendorId: string,
    @Query('permanent') permanent?: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const result = await this.productService.deleteProduct(
      id,
      vendorId,
      permanent === 'true',
    );

    return new ApiResponse<{ success: boolean }>(result);
  }

  // Variation routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Post(':productId/variations')
  @ApiOperation({
    summary: 'Add product variation',
    description: 'Add a new variation to an existing product',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: false }))
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Variation added successfully',
    schema: ApiCustomResponse(ProductVariationResponseDto),
  })
  async addVariation(
    @Param('productId') productId: string,
    @Body() variationDto: ProductVariationCreateDto,
    @GetUser('id') vendorId: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ApiResponse<ProductVariationResponseDto>> {
    const variation = await this.productService.addVariation(
      productId,
      vendorId,
      variationDto,
      files,
    );

    return new ApiResponse<ProductVariationResponseDto>(variation);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Delete(':productId/variations/:variationId')
  @ApiOperation({
    summary: 'Delete variation',
    description: 'Delete a product variation',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Variation deleted successfully',
    schema: ApiCustomResponse({ success: true }),
  })
  async deleteVariation(
    @Param('productId') productId: string,
    @Param('variationId') variationId: string,
    @GetUser('id') vendorId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const result = await this.productService.deleteVariation(
      productId,
      variationId,
      vendorId,
    );

    return new ApiResponse<{ success: boolean }>(result);
  }

  // Attribute routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Post(':productId/attributes/:attributeValueId')
  @ApiOperation({
    summary: 'Add attribute to product',
    description: 'Assign an attribute value to a product',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute added successfully',
    schema: ApiCustomResponse(ProductResponseDto),
  })
  async addAttributeToProduct(
    @Param('productId') productId: string,
    @Param('attributeValueId') attributeValueId: string,
    @GetUser('id') vendorId: string,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.addAttributeValueToProduct(
      productId,
      attributeValueId,
      vendorId,
    );

    return new ApiResponse<ProductResponseDto>(product);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN, Roles.VENDOR)
  @Delete(':productId/attributes/:attributeValueId')
  @ApiOperation({
    summary: 'Remove attribute from product',
    description: 'Remove an attribute value from a product',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute removed successfully',
    schema: ApiCustomResponse(ProductResponseDto),
  })
  async removeAttributeFromProduct(
    @Param('productId') productId: string,
    @Param('attributeValueId') attributeValueId: string,
    @GetUser('id') vendorId: string,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.removeAttributeValueFromProduct(
      productId,
      attributeValueId,
      vendorId,
    );

    return new ApiResponse<ProductResponseDto>(product);
  }
}

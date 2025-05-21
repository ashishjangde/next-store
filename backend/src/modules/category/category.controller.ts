import { Body, Controller, Get, Post, UseGuards, UploadedFile, UseInterceptors, HttpStatus, Query, Param, Delete, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiExtraModels, ApiOperation, ApiConsumes, ApiResponse as SwaggerResponse, ApiQuery } from '@nestjs/swagger';
import ApiResponse from 'src/common/responses/ApiResponse';
import { CategoryResponseDto } from './dto/category-response-dto';
import { Role } from 'src/common/decorators/roles-decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CategoryCreateDto } from './dto/category-create-dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { Roles } from '@prisma/client';
import { CategoryAttributeResponseDto } from './dto/category-attribute-response.dto';
import { AttributeResponseDto } from '../attribute/dto/attribute-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { Public } from 'src/common/decorators/public-decorator';
import { CategoryAttributeDto } from './dto/category-attribute.dto';

@Controller('categories')
@ApiTags('Categories')
@ApiExtraModels(CategoryResponseDto, CategoryAttributeResponseDto, AttributeResponseDto)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiOperation({
    summary: "Create a new category (Admin only)",
    description: "Create a new category with optional image upload"
  })
  @ApiConsumes('multipart/form-data')
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Category successfully created',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Parent category not found')
  })
  @SwaggerResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @UseInterceptors(FileInterceptor('image', { storage: false }))
  async create(
    @Body() categoryCreateDto: CategoryCreateDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.create(categoryCreateDto, file);
    return new ApiResponse<CategoryResponseDto>(
      plainToClass(CategoryResponseDto, category, { 
        excludeExtraneousValues: false,
        enableImplicitConversion: true 
      })
    );
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: "Get all active categories",
    description: "Retrieve all active categories with pagination (Public access)"
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'parentId', type: String, required: false, description: 'Filter by parent category ID' })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Categories found',
    schema: ApiCustomResponse({ data: [CategoryResponseDto], total: 0, page: 1, limit: 10 })
  })
  async getAllActiveCategories(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('parentId') parentId?: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<{ data: CategoryResponseDto[], total: number, page: number, limit: number }>> {
    const result = await this.categoryService.getAllCategories(
      page ? +page : 1,
      limit ? +limit : 10,
      parentId,
      false, // includeInactive = false for public route
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    
    return new ApiResponse(result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Get('admin')
  @ApiOperation({
    summary: "Get all categories including inactive (Admin only)",
    description: "Retrieve all categories with option to include inactive ones (Admin access only)"
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'parentId', type: String, required: false, description: 'Filter by parent category ID' })
  @ApiQuery({ name: 'includeInactive', type: Boolean, required: false, description: 'Include inactive categories' })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Categories found',
    schema: ApiCustomResponse({ data: [CategoryResponseDto], total: 0, page: 1, limit: 10 })
  })
  async getAllCategoriesAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('parentId') parentId?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<{ data: CategoryResponseDto[], total: number, page: number, limit: number }>> {
    const result = await this.categoryService.getAllCategories(
      page ? +page : 1,
      limit ? +limit : 10,
      parentId,
      includeInactive === 'true',
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    
    return new ApiResponse(result);
  }

  @Public()
  @Get('tree')
  @ApiOperation({
    summary: "Get category tree structure",
    description: "Retrieve all categories in a hierarchical tree structure (root > stem > leaf)"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Category tree retrieved',
    schema: ApiCustomResponse([CategoryResponseDto])
  })
  async getCategoryTree(): Promise<ApiResponse<CategoryResponseDto[]>> {
    const categoryTree = await this.categoryService.getCategoryTree();
    return new ApiResponse<CategoryResponseDto[]>(categoryTree);
  }

  @Public()
  @Get('top-level')
  @ApiOperation({
    summary: "Get top level active categories",
    description: "Retrieve only active root level categories (those without a parent)"
  })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Top level categories retrieved',
    schema: ApiCustomResponse({ data: [CategoryResponseDto], total: 0 })
  })
  async getTopLevelCategories(
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<{ data: CategoryResponseDto[], total: number }>> {
    const result = await this.categoryService.getTopLevelCategories(
      false, // Only active categories
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    return new ApiResponse(result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Get('admin/top-level')
  @ApiOperation({
    summary: "Get all top level categories (Admin only)",
    description: "Retrieve all root level categories with option to include inactive ones (Admin access only)"
  })
  @ApiQuery({
    name: 'includeInactive',
    type: Boolean,
    required: false,
    description: 'Whether to include inactive categories'
  })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Top level categories retrieved',
    schema: ApiCustomResponse({ data: [CategoryResponseDto], total: 0 })
  })
  async getTopLevelCategoriesAdmin(
    @Query('includeInactive') includeInactive?: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<{ data: CategoryResponseDto[], total: number }>> {
    const result = await this.categoryService.getTopLevelCategories(
      includeInactive === 'true',
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    return new ApiResponse(result);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({
    summary: "Get category by slug",
    description: "Retrieve a category by its slug with optional child categories and products"
  })
  @ApiQuery({
    name: 'includeChildren',
    type: Boolean,
    required: false,
    description: 'Whether to include child categories'
  })
  @ApiQuery({
    name: 'includeProducts',
    type: Boolean,
    required: false,
    description: 'Whether to include products in the category'
  })
  @ApiQuery({
    name: 'includeAttributes',
    type: Boolean,
    required: false,
    description: 'Whether to include attributes in the category'
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Category found',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query('includeChildren') includeChildren?: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.getCategoryBySlug(
      slug, 
      includeChildren === 'true',
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    
    return new ApiResponse<CategoryResponseDto>(category);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Put(':id')
  @ApiOperation({
    summary: "Update category (Admin only)",
    description: "Update an existing category with optional image upload"
  })
  @ApiConsumes('multipart/form-data')
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Category successfully updated',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  @SwaggerResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @UseInterceptors(FileInterceptor('image', { storage: false }))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: CategoryUpdateDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.updateCategory(id, updateDto, file);
    return new ApiResponse<CategoryResponseDto>(category);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Post(':categoryId/attributes')
  @ApiOperation({
    summary: "Add attribute to category (Admin only)",
    description: "Assign an attribute to a category with optional required flag"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute added to category',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  async addAttributeToCategory(
    @Param('categoryId') categoryId: string,
    @Body() categoryAttributeDto: CategoryAttributeDto
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.addAttributeToCategory(
      categoryId,
      categoryAttributeDto.attributeId,
      categoryAttributeDto.required || false
    );
    
    return new ApiResponse<CategoryResponseDto>(category);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Delete(':categoryId/attributes/:attributeId')
  @ApiOperation({
    summary: "Remove attribute from category (Admin only)",
    description: "Remove an attribute from a category"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute removed from category',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  async removeAttributeFromCategory(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.removeAttributeFromCategory(
      categoryId,
      attributeId
    );
    
    return new ApiResponse<CategoryResponseDto>(category);
  }
}

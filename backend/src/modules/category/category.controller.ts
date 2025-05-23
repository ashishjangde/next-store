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
    description: "Create a new category with optional image upload. Level restrictions apply: 0 (root), 1 (subcategory), 2 (leaf)"
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
    console.log('Category Controller - Create method called');
    console.log('Request body (raw):', categoryCreateDto);
    
    // Log the specific values that might cause validation issues
    console.log('is_featured type:', typeof categoryCreateDto.is_featured, 'value:', categoryCreateDto.is_featured);
    console.log('active type:', typeof categoryCreateDto.active, 'value:', categoryCreateDto.active);
    console.log('parent_id type:', typeof categoryCreateDto.parent_id, 'value:', categoryCreateDto.parent_id);
    
    console.log('File received:', file ? `Yes, filename: ${file.originalname}` : 'No file');
    
    try {
      const category = await this.categoryService.create(categoryCreateDto, file);
      console.log('Category created successfully:', category?.id);
      return new ApiResponse<CategoryResponseDto>(
        plainToClass(CategoryResponseDto, category, { 
          excludeExtraneousValues: false,
          enableImplicitConversion: true 
        })
      );
    } catch (error) {
      console.error('Error in category controller create method:', error);
      throw error;
    }
  }

  @Public()
  @Get('root')
  @ApiOperation({
    summary: "Get root level active categories",
    description: "Retrieve only active root level categories (level 0)"
  })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Root level categories retrieved',
    schema: ApiCustomResponse([CategoryResponseDto])
  })
  async getRootCategories(
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto[]>> {
    const rootCategories = await this.categoryService.getRootCategories(
      false, // Only active categories
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    return new ApiResponse<CategoryResponseDto[]>(rootCategories);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Get('admin/root')
  @ApiOperation({
    summary: "Get all root level categories (Admin only)",
    description: "Retrieve all root level categories including inactive ones (Admin access only)"
  })
  @ApiQuery({ name: 'includeProducts', type: Boolean, required: false, description: 'Include products in response' })
  @ApiQuery({ name: 'includeAttributes', type: Boolean, required: false, description: 'Include attributes in response' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Root level categories retrieved',
    schema: ApiCustomResponse([CategoryResponseDto])
  })
  async getAllRootCategoriesAdmin(
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto[]>> {
    const rootCategories = await this.categoryService.getRootCategories(
      true, // Include inactive categories
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    return new ApiResponse<CategoryResponseDto[]>(rootCategories);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({
    summary: "Get category by slug",
    description: "Retrieve a category by its slug with active children. Only non-level 2 categories have children."
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
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.getCategoryBySlug(
      slug,
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    
    return new ApiResponse<CategoryResponseDto>(category);
  }
  
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: "Get category by ID",
    description: "Retrieve active category by its ID with children"
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
  async getCategoryById(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.getCategoryById(
      id,
      false, // Only active categories
      includeProducts === 'true',
      includeAttributes === 'true'
    );
    
    return new ApiResponse<CategoryResponseDto>(category);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Get('admin/:id')
  @ApiOperation({
    summary: "Get category by ID (Admin only)",
    description: "Retrieve any category (active/inactive) by ID with all children"
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
  async getCategoryByIdAdmin(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('includeAttributes') includeAttributes?: string
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoryService.getCategoryById(
      id,
      true, // Include inactive categories
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
    description: "Update an existing category with optional image upload. Level restrictions apply."
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
    console.log('Category Controller - Update method called');
    console.log('Category ID:', id);
    console.log('Request body:', JSON.stringify(updateDto, null, 2));
    console.log('File received:', file ? `Yes, filename: ${file.originalname}` : 'No file');
    
    try {
      const category = await this.categoryService.updateCategory(id, updateDto, file);
      console.log('Category updated successfully:', id);
      return new ApiResponse<CategoryResponseDto>(category);
    } catch (error) {
      console.error('Error in category controller update method:', error);
      throw error;
    }
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Post(':categoryId/attributes')
  @ApiOperation({
    summary: "Add attribute to category (Admin only)",
    description: "Assign an attribute to a level 2 category with optional required flag"
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
  @SwaggerResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Attributes can only be added to level 2 categories',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Attributes can only be added to level 2 categories')
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
    description: "Remove an attribute from a level 2 category"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute removed from category',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category or attribute not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category or attribute not found')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: "Delete category (Admin only)",
    description: "Delete a category and all its associations"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Category successfully deleted',
    schema: ApiCustomResponse({ message: "Category deleted successfully" })
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  @SwaggerResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete category with child categories',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Cannot delete category with child categories')
  })
  async deleteCategory(
    @Param('id') id: string
  ): Promise<ApiResponse<{ message: string }>> {
    await this.categoryService.deleteCategory(id);
    return new ApiResponse<{ message: string }>({ message: "Category deleted successfully" });
  }
}

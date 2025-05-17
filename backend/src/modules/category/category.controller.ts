import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiExtraModels, ApiConsumes } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { Public } from 'src/common/decorators/public-decorator';
import { Roles } from '@prisma/client';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import CustomApiResponse from 'src/common/responses/ApiResponse';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Categories')
@Controller('categories')
@ApiExtraModels(CategoryResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}  @Post()
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', {
    storage: undefined // We'll use memory storage for processing with S3
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Admin only endpoint to create a product category'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this slug already exists',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Category with this slug already exists')
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
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Forbidden - Admin access required')
  })  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
   
    
    const category = await this.categoryService.createCategory(createCategoryDto, file);
    return new CustomApiResponse(category);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all active product categories. Admin users can include inactive categories.'
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (admin only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    schema: ApiCustomResponse([CategoryResponseDto])
  })
  async getAllCategories(@Query('includeInactive') includeInactive?: boolean) {
    const categories = await this.categoryService.getAllCategories(includeInactive === true);
    return new CustomApiResponse(categories);
  }

  @Get('featured')
  @Public()
  @ApiOperation({
    summary: 'Get featured categories',
    description: 'Retrieve featured product categories'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured categories retrieved successfully',
    schema: ApiCustomResponse([CategoryResponseDto])
  })
  async getFeaturedCategories() {
    const categories = await this.categoryService.getFeaturedCategories();
    return new CustomApiResponse(categories);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieve a specific product category by its ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  async getCategoryById(@Param('id') id: string) {
    const category = await this.categoryService.getCategoryById(id);
    return new CustomApiResponse(category);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieve a specific product category by its slug'
  })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.categoryService.getCategoryBySlug(slug);
    return new CustomApiResponse(category);
  }

  @Put(':id')
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update category',
    description: 'Admin only endpoint to update a product category'
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    schema: ApiCustomResponse(CategoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this slug already exists',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Category with this slug already exists')
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
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Forbidden - Admin access required')
  })  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
  
    const category = await this.categoryService.updateCategory(id, updateCategoryDto, file);
    return new CustomApiResponse(category);
  }

  @Delete(':id')
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Admin only endpoint to delete a product category'
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
    schema: ApiCustomResponse({ message: 'Category deleted successfully' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Category not found')
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete category with products',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Cannot delete category with products')
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Forbidden - Admin access required')
  })
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.deleteCategory(id);
    return new CustomApiResponse({ message: 'Category deleted successfully' });
  }
}

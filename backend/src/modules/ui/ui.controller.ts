import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UiService } from './ui.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { Users } from '@prisma/client';
import { Public } from '../../common/decorators/public-decorator';
import ApiResponseClass from '../../common/responses/ApiResponse';
import { ApiCustomResponse } from '../../common/responses/ApiResponse';

@ApiTags('UI - Frontend Data')
@Controller('ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Public()
  @Get('home')
  @ApiOperation({
    summary: 'Get home page data',
    description: 'Get all data needed for the home page including banners, categories, featured products, trending products, and user suggestions if logged in'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Home page data retrieved successfully',
    schema: ApiCustomResponse({
      banners: [],
      categories: [],
      featuredProducts: [],
      trendingProducts: [],
      suggestions: [],
      newProducts: []
    })
  })
  async getHomePageData(@Query('userId') userId?: string) {
    const data = await this.uiService.getHomePageData(userId);
    return new ApiResponseClass(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('home/authenticated')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get home page data for authenticated user',
    description: 'Get personalized home page data including user suggestions based on browsing history'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personalized home page data retrieved successfully',
    schema: ApiCustomResponse({
      banners: [],
      categories: [],
      featuredProducts: [],
      trendingProducts: [],
      suggestions: [],
      newProducts: []
    })
  })
  async getAuthenticatedHomePageData(@GetUser() user: Users) {
    const data = await this.uiService.getHomePageData(user.id);
    return new ApiResponseClass(data);
  }

  @Public()
  @Get('banners')
  @ApiOperation({
    summary: 'Get active banners',
    description: 'Get all active promotional banners for display'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active banners retrieved successfully'
  })
  async getActiveBanners() {
    const banners = await this.uiService.getActiveBanners();
    return new ApiResponseClass(banners);
  }

  @Public()
  @Get('categories')
  @ApiOperation({
    summary: 'Get categories for navigation',
    description: 'Get root categories with product counts for navigation menu'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully'
  })
  async getCategories() {
    const categories = await this.uiService.getCategoriesWithFeaturedProducts();
    return new ApiResponseClass(categories);
  }

  @Public()
  @Get('products/featured')
  @ApiOperation({
    summary: 'Get featured products by category',
    description: 'Get featured products grouped by categories'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured products retrieved successfully'
  })
  async getFeaturedProducts() {
    const products = await this.uiService.getFeaturedProductsByCategory();
    return new ApiResponseClass(products);
  }

  @Public()
  @Get('products/trending')
  @ApiOperation({
    summary: 'Get trending products',
    description: 'Get most ordered/popular products'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trending products retrieved successfully'
  })
  async getTrendingProducts() {
    const products = await this.uiService.getTrendingProducts();
    return new ApiResponseClass(products);
  }

  @Public()
  @Get('products/new')
  @ApiOperation({
    summary: 'Get new products',
    description: 'Get recently added products'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New products retrieved successfully'
  })
  async getNewProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    const products = await this.uiService.getNewProducts(limitNum);
    return new ApiResponseClass(products);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/suggestions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get personalized product suggestions',
    description: 'Get product suggestions based on user browsing history and preferences'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product suggestions retrieved successfully'
  })
  async getUserSuggestions(@GetUser() user: Users) {
    const suggestions = await this.uiService.getUserSuggestions(user.id);
    return new ApiResponseClass(suggestions);
  }

  @Public()
  @Get('category/:slug')
  @ApiOperation({
    summary: 'Get category page data',
    description: 'Get category details with products for category page'
  })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category page data retrieved successfully'
  })
  async getCategoryPageData(@Param('slug') slug: string) {
    const data = await this.uiService.getCategoryPageData(slug);
    return new ApiResponseClass(data);
  }

  @Public()
  @Get('category/:categoryId/products')
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Get products for a specific category'
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully'
  })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const products = await this.uiService.getProductsByCategory(categoryId, limitNum);
    return new ApiResponseClass(products);
  }

  @UseGuards(JwtAuthGuard)
  @Post('product/:productId/view')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Record product view',
    description: 'Record when a user views a product for personalization'
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product view recorded successfully'
  })
  async recordProductView(
    @Param('productId') productId: string,
    @GetUser() user: Users
  ) {
    await this.uiService.recordProductView(user.id, productId);
    return new ApiResponseClass({ message: 'Product view recorded successfully' });
  }
}

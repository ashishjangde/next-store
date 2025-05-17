import { Controller, Get, Post, Body, Delete, UseGuards, Req, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WhishlistService } from './whishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import CustomApiResponse from 'src/common/responses/ApiResponse';
import { Request } from 'express';

// Extended Request type that includes the user property
interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

@ApiTags('Wishlist')
@Controller('whishlist')
export class WhishlistController {
  constructor(private readonly whishlistService: WhishlistService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add product to wishlist',
    description: 'Add a product to the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product added to wishlist successfully',
    schema: ApiCustomResponse({ message: 'Product added to wishlist' })
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product already in wishlist',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Product already in wishlist')
  })
  async addToWishlist(@Body() addToWishlistDto: AddToWishlistDto, @Req() req: RequestWithUser) {
    await this.whishlistService.addToWishlist(req.user.id, addToWishlistDto);
    return new CustomApiResponse({ message: 'Product added to wishlist' });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user wishlist',
    description: 'Get all products in the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User wishlist retrieved successfully',
    schema: ApiCustomResponse(WishlistResponseDto)
  })
  async getWishlist(@Req() req: RequestWithUser) {
    const wishlist = await this.whishlistService.getWishlist(req.user.id);
    return new CustomApiResponse(wishlist);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove product from wishlist',
    description: 'Remove a product from the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product removed from wishlist successfully',
    schema: ApiCustomResponse({ message: 'Product removed from wishlist' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found in wishlist',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found in wishlist')
  })
  async removeFromWishlist(@Body() removeFromWishlistDto: RemoveFromWishlistDto, @Req() req: RequestWithUser) {
    await this.whishlistService.removeFromWishlist(req.user.id, removeFromWishlistDto);
    return new CustomApiResponse({ message: 'Product removed from wishlist' });
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear wishlist',
    description: 'Remove all products from the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wishlist cleared successfully',
    schema: ApiCustomResponse({ message: 'Wishlist cleared' })
  })
  async clearWishlist(@Req() req: RequestWithUser) {
    await this.whishlistService.clearWishlist(req.user.id);
    return new CustomApiResponse({ message: 'Wishlist cleared' });
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if product is in wishlist',
    description: 'Check if a specific product is in the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check successful',
    schema: ApiCustomResponse({ inWishlist: true })
  })
  async checkInWishlist(@Query('productId') productId: string, @Req() req: RequestWithUser) {
    const inWishlist = await this.whishlistService.checkInWishlist(req.user.id, productId);
    return new CustomApiResponse({ inWishlist });
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get wishlist item count',
    description: 'Get the number of items in the user\'s wishlist'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wishlist count retrieved successfully',
    schema: ApiCustomResponse({ count: 5 })
  })
  async getWishlistCount(@Req() req: RequestWithUser) {
    const count = await this.whishlistService.countWishlistItems(req.user.id);
    return new CustomApiResponse({ count });
  }
}

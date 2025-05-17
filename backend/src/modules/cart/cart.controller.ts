import { Controller, Get, Post, Body, Delete, Put, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
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

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add product to cart',
    description: 'Add a product to the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product added to cart successfully',
    schema: ApiCustomResponse({ message: 'Product added to cart' })
  })
  async addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: RequestWithUser) {
    await this.cartService.addToCart(req.user.id, addToCartDto);
    return new CustomApiResponse({ message: 'Product added to cart' });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Get all products in the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User cart retrieved successfully',
    schema: ApiCustomResponse(CartResponseDto)
  })
  async getCart(@Req() req: RequestWithUser) {
    const cart = await this.cartService.getCart(req.user.id);
    return new CustomApiResponse(cart);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Update the quantity of a product in the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cart item updated successfully',
    schema: ApiCustomResponse({ message: 'Cart item updated' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cart item not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Cart item not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to update this cart item',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'You do not have permission to update this cart item')
  })
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto, @Req() req: RequestWithUser) {
    await this.cartService.updateCartItem(req.user.id, updateCartItemDto);
    return new CustomApiResponse({ message: 'Cart item updated' });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove product from cart',
    description: 'Remove a product from the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product removed from cart successfully',
    schema: ApiCustomResponse({ message: 'Product removed from cart' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cart item not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Cart item not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to remove this cart item',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'You do not have permission to remove this cart item')
  })
  async removeFromCart(@Body() removeFromCartDto: RemoveFromCartDto, @Req() req: RequestWithUser) {
    await this.cartService.removeFromCart(req.user.id, removeFromCartDto);
    return new CustomApiResponse({ message: 'Product removed from cart' });
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all products from the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cart cleared successfully',
    schema: ApiCustomResponse({ message: 'Cart cleared' })
  })
  async clearCart(@Req() req: RequestWithUser) {
    await this.cartService.clearCart(req.user.id);
    return new CustomApiResponse({ message: 'Cart cleared' });
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get cart item count',
    description: 'Get the number of items in the user\'s cart'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cart count retrieved successfully',
    schema: ApiCustomResponse({ count: 3 })
  })
  async getCartCount(@Req() req: RequestWithUser) {
    const count = await this.cartService.countCartItems(req.user.id);
    return new CustomApiResponse({ count });
  }
}

import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { CartItemRepository } from 'src/repositories/cart-item-repository';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartResponseDto, CartItemDto } from './dto/cart-response.dto';
import ApiError from 'src/common/responses/ApiError';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly cartItemRepository: CartItemRepository) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<void> {
    const { productId, quantity } = addToCartDto;
    
    // Check if the item is already in the cart
    const existingItem = await this.cartItemRepository.findCartItem(userId, productId);
    
    if (existingItem) {
      // Update quantity if already in cart
      const newQuantity = existingItem.quantity + quantity;
      const updated = await this.cartItemRepository.updateCartItemQuantity(existingItem.id, newQuantity);
      
      if (!updated) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update cart item quantity');
      }
    } else {
      // Add new item to cart
      const cartItem = await this.cartItemRepository.createCartItem(userId, productId, quantity);
      
      if (!cartItem) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to add product to cart');
      }
    }
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cartItems = await this.cartItemRepository.findCartItemsByUserId(userId);

    // Calculate total price
    let totalPrice = 0;
    if (cartItems.length > 0) {
      totalPrice = cartItems.reduce((total, item) => {
        const price = item.Product?.price || 0;
        return total + (price * item.quantity);
      }, 0);
    }

    return {
      items: plainToInstance(CartItemDto, cartItems),
      totalItems: cartItems.length,
      totalPrice
    };
  }

  async updateCartItem(userId: string, updateCartItemDto: UpdateCartItemDto): Promise<void> {
    const { id, quantity } = updateCartItemDto;
    
    // Check if the item exists and belongs to the user
    const cartItem = await this.cartItemRepository.findCartItemById(id);
    if (!cartItem) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Cart item not found');
    }
    
    if (cartItem.user_id !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'You do not have permission to update this cart item');
    }
    
    // Update the quantity
    const updated = await this.cartItemRepository.updateCartItemQuantity(id, quantity);
    if (!updated) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update cart item quantity');
    }
  }

  async removeFromCart(userId: string, removeFromCartDto: RemoveFromCartDto): Promise<void> {
    const { id } = removeFromCartDto;
    
    // Check if the item exists and belongs to the user
    const cartItem = await this.cartItemRepository.findCartItemById(id);
    if (!cartItem) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Cart item not found');
    }
    
    if (cartItem.user_id !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'You do not have permission to remove this cart item');
    }
    
    // Remove the item
    const removed = await this.cartItemRepository.deleteCartItem(id);
    if (!removed) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove product from cart');
    }
  }

  async clearCart(userId: string): Promise<void> {
    const cleared = await this.cartItemRepository.clearCart(userId);
    if (!cleared) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to clear cart');
    }
  }

  async countCartItems(userId: string): Promise<number> {
    return this.cartItemRepository.countCartItems(userId);
  }
}

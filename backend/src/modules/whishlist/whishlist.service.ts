import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { WishlistRepository } from 'src/repositories/wishlist-repository';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { WishlistResponseDto, WishlistItemDto } from './dto/wishlist-response.dto';
import ApiError from 'src/common/responses/ApiError';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WhishlistService {
  private readonly logger = new Logger(WhishlistService.name);

  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto): Promise<void> {
    const { productId } = addToWishlistDto;
    
    // Check if the item is already in the wishlist
    const existingItem = await this.wishlistRepository.findWishlistItem(userId, productId);
    if (existingItem) {
      throw new ApiError(HttpStatus.CONFLICT, 'Product already in wishlist');
    }

    const wishlistItem = await this.wishlistRepository.createWishlistItem(userId, productId);
    if (!wishlistItem) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to add product to wishlist');
    }
  }
  async getWishlist(userId: string): Promise<WishlistResponseDto> {
    const wishlistItems = await this.wishlistRepository.findWishlistItemsByUserId(userId);

    return {
      items: plainToInstance(WishlistItemDto, wishlistItems),
      totalItems: wishlistItems.length
    };
  }

  async removeFromWishlist(userId: string, removeFromWishlistDto: RemoveFromWishlistDto): Promise<void> {
    const { productId } = removeFromWishlistDto;

    // Check if the item exists in the wishlist
    const existingItem = await this.wishlistRepository.findWishlistItem(userId, productId);
    if (!existingItem) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Product not found in wishlist');
    }

    // Remove the item
    const removed = await this.wishlistRepository.deleteWishlistItem(existingItem.id);
    if (!removed) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove product from wishlist');
    }
  }

  async clearWishlist(userId: string): Promise<void> {
    const cleared = await this.wishlistRepository.clearWishlist(userId);
    if (!cleared) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to clear wishlist');
    }
  }

  async checkInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.wishlistRepository.findWishlistItem(userId, productId);
    return !!item;
  }

  async countWishlistItems(userId: string): Promise<number> {
    return this.wishlistRepository.countWishlistItems(userId);
  }
}

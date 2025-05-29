'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';

interface ProductCardProps {
  product: Product | {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    images?: string[];
    slug: string;
    category?: { name: string };
    inventory?: { quantity: number };
    Product?: Product;
  };
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export const ProductCard = ({ 
  product, 
  showAddToCart = true, 
  showWishlist = true,
  className = '',
}: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkIsInWishlist } = useWishlistStore();
  
  // Handle both direct product and nested product from wishlist
  if (!product) {
    return null; // Don't render if product is undefined
  }
  
  const actualProduct = 'Product' in product ? product.Product : product;
  
  if (!actualProduct) {
    return null; // Don't render if product data is missing
  }
  
  const hasDiscount = actualProduct.discount_price !== undefined && actualProduct.discount_price < actualProduct.price;
  const discountPercentage = hasDiscount && actualProduct.discount_price !== undefined
    ? Math.round(((actualProduct.price - actualProduct.discount_price) / actualProduct.price) * 100)
    : 0;
  const finalPrice = actualProduct.discount_price ?? actualProduct.price ?? 0;
  const originalPrice = actualProduct.price ?? 0;
  
  // Handle both inventory and Inventory (backend inconsistency fallback)
  const inventory = actualProduct.inventory || (actualProduct as any).Inventory;
  const isOutOfStock = (inventory?.quantity ?? 0) === 0;
  const isInWishlist = checkIsInWishlist(actualProduct.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({ productId: actualProduct.id, quantity: 1 });
      toast.success('Added to cart successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist({ productId: actualProduct.id });
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId: actualProduct.id });
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!actualProduct || !actualProduct.id || !actualProduct.title || !actualProduct.price) {
    return null;
  }

  return (
    <Link href={`/products/${actualProduct.slug}`} className={`block ${className}`}>
      <motion.div 
        className="group relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        initial={false}
        whileHover={{ scale: 1.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={isInWishlist ? {
          backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: isInWishlist ? '0% 0%' : '100% 100%'
        } : undefined}
        animate={{
          backgroundPosition: isInWishlist ? '100% 100%' : '0% 0%'
        }}
        transition={{
          duration: 2,
          repeat: isInWishlist ? Infinity : 0,
          repeatType: 'reverse'
        }}
      >
        {/* Product Image - Covers full top */}
        <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
          {actualProduct.images && actualProduct.images.length > 0 && !imageError ? (
            <Image
              src={actualProduct.images[0]}
              alt={actualProduct.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm font-medium text-muted-foreground">No image</span>
            </div>
          )}

          {/* Wishlist Button - Right Side */}
          {showWishlist && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
                )}
              />
            </Button>
          )}
        </div>

        {/* Product Info - Bottom */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground line-clamp-1">
              {actualProduct.title}
            </h3>
          </div>

          {hasDiscount && (
            <div className="mt-1 flex items-center">
              <span className="text-sm font-medium text-foreground">
                ₹{finalPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-sm font-medium text-red-500">
                {discountPercentage}% off
              </span>
            </div>
          )}

          {!hasDiscount && (
            <div className="mt-1">
              <span className="text-sm font-medium text-foreground">
                ₹{finalPrice.toFixed(2)}
              </span>
            </div>
          )}

          {showAddToCart && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "mt-2 w-full",
                isAddingToCart && "opacity-50"
              )}
              onClick={handleAddToCart}
              disabled={isAddingToCart || isOutOfStock}
            >
              {isAddingToCart ? (
                <>
                  <span className="mr-2">Adding...</span>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </>
              ) : isOutOfStock ? (
                <span className="text-destructive">Out of Stock</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

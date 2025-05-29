'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
  isAuthenticated?: boolean;
  isInWishlist?: boolean;
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  onRemoveFromWishlist?: (productId: string) => Promise<void>;
}

export function ProductCard({ 
  product, 
  showAddToCart = true, 
  showWishlist = true,
  className = '',
  isAuthenticated = false,
  isInWishlist = false,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;
  const finalPrice = product.discount_price || product.price || 0;
  const originalPrice = product.price || 0;
  
  // Handle both inventory and Inventory (backend inconsistency fallback)
  const inventory = product.inventory || (product as any).Inventory;
  const isOutOfStock = (inventory?.quantity ?? 0) === 0;

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
      if (onAddToCart) {
        await onAddToCart(product.id, 1);
        toast.success('Added to cart successfully!');
      }
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
      if (isInWishlist && onRemoveFromWishlist) {
        await onRemoveFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else if (onAddToWishlist) {
        await onAddToWishlist(product.id);
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
  };  return (
    <Link href={`/products/${product.slug}`} className={`block ${className}`}>
      <div 
        className="group relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image - Covers full top */}
        <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
          {product.images && product.images.length > 0 && !imageError ? (
            <Image
              src={product.images[0]}
              alt={product.title}
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

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Status */}
          {isOutOfStock && (
            <div className="absolute left-3 top-3 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 p-6">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-base font-medium leading-snug tracking-tight">
              {product.title}
            </h3>
            {product.category && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {product.category.name}
              </p>
            )}
          </div>          {/* Price Section - Animated */}
          <motion.div
            className="relative overflow-hidden"
            animate={{
              opacity: isHovered && showAddToCart && !isOutOfStock ? 0 : 1,
              y: isHovered && showAddToCart && !isOutOfStock ? -10 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">
                ₹{finalPrice.toLocaleString()}
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>

          {/* Add to Cart Button - Replaces price on hover */}
          {showAddToCart && !isOutOfStock && (
            <motion.div
              className="absolute inset-x-4 bottom-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0 }}
            >
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>            </motion.div>
          )}
        </div>
      </div>
    </Link>
  );
}

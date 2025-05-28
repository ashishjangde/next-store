'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Loader2, Eye, Plus, Minus } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
  isAuthenticated?: boolean;
  isInCart?: boolean;
  isInWishlist?: boolean;
  cartQuantity?: number;
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onUpdateCartQuantity?: (productId: string, quantity: number) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  onRemoveFromWishlist?: (productId: string) => Promise<void>;
}

export function ProductCard({ 
  product, 
  showAddToCart = true, 
  showWishlist = true,
  showQuickView = true,
  layout = 'grid',
  className = '',
  isAuthenticated = false,
  isInCart = false,
  isInWishlist = false,
  cartQuantity = 0,
  onAddToCart,
  onUpdateCartQuantity,
  onAddToWishlist,
  onRemoveFromWishlist
}: ProductCardProps) {  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  
  // Note: Currently using product.price directly as per backend structure
  // Future: Can use product.discount_price when implemented in backend
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const finalPrice = product.discount_price || product.price || 0;
  const originalPrice = product.price || 0;
  const isOutOfStock = (product.inventory?.quantity ?? 0) === 0;  const isLowStock = (product.inventory?.quantity ?? 0) <= 5 && (product.inventory?.quantity ?? 0) > 0;
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
      if (isInCart && onUpdateCartQuantity) {
        await onUpdateCartQuantity(product.id, cartQuantity + quantity);
        toast.success(`Updated cart quantity to ${cartQuantity + quantity}`);
      } else if (onAddToCart) {
        await onAddToCart(product.id, quantity);
        toast.success('Added to cart successfully!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };  const handleWishlistToggle = async (e: React.MouseEvent) => {
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
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > (product.inventory?.quantity || 0)) {
      toast.error('Cannot exceed available stock');
      return;
    }
    setQuantity(newQuantity);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (layout === 'list') {
    return (
      <Card className="group relative transition-all duration-300 overflow-hidden border border-border hover:border-muted-foreground/20 bg-card hover:shadow-lg">
        <div className="flex">
          <div className="relative w-48 h-48">
            <div className="aspect-square overflow-hidden bg-muted">
              {product.images && product.images.length > 0 && !imageError ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-sm font-medium">No image</span>
                </div>
              )}
            </div>

            {hasDiscount && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 left-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-2 py-1 text-xs"
              >
                -{discountPercentage}%
              </Badge>
            )}

            {isOutOfStock && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-muted text-muted-foreground font-medium"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between h-full">
              <div className="flex-1 space-y-3">
                {product.category && (
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {product.category.name}
                  </p>
                )}

                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg text-foreground hover:text-muted-foreground transition-colors cursor-pointer">
                    {product.title}
                  </h3>
                </Link>                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    (0 reviews)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-xl text-foreground">
                    ₹{finalPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-muted-foreground line-through font-medium">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>                {isLowStock && (
                  <p className="text-sm text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-md inline-block">
                    Only {product.inventory?.quantity} left in stock
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[120px]">
                {showWishlist && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAddingToWishlist}                    className={`${
                      isInWishlist ? 'text-red-500 border-red-200 hover:text-red-600' : ''
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    {isAddingToWishlist ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    )}
                  </Button>
                )}

                {showQuickView && (
                  <Link href={`/products/${product.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                )}

                {showAddToCart && !isOutOfStock && (
                  <>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuantityChange(quantity - 1);
                        }}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="flex-1 text-center text-sm font-medium min-w-[2rem]">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuantityChange(quantity + 1);
                        }}
                        disabled={quantity >= (product.inventory?.quantity || 0)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      size="sm"
                      className="w-full"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      )}
                      {isInCart ? `Update (${cartQuantity})` : 'Add to Cart'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }  return (
    <Link href={`/products/${product.slug}`} className={`block ${className}`}>
      <Card className="group relative transition-all duration-300 overflow-hidden border border-border hover:border-muted-foreground/20 bg-card hover:shadow-lg">
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {product.images && product.images.length > 0 && !imageError ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={300}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground text-sm font-medium">No image</span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-3 left-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-2 py-1 text-xs z-10"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Stock Status */}
          {isOutOfStock && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 bg-muted text-muted-foreground font-medium z-10"
            >
              Out of Stock
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            {/* Wishlist Button */}
            {showWishlist && !isOutOfStock && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isAddingToWishlist}                className={`bg-card/90 backdrop-blur-sm hover:bg-card border border-border shadow-sm h-9 w-9 ${
                  isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={handleWishlistToggle}
              >
                {isAddingToWishlist ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                )}
              </Button>
            )}

            {/* Quick View Button */}
            {showQuickView && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-card/90 backdrop-blur-sm hover:bg-card border border-border shadow-sm h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`/products/${product.slug}`, '_blank');
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Actions Overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
              {showAddToCart && (
                <div className="flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuantityChange(quantity - 1);
                      }}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="flex-1 text-center text-sm font-medium min-w-[2.5rem] px-2">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuantityChange(quantity + 1);
                      }}
                      disabled={quantity >= (product.inventory?.quantity || 0)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="bg-card text-foreground hover:bg-card/90 font-medium shadow-lg border border-border"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {isInCart ? `Update Cart (${cartQuantity})` : 'Add to Cart'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {product.category.name}
            </p>
          )}

          {/* Product Title */}
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-relaxed group-hover:text-muted-foreground transition-colors">
            {product.title}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>            <span className="text-xs text-muted-foreground font-medium">
              (0)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground">
                ₹{finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}            </div>
            {isInCart && (
              <Badge variant="secondary" className="text-xs">
                In Cart ({cartQuantity})
              </Badge>
            )}
          </div>

          {/* Stock Status */}          {isLowStock && (
            <p className="text-xs text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md">
              Only {product.inventory?.quantity} left in stock
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

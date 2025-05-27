'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/api-actions/ui-actions';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  showAddToCart = true, 
  showWishlist = true,
  className = '' 
}: ProductCardProps) {
  const hasDiscount = product.Inventory?.discount_price && 
    product.Inventory.discount_price < product.Inventory.price;

  const discountPercentage = hasDiscount 
    ? Math.round(((product.Inventory!.price - product.Inventory!.discount_price!) / product.Inventory!.price) * 100)
    : 0;

  const finalPrice = product.Inventory?.discount_price || product.Inventory?.price || 0;
  const originalPrice = product.Inventory?.price || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product.id);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', product.id);
  };

  return (
    <Link href={`/products/${product.slug}`} className={`block ${className}`}>
      <Card className="group  transition-all duration-300 overflow-hidden border-0 shadow-sm hover:shadow-xl">
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={300}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 bg-red-500 hover:bg-red-600"
            >
              -{discountPercentage}%
            </Badge>
          )}          {/* Stock Status */}
          {(product.Inventory?.quantity ?? 0) === 0 && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-gray-800 text-white"
            >
              Out of Stock
            </Badge>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            {showAddToCart && (product.Inventory?.quantity ?? 0) > 0 && (
              <Button
                onClick={handleAddToCart}
                className="bg-white text-black hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}

          {/* Product Title */}
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product._count?.OrderItems || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              ₹{finalPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>          {/* Stock Status */}
          {product.Inventory && product.Inventory.quantity <= 5 && product.Inventory.quantity > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Only {product.Inventory.quantity} left!
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

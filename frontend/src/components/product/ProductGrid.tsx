'use client';

import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4 | 6;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
  isAuthenticated?: boolean;
  getIsInCart?: (productId: string) => boolean;
  getIsInWishlist?: (productId: string) => boolean;
  getCartQuantity?: (productId: string) => number;
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onUpdateCartQuantity?: (productId: string, quantity: number) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  onRemoveFromWishlist?: (productId: string) => Promise<void>;
}

export function ProductGrid({ 
  products, 
  title, 
  description,
  columns = 4,
  showAddToCart = true,
  showWishlist = true,
  className = '',
  isAuthenticated = false,
  getIsInCart,
  getIsInWishlist,
  getCartQuantity,
  onAddToCart,
  onUpdateCartQuantity,
  onAddToWishlist,
  onRemoveFromWishlist
}: ProductGridProps) {const getGridClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };
  if (!products || products.length === 0) {
    return (
      <div className={`text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        <p className="text-gray-500 text-lg">No products available</p>
      </div>
    );
  }
  return (
    <div className={className}>
      {/* Header */}
      {title && (
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 text-lg">{description}</p>
          )}
        </div>
      )}

      {/* Products Grid */}      <div className={`grid gap-6 ${getGridClass()}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={showAddToCart}
            showWishlist={showWishlist}
            isAuthenticated={isAuthenticated}
            isInCart={getIsInCart ? getIsInCart(product.id) : false}
            isInWishlist={getIsInWishlist ? getIsInWishlist(product.id) : false}
            cartQuantity={getCartQuantity ? getCartQuantity(product.id) : 0}
            onAddToCart={onAddToCart}
            onUpdateCartQuantity={onUpdateCartQuantity}
            onAddToWishlist={onAddToWishlist}
            onRemoveFromWishlist={onRemoveFromWishlist}
          />
        ))}
      </div>
    </div>
  );
}

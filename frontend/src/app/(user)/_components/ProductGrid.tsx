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
  getIsInWishlist?: (productId: string) => boolean;
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  onRemoveFromWishlist?: (productId: string) => Promise<void>;
}

export function ProductGrid({ 
  products, 
  title, 
  description,
  showAddToCart = true,
  showWishlist = true,
  className = '',
  isAuthenticated = false,
  getIsInWishlist,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist
}: ProductGridProps) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={showAddToCart}
            showWishlist={showWishlist}
            isAuthenticated={isAuthenticated}
            isInWishlist={getIsInWishlist ? getIsInWishlist(product.id) : false}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onRemoveFromWishlist={onRemoveFromWishlist}
          />
        ))}
      </div>
    </div>
  );
}

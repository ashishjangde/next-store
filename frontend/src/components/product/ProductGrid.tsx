'use client';

import React from 'react';
import { Product } from '@/api-actions/ui-actions';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4 | 6;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export function ProductGrid({ 
  products, 
  title, 
  description,
  columns = 4,
  showAddToCart = true,
  showWishlist = true,
  className = '' 
}: ProductGridProps) {
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
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
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No products available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className={`grid gap-4 ${getGridClass()}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={showAddToCart}
            showWishlist={showWishlist}
          />
        ))}
      </div>
    </div>
  );
}

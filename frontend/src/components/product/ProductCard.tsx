'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/placeholder.png';
  const price = product.discount_price ?? product.price ?? 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={imageUrl}
              alt={product.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">
                ${price.toFixed(2)}
              </span>
              {product.discount_price && product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
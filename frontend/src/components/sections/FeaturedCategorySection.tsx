'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/api-actions/ui-actions';
import { ProductCard } from '@/components/product/ProductCard';

interface CategorySection {
  id: string;
  name: string;
  slug?: string;
  Products: Product[];
}

interface FeaturedCategorySectionProps {
  categories: CategorySection[];
  className?: string;
}

export function FeaturedCategorySection({ categories, className = '' }: FeaturedCategorySectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured by Category</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our handpicked selection of products across different categories
        </p>
      </div>

      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900">
                {category.name}
              </CardTitle>
              <Link href={`/categories/${category.slug || category.id}`}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {category.Products && category.Products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.Products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No products available in this category</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

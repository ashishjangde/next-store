'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';
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
    <section className={`space-y-12 ${className}`}>
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Collections</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Discover our handpicked selection of products across different categories
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category, index) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${
                    index % 3 === 0 ? 'bg-gradient-to-b from-blue-500 to-blue-700' :
                    index % 3 === 1 ? 'bg-gradient-to-b from-green-500 to-green-700' :
                    'bg-gradient-to-b from-purple-500 to-purple-700'
                  }`}></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {category.name}
                  </h3>
                </div>
              </div>
              <Link href={`/categories/${category.slug || category.id}`}>
                <Button variant="outline" className="hidden sm:flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {category.Products && category.Products.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.Products.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No products available in this category</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

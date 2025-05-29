'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCrousal from "./_components/crousal/BannerCrousal";
import CategoryCrousal from "./_components/crousal/CategoryCrousal";
import { UiActions,  } from '@/api-actions/ui-actions';
import { ProductCard } from '@/app/(user)/_components/ProductCard';
import { FeaturedCategorySection } from '@/components/sections/FeaturedCategorySection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: homeData, isLoading, error } = useQuery({
    queryKey: ['home-page-data'],
    queryFn: async () => {
      try {
        const response = await UiActions.getHomePageData();
        return response.data;
      } catch (error) {
        console.error('Failed to fetch home page data:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Hero Section with Loading */}
        <div className="w-screen">
          <div className="h-64 md:h-96 bg-muted/50 dark:bg-gray-100/5 animate-pulse"></div>
          <div className="flex flex-col items-center justify-center py-12 bg-background">
            <div className="animate-pulse flex justify-between w-full px-4 max-w-7xl mx-auto">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/50 dark:bg-gray-100/5 rounded-full mb-2"></div>
                  <div className="w-12 h-3 md:w-16 md:h-4 bg-muted/50 dark:bg-gray-100/5 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Loading */}
        <main className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-12 space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 shadow-sm animate-pulse">
                <div className="h-8 bg-muted/50 dark:bg-gray-100/5 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-square bg-muted/50 dark:bg-gray-100/5 rounded-lg"></div>
                      <div className="h-4 bg-muted/50 dark:bg-gray-100/5 rounded w-3/4"></div>
                      <div className="h-3 bg-muted/50 dark:bg-gray-100/5 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">      {/* Hero Section with Carousel */}
      <div className="w-screen">
        <BannerCrousal banners={homeData?.banners} loading={isLoading} />
        <div className="flex flex-col items-center justify-center">
          <CategoryCrousal categories={homeData?.categories} /> 
        </div>
      </div>      {/* Main Content */}
      <main className="min-h-screen">
        <div className="container mx-auto py-4">
          
          {/* Trending Products Section */}
        {homeData?.trendingProducts && homeData.trendingProducts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-slate-600 to-slate-800 rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Trending Now
                    </h2>
                  </div>
                  <p className="text-gray-600 mt-2">Discover what's popular with our customers</p>
                </div>
                <Link href="/products?sort=trending">
                  <Button variant="link" className="text-gray-900 hidden sm:flex items-center gap-2">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {homeData.trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showAddToCart={true}
                    showWishlist={true}
                  />
                ))}
              </div>

              {/* Mobile View All Button */}
              <div className="flex sm:hidden justify-center mt-8">
                <Link href="/products?sort=trending">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                    View All Trending Products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}        {/* New Products Section */}
        {homeData?.newProducts && homeData.newProducts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      New Arrivals
                    </h2>
                  </div>
                  <p className="text-gray-600 mt-2">The latest additions to our collection</p>
                </div>
                <Link href="/products?sort=newest">
                  <Button variant="link" className="text-gray-900 hidden sm:flex items-center gap-2">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {homeData.newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showAddToCart={true}
                    showWishlist={true}
                  />
                ))}
              </div>

              {/* Mobile View All Button */}
              <div className="flex sm:hidden justify-center mt-8">
                <Link href="/products?sort=newest">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                    View All New Arrivals
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {homeData?.suggestions && homeData.suggestions.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Recommended for You
                    </h2>
                  </div>
                  <p className="text-gray-600 mt-2">Personalized picks based on your preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {homeData.suggestions.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showAddToCart={true}
                    showWishlist={true}
                  />
                ))}
              </div>
            </div>
          </section>
        )}{/* Fallback message if no data */}
        {!homeData && !isLoading && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg">
              Unable to load home page content. Please try again later.
            </p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

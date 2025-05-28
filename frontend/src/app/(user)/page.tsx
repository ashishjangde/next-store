'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCrousal from "./_components/crousal/BannerCrousal";
import CategoryCrousal from "./_components/crousal/CategoryCrousal";
import { UiActions, HomePageData } from '@/api-actions/ui-actions';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FeaturedCategorySection } from '@/components/sections/FeaturedCategorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Clock, Star } from 'lucide-react';
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
          <div className="h-64 md:h-96 bg-gray-200 animate-pulse"></div>
          <div className="flex flex-col items-center justify-center py-12 bg-white">
            <div className="animate-pulse flex justify-between w-full px-4 max-w-7xl mx-auto">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-12 h-3 md:w-16 md:h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Loading */}
        <main className="bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-12 space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-square bg-gray-300 rounded-lg"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          
          {/* Featured Products by Category */}
          {homeData?.featuredProducts && homeData.featuredProducts.length > 0 && (
            <FeaturedCategorySection 
              categories={homeData.featuredProducts} 
              className="mb-16"
            />
          )}{/* Trending Products Section */}
        {homeData?.trendingProducts && homeData.trendingProducts.length > 0 && (          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-slate-600 to-slate-800 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Trending Now
                  </h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Discover what's popular with our customers</p>
              </div>
              <Link href="/products?sort=trending">
                <Button variant="outline" className="hidden sm:flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ProductGrid 
              products={homeData.trendingProducts} 
              columns={4}
              showAddToCart={true}
              showWishlist={true}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
            />
            {/* Mobile View All Button */}
            <div className="flex sm:hidden justify-center">
              <Link href="/products?sort=trending">
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                  View All Trending Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* New Products Section */}
        {homeData?.newProducts && homeData.newProducts.length > 0 && (          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    New Arrivals
                  </h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Fresh products just added to our collection</p>
              </div>
              <Link href="/products?sort=newest">
                <Button variant="outline" className="hidden sm:flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ProductGrid 
              products={homeData.newProducts} 
              columns={6}
              showAddToCart={true}
              showWishlist={true}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
            />
            {/* Mobile View All Button */}
            <div className="flex sm:hidden justify-center">
              <Link href="/products?sort=newest">
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:border-gray-400 transition-colors">
                  View All New Arrivals
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Personalized Suggestions Section (if user is logged in) */}
        {homeData?.suggestions && homeData.suggestions.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Recommended for You
                  </h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Personalized picks based on your preferences</p>
              </div>
            </div>
            <ProductGrid 
              products={homeData.suggestions} 
              columns={4}
              showAddToCart={true}
              showWishlist={true}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
            />
          </section>
        )}        {/* Fallback message if no data */}
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

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
          <div className="h-64 bg-gray-200 animate-pulse"></div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Featured Products by Category */}
        {homeData?.featuredProducts && homeData.featuredProducts.length > 0 && (
          <FeaturedCategorySection 
            categories={homeData.featuredProducts} 
            className="mb-12"
          />
        )}

        {/* Trending Products Section */}
        {homeData?.trendingProducts && homeData.trendingProducts.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                  <CardTitle className="text-2xl text-gray-900">
                    Trending Products
                  </CardTitle>
                </div>
                <Link href="/products?sort=trending">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600 mt-1">Most popular products right now</p>
            </CardHeader>
            <CardContent className="p-6">
              <ProductGrid 
                products={homeData.trendingProducts} 
                columns={4}
                showAddToCart={true}
                showWishlist={true}
              />
            </CardContent>
          </Card>
        )}

        {/* New Products Section */}
        {homeData?.newProducts && homeData.newProducts.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-2xl text-gray-900">
                    New Arrivals
                  </CardTitle>
                </div>
                <Link href="/products?sort=newest">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600 mt-1">Fresh products just added to our store</p>
            </CardHeader>
            <CardContent className="p-6">
              <ProductGrid 
                products={homeData.newProducts} 
                columns={6}
                showAddToCart={true}
                showWishlist={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Personalized Suggestions Section (if user is logged in) */}
        {homeData?.suggestions && homeData.suggestions.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-2xl text-gray-900">
                    Recommended for You
                  </CardTitle>
                </div>
              </div>
              <p className="text-gray-600 mt-1">Based on your browsing history and preferences</p>
            </CardHeader>
            <CardContent className="p-6">
              <ProductGrid 
                products={homeData.suggestions} 
                columns={4}
                showAddToCart={true}
                showWishlist={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Fallback message if no data */}
        {!homeData && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Unable to load home page content. Please try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

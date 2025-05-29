'use client';

import React, { useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { ProductCard } from '../_components/ProductCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlist, isLoading, error, fetchWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">
          <p>Failed to load wishlist</p>
          <Button variant="outline" onClick={fetchWishlist} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your wishlist yet.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <Button variant="outline" onClick={handleClearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.items.map((item) => (
          <ProductCard
            key={item.id}
            product={item.Product}
            showAddToCart={true}
            showWishlist={true}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Zap, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { toast } = useToast();

  const isInStock = product.inventory && product.inventory.quantity > 0;
  const maxQuantity = product.inventory?.quantity || 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isInStock) return;
    
    setIsAddingToCart(true);
    try {
      // TODO: Implement add to cart logic
      // await cartActions.addToCart(product.id, quantity);
      
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      // TODO: Implement add to wishlist logic
      // await wishlistActions.addToWishlist(product.id);
      
      toast({
        title: "Added to Wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isInStock) return;
    
    setIsBuying(true);
    try {
      // TODO: Implement buy now logic
      // This should redirect to checkout with this product
      // await checkoutActions.buyNow(product.id, quantity);
      
      toast({
        title: "Redirecting to Checkout",
        description: "You will be redirected to complete your purchase.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {isInStock && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <span className="px-4 py-2 text-center min-w-[3rem] border-x">
              {quantity}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <span className="text-xs text-gray-500">
            {maxQuantity} available
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            size="lg" 
            className="flex-1"
            disabled={!isInStock || isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="px-4"
            disabled={isAddingToWishlist}
            onClick={handleAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          size="lg" 
          variant="secondary" 
          className="w-full"
          disabled={!isInStock || isBuying}
          onClick={handleBuyNow}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isBuying ? 'Processing...' : 'Buy Now'}
        </Button>
      </div>

      {!isInStock && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium text-center">
            This product is currently out of stock
          </p>
        </div>
      )}
    </div>
  );
}

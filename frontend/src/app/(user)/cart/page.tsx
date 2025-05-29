'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { ProductCard } from '../_components/ProductCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/format';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, isLoading, error, fetchCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cart');
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
          <p>Failed to load cart</p>
          <Button variant="outline" onClick={fetchCart} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild>
            <a href="/products">Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalItems = cart.items.length;
  const totalPrice = cart.items.reduce((total, item) => {
    const product = item.Product;
    if (!product) return total;
    
    const price = product.discount_price ?? product.price ?? 0;
    return total + (price * item.quantity);
  }, 0);

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <Button variant="outline" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-24 h-24 relative">
                  <img
                    src={item.Product?.images?.[0] || '/placeholder.png'}
                    alt={item.Product?.title || 'Product'}
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.Product?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  <p className="font-medium">
                    {formatPrice(item.Product?.discount_price ?? item.Product?.price ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

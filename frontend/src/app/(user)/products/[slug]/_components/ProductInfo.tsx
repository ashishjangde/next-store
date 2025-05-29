'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/product';
import { formatPrice } from '../../../../../utils/format';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, checkInWishlist } = useWishlistStore();

  const {
    title,
    description,
    price,
    brand,
    season,
    weight,
    product_type,
    category,
    attributes,
    inventory,
    is_active
  } = product;

  const isInStock = inventory && inventory.quantity > 0;
  const isLowStock = inventory && inventory.quantity <= inventory.low_stock_threshold;

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const inWishlist = await checkInWishlist(product.id);
      setIsInWishlist(inWishlist);
    };
    checkWishlistStatus();
  }, [product.id, checkInWishlist]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isInStock) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({ productId: product.id, quantity });
      toast.success('Added to cart successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist({ productId: product.id });
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId: product.id });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground dark:text-white">{title}</h1>
          {product_type === 'VARIANT' && (
            <Badge variant="secondary">Variant</Badge>
          )}
          {!is_active && (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </div>
        
        {brand && (
          <p className="text-lg text-muted-foreground">by {brand}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground dark:text-white">
            {formatPrice(price)}
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isInStock ? (
              <span className={isLowStock ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                {isLowStock ? 'Low Stock' : 'In Stock'}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Out of Stock</span>
            )}
          </span>
        </div>
        
        {inventory && (
          <p className="text-sm text-muted-foreground">
            {inventory.quantity} items available
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-8 text-center text-foreground dark:text-white">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(prev => prev + 1)}
            disabled={!isInStock || quantity >= (inventory?.quantity || 0)}
          >
            +
          </Button>
        </div>

        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAddingToCart || !isInStock}
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleWishlistToggle}
          disabled={isAddingToWishlist}
          className="h-10 w-10"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
            )}
          />
        </Button>
      </div>

      <Separator />

      {/* Product Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">Product Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {category && (
            <div>
              <span className="font-medium text-muted-foreground">Category:</span>
              <span className="ml-2 text-foreground dark:text-white">{category.name}</span>
            </div>
          )}
          
          {season && (
            <div>
              <span className="font-medium text-muted-foreground">Season:</span>
              <span className="ml-2 text-foreground dark:text-white">{season}</span>
            </div>
          )}
          
          {weight && (
            <div>
              <span className="font-medium text-muted-foreground">Weight:</span>
              <span className="ml-2 text-foreground dark:text-white">{weight}g</span>
            </div>
          )}
          
          <div>
            <span className="font-medium text-muted-foreground">Type:</span>
            <span className="ml-2 text-foreground dark:text-white">
              {product_type === 'PARENT' ? 'Main Product' : 'Variant'}
            </span>
          </div>
        </div>
      </div>

      {/* Product Attributes */}
      {attributes && attributes.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground dark:text-white">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex justify-between">
                  <span className="font-medium text-muted-foreground">{attr.name}:</span>
                  <span className="text-foreground dark:text-white">{attr.display_value || attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Description */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">Description</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../../../../utils/format';
interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}

export default function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
  // Filter out the current product
  const relatedProducts = products.filter(product => product.id !== currentProductId);
  
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.slice(0, 8).map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Quick Action Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                <Button size="sm" variant="secondary">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {!product.is_active && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
                {product.inventory && product.inventory.quantity <= product.inventory.low_stock_threshold && (
                  <Badge variant="secondary" className="text-xs">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Brand */}
              {product.brand && (
                <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
              )}

              {/* Title */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>

              {/* Category */}
              {product.category && (
                <p className="text-xs text-gray-500">{product.category.name}</p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                
                {/* Stock Status */}
                {product.inventory && (
                  <span className="text-xs">
                    {product.inventory.quantity > 0 ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </span>
                )}
              </div>

              {/* Attributes Preview */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.attributes.slice(0, 2).map((attr) => (
                    <Badge key={attr.id} variant="outline" className="text-xs">
                      {attr.display_value || attr.value}
                    </Badge>
                  ))}
                  {product.attributes.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.attributes.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

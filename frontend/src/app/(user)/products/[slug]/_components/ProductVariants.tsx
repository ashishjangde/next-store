import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '../../../../../utils/format';
import { Package } from 'lucide-react';

interface ProductVariantsProps {
  variants: Product[];
  currentProductId: string;
}

export default function ProductVariants({ variants, currentProductId }: ProductVariantsProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <Card className="bg-muted/50 dark:bg-gray-100/5">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground dark:text-white">Available Variants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <Link
              key={variant.id}
              href={`/products/${variant.slug}`}
              className={`block p-4 border rounded-lg transition-all hover:shadow-md ${
                variant.id === currentProductId
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="space-y-3">
                {/* Variant Image */}
                {variant.images && variant.images.length > 0 && (
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted/50 dark:bg-gray-100/5">
                    <Image
                      src={variant.images[0]}
                      alt={variant.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Variant Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm line-clamp-2 text-foreground dark:text-white">{variant.title}</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(variant.price)}
                    </span>
                    
                    {variant.id === currentProductId && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  {/* Variant Attributes */}
                  {variant.attributes && variant.attributes.length > 0 && (
                    <div className="space-y-1">
                      {variant.attributes.slice(0, 2).map((attr) => (
                        <div key={attr.id} className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground dark:text-white">{attr.name}:</span>{' '}
                          {attr.display_value || attr.value}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock Status */}
                  {variant.inventory && (
                    <div className="flex items-center gap-1 text-xs">
                      <Package className="h-3 w-3" />
                      {variant.inventory.quantity > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          {variant.inventory.quantity <= variant.inventory.low_stock_threshold 
                            ? 'Low Stock' 
                            : 'In Stock'}
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ProductActions } from '@/api-actions/product-actions';
import { Product } from '@/types/product';
import ProductImageGallery from './_components/ProductImageGallery';
import ProductInfo from './_components/ProductInfo';
import ProductVariants from './_components/ProductVariants';
import RelatedProducts from './_components/RelatedProducts';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const cookieStore = cookies();
    const cookieString = cookieStore.toString();
      const response = await ProductActions.getProductBySlug(
      slug,
      {
        include_category: true,
        include_attributes: true,
      },
      cookieString
    );

    const product = response.data;

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    const images = product.images?.map(img => ({
      url: img,
      alt: product.title,
    })) || [];

    return {
      title: `${product.title} | NestStore`,
      description: product.description,
      keywords: [
        product.title,
        product.brand,
        product.category?.name,
        product.season,
        'online shopping',
        'neststore'
      ].filter(Boolean).join(', '),      openGraph: {
        title: product.title,
        description: product.description,
        images: images,
        type: 'website',
        siteName: 'NestStore',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description,
        images: product.images?.[0],
      },
      alternates: {
        canonical: `/products/${product.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;  
  try {
    const cookieStore = cookies();
    const cookieString = cookieStore.toString();    // Fetch product with all related data
    const response = await ProductActions.getProductBySlug(
      slug,
      {
        include_category: true,
        include_attributes: true,
        include_children: true,
      },
      cookieString
    );

    const product = response.data;

    if (!product) {
      notFound();
    }

    // Fetch related products (same category)
    let relatedProducts: Product[] = [];
    if (product.category?.id) {
      try {
        const relatedResponse = await ProductActions.getAllProducts(
          {
            category_id: product.category.id,
            limit: 8,
          },
          cookieString
        );
        relatedProducts = relatedResponse.data?.products || [];
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      }
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Main Product Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-6">
              <ProductImageGallery 
                images={product.images || []} 
                productTitle={product.title} 
              />
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Product Variants */}
          {product.children && product.children.length > 0 && (
            <div className="mt-12">
              <div className="bg-muted/50 dark:bg-gray-100/5 rounded-lg p-6">
                <ProductVariants 
                  variants={product.children} 
                  currentProductId={product.id} 
                />
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <Separator className="mb-8" />
              <div className="bg-muted/50 dark:bg-gray-100/5 rounded-lg p-6">
                <RelatedProducts 
                  products={relatedProducts} 
                  currentProductId={product.id} 
                />
              </div>
            </div>
          )}
        </div>

        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.description,
              image: product.images,
              brand: {
                '@type': 'Brand',
                name: product.brand || 'NestStore',
              },
              sku: product.sku,
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'INR',
                availability: product.inventory?.quantity && product.inventory.quantity > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'NestStore',
                },
              },
              category: product.category?.name,
              productID: product.id,
              url: `https://neststore.com/products/${product.slug}`,
            }),
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}

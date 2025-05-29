# Product Page Components

This directory contains all the reusable components for the product detail page.

## Components Overview

### 1. ProductImageGallery.tsx
- **Purpose**: Displays product images with zoom functionality and thumbnail navigation
- **Features**:
  - Main image swiper with zoom support
  - Thumbnail navigation
  - Responsive design
  - Uses Swiper.js for carousel functionality

### 2. ProductInfo.tsx
- **Purpose**: Displays product information including title, price, description, and specifications
- **Features**:
  - Product title, brand, and badges
  - Price display
  - Stock status indicator
  - Product details grid
  - Specifications display
  - Product description

### 3. ProductActions.tsx
- **Purpose**: Handles user actions like Add to Cart, Add to Wishlist, and Buy Now
- **Features**:
  - Quantity selector
  - Add to Cart button
  - Add to Wishlist button
  - Buy Now button
  - Stock validation
  - Loading states
  - Toast notifications

### 4. ProductVariants.tsx
- **Purpose**: Displays available product variants with navigation
- **Features**:
  - Grid layout of variants
  - Variant images and info
  - Current variant highlighting
  - Price comparison
  - Stock status for each variant

### 5. RelatedProducts.tsx
- **Purpose**: Shows related products in the same category
- **Features**:
  - Product grid layout
  - Quick add to cart overlay
  - Product cards with images
  - Category filtering
  - Responsive grid

## Page Structure

### Main Page (page.tsx)
- **SEO Features**:
  - Dynamic metadata generation
  - Open Graph tags
  - Twitter Card support
  - JSON-LD structured data
  - Canonical URLs
  - Breadcrumb navigation

- **Server-Side Rendering**:
  - Fetches product data at build time
  - Fetches related products
  - Handles error states
  - Cookie-based authentication

## Usage Example

```tsx
// The main product page automatically handles:
// - Fetching product by slug
// - SEO metadata generation
// - Error handling (404, 500)
// - Loading states

// URL: /products/nike-air-max-270
// Will fetch product with slug "nike-air-max-270"
```

## API Integration

The page uses `ProductActions.getProductBySlug()` with the following options:
- `include_category: true` - Includes category information
- `include_attributes: true` - Includes product specifications
- `include_children: true` - Includes product variants

## Error Handling

- **loading.tsx**: Shows skeleton loading state
- **not-found.tsx**: Custom 404 page for missing products
- **error.tsx**: Handles API errors and other exceptions

## Features to Implement Later

The following features are prepared but need backend implementation:
1. Add to Cart functionality
2. Add to Wishlist functionality
3. Buy Now (direct checkout)
4. Product reviews
5. Inventory tracking
6. User authentication integration

## Dependencies

- **Swiper**: For image carousel
- **Lucide React**: For icons
- **Next.js Image**: For optimized images
- **Tailwind CSS**: For styling
- **shadcn/ui**: For UI components

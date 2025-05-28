/**
 * Format price for display
 * @param price Price in number format
 * @param currency Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '₹'): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return `${currency}0.00`;
  }
  
  return `${currency}${price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate discount percentage
 * @param originalPrice Original price
 * @param discountPrice Discounted price
 * @returns Discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountPrice: number
): number {
  if (originalPrice <= 0 || discountPrice >= originalPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * Format number with Indian number system
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseOperations');

export async function handleDatabaseOperations<T>(
  operation: () => Promise<T>,
  retryCount: number = 3,
  delayMs: number = 1000,
): Promise<T | null> {
  let attempts = 0;

  while (attempts < retryCount) {
    try {
      return await operation();
    } catch (error: any) {
      attempts++;

      // Check if the error is transient (example: timeout, deadlock)
      if (!isTransientError(error)) {
        logger.error(
          `Non-retryable error occurred: ${error.message}`,
          error.stack,
        );
        throw error; // Don't retry for non-transient errors
      }

      logger.warn(
        `Database operation failed (Attempt ${attempts}/${retryCount}): ${error.message}`,
      );

      if (attempts === retryCount) {
        logger.error('Max retry attempts reached');
        return null;
      }

      // Apply exponential backoff with Jitter
      const delayWithJitter =
        delayMs * Math.pow(2, attempts - 1) * (0.8 + Math.random() * 0.4);
      await new Promise(resolve => setTimeout(resolve, delayWithJitter));
    }
  }

  return null;
}

function isTransientError(error: any): boolean {
  if (!error) return false;

  const transientErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EAI_AGAIN',
  ];
  return (
    transientErrors.includes(error.code) ||
    /timeout|deadlock/i.test(error.message)
  );
}

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns The slugified text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}



export function generateSKU({
  brand,
  categoryId,
  title,
  parentId,
}: {
  brand?: string;
  categoryId: string;
  title: string;
  parentId?: string;
}): string {
  const prefix = brand?.slice(0, 3).toUpperCase() || 'GEN';
  const category = categoryId.slice(0, 4).toUpperCase(); // First 4 chars of UUID
  const titleCode = title.replace(/\s+/g, '').slice(0, 5).toUpperCase(); // First 5 chars of cleaned title
  const parentCode = parentId ? parentId.slice(0, 3).toUpperCase() : 'XXX';
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${category}-${titleCode}-${parentCode}-${randomCode}`;
}

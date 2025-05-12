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

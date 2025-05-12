'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="container max-w-4xl px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 1 
            }}
            className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 mb-2"
          >
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold tracking-tight"
          >
            Something went wrong!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-md mx-auto"
          >
            We've encountered an error and our team has been notified. 
            Please try to refresh the page or navigate back to the home page.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button variant="outline" onClick={() => reset()}>
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'}>
              Back to homepage
            </Button>
          </motion.div>

          {process.env.NODE_ENV === 'development' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-w-full"
            >
              <h3 className="font-mono text-sm font-bold mb-2">Error details (visible in development only):</h3>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {error.message || 'Unknown error'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
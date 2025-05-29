'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground dark:text-white">
            Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            We encountered an error while loading this product page. Please try again.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
              <h4 className="text-sm font-medium text-destructive mb-2">Error Details:</h4>
              <p className="text-xs text-destructive/90 font-mono break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-destructive/70 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} variant="default" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            If the problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

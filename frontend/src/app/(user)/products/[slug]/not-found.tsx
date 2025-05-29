import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground dark:text-white">
            Product Not Found
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              This could happen if:
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• The product URL is incorrect</li>
              <li>• The product has been discontinued</li>
              <li>• The product is temporarily unavailable</li>
              <li>• You followed an outdated link</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="default" className="flex-1">
              <Link href="/products">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <Button asChild variant="ghost" size="sm">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

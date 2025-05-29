'use client';
import GlobalQueryClientProvider from "./GlobalQueryClientProvider"
import { ThemeProvider } from "@/components/context/ThemeProvider";
import { AuthInitializer } from "../auth/AuthInitializer";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "@/components/ui/toaster";
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useEffect } from 'react';

export default function GlobalContextProvider({
  children
}: {
  children: Readonly<React.ReactNode>
}) {
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  useEffect(() => {
    // Fetch cart items only once when component mounts
    const fetchInitialData = async () => {
      try {
        await cartStore.fetchCart();
        await wishlistStore.fetchWishlist();
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <NuqsAdapter>
      <AuthInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          <GlobalQueryClientProvider>
            {children}
            <Toaster />
          </GlobalQueryClientProvider>
        </ThemeProvider>
      </AuthInitializer>
    </NuqsAdapter>
  )
}

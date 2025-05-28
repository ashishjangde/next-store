'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface StoreContextProps {
  isAuthenticated: boolean;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
  // You can add your actual store implementations here
  storeConfig?: Partial<StoreContextProps>;
}

export function StoreProvider({ children, storeConfig }: StoreProviderProps) {
  // Default mock implementations
  const defaultStore: StoreContextProps = {
    isAuthenticated: false,
    isInCart: () => false,
    isInWishlist: () => false,
    getCartQuantity: () => 0,
    addToCart: async () => {
      console.log('Mock: Adding to cart');
    },
    updateCartQuantity: async () => {
      console.log('Mock: Updating cart quantity');
    },
    addToWishlist: async () => {
      console.log('Mock: Adding to wishlist');
    },
    removeFromWishlist: async () => {
      console.log('Mock: Removing from wishlist');
    },
    ...storeConfig
  };

  return (
    <StoreContext.Provider value={defaultStore}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

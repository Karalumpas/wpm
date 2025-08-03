'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface ShopContextValue {
  shopId: string | null;
  setShopId: (id: string | null) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shopId, setShopId] = useState<string | null>(null);
  return (
    <ShopContext.Provider value={{ shopId, setShopId }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}


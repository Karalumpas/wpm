'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ShopContextType {
  selectedShop: string | null;
  setSelectedShop: (id: string | null) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  return (
    <ShopContext.Provider value={{ selectedShop, setSelectedShop }}>
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

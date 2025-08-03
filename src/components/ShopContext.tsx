'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import type { Shop } from '@/lib/types';
import { toast } from '@/lib/utils';

export const ShopContext = createContext<{
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  selectedShop: string | null;
  setSelectedShop: (id: string | null) => void;
  testConnection: (shop: Shop, background?: boolean) => Promise<void>;
  isLoading: boolean;
}>({
  shops: [],
  setShops: () => {},
  selectedShop: null,
  setSelectedShop: () => {},
  testConnection: async () => {},
  isLoading: false,
});

export const useShopContext = () => useContext(ShopContext);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const res = await fetch('/api/shops');
        const data: Shop[] = await res.json();
        setShops(data);
        if (data.length > 0 && !selectedShop) {
          setSelectedShop(data[0].id);
        }
      } catch {
        console.error('Fejl ved hentning af shops');
      }
    };
    loadShops();
  }, []);

  const testConnection = async (shop: Shop, background = false) => {
    if (!background) setIsLoading(true);
    try {
      const res = await fetch(`/api/shops/${shop.id}/test`);
      const data = await res.json();
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: data.success } : s)),
      );
      if (!background) {
        toast.success(data.success ? 'Forbindelse etableret!' : 'Forbindelse fejlede!');
      }
    } catch {
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: false } : s)),
      );
      if (!background) {
        toast.error('Fejl ved test af forbindelse');
      }
    } finally {
      if (!background) setIsLoading(false);
    }
  };

  const value = { shops, setShops, selectedShop, setSelectedShop, testConnection, isLoading };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}


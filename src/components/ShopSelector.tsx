
'use client';

import { useEffect, useState } from 'react';
import { useShop } from './ShopContext';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, ChevronDown } from 'lucide-react';

type Shop = {
  id: string;
  name: string;
  isConnected: boolean;
};

export function ShopSelector() {
  const { shopId, setShopId } = useShop();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const res = await fetch('/api/shops');
        const data: Shop[] = await res.json();
        setShops(data);
      } catch {
        console.error('Fejl ved hentning af shops');
      } finally {
        setIsLoading(false);
      }
    };
    loadShops();
  }, []);

  const selectedShop = shops.find(s => s.id === shopId);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-500" />
        <Label htmlFor="shop" className="font-medium text-gray-700">
          Aktiv Shop:
        </Label>
      </div>
      <div className="relative">
        <select
          id="shop"
          className={`w-72 border rounded-lg px-4 py-2 bg-white appearance-none cursor-pointer 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${isLoading ? 'text-gray-400' : 'text-gray-900'}
            ${!shopId ? 'text-gray-500' : ''}
          `}
          value={shopId ?? ''}
          onChange={(e) => setShopId(e.target.value)}
          disabled={isLoading}
        >
          <option value="" disabled>
            {isLoading ? 'Indlæser shops...' : 'Vælg en shop'}
          </option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {selectedShop && (
        <Badge 
          variant={shops.find(s => s.id === shopId)?.isConnected ? "default" : "destructive"}
          className="ml-2"
        >
          {shops.find(s => s.id === shopId)?.isConnected ? 'Forbundet' : 'Afbrudt'}
        </Badge>
      )}
    </div>
  );
}

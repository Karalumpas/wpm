
'use client';

import { useShopContext } from './ShopContext';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, ChevronDown } from 'lucide-react';

export function ShopSelector() {
  const { shops, selectedShop, setSelectedShop, isLoading } = useShopContext();

  const currentShop = shops.find(s => s.id === selectedShop);

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
            ${!selectedShop ? 'text-gray-500' : ''}
          `}
          value={selectedShop ?? ''}
          onChange={(e) => setSelectedShop(e.target.value)}
          disabled={isLoading}
        >
          <option value="" disabled>
            {isLoading && shops.length === 0 ? 'Indlæser shops...' : 'Vælg en shop'}
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
      {currentShop && (
        <Badge 
          variant={currentShop.isConnected ? "default" : "destructive"}
          className="ml-2"
        >
          {currentShop.isConnected ? 'Forbundet' : 'Afbrudt'}
        </Badge>
      )}
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useShop } from './ShopContext';
import { Label } from '@/components/ui/label';

type Shop = {
  id: string;
  name: string;
};

export function ShopSelector() {
  const { shopId, setShopId } = useShop();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const res = await fetch('/api/shops');
        const data: Shop[] = await res.json();
        setShops(data);
      } catch {
        console.error('Fejl ved hentning af shops');
      }
    };
    loadShops();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="shop" className="sr-only">
        Vælg webshop
      </Label>
      <select
        id="shop"
        className="w-64 border rounded px-3 py-2"
        value={shopId ?? ''}
        onChange={(e) => setShopId(e.target.value)}
      >
        <option value="" disabled>
          Vælg en shop
        </option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>
    </div>
  );
}

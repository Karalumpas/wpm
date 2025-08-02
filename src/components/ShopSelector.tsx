'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

type Shop = {
  id: string;
  name: string;
};

type Props = {
  selected: string | null;
  onChange: (shopId: string) => void;
};

export function ShopSelector({ selected, onChange }: Props) {
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
    <div className="space-y-1">
      <Label htmlFor="shop">Vælg webshop</Label>
      <select
        id="shop"
        className="w-64 border rounded px-3 py-2"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value)}
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

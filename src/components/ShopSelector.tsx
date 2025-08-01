'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    fetch('/api/shops')
      .then((res) => res.json())
      .then((data) => setShops(data))
      .catch(() => console.error('Fejl ved hentning af shops'));
  }, []);

  return (
    <div className="space-y-1">
      <Label htmlFor="shop">Vælg webshop</Label>
      <Select value={selected ?? ''} onValueChange={onChange}>
        <SelectTrigger id="shop" className="w-64">
          <SelectValue placeholder="Vælg en shop" />
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop.id} value={shop.id}>
              {shop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div

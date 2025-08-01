'use client';

import { useState, useEffect } from 'react';
import { ShopConfig } from '@/lib/wooApi';

type Props = {
  shops: ShopConfig[];
  value?: string;
  onChange?: (id: string) => void;
};

export default function ShopSelector({ shops, value, onChange }: Props) {
  const [selected, setSelected] = useState(value || '');

  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  return (
    <select
      className="border p-2 rounded"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      <option value="">Vælg shop</option>
      {shops.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

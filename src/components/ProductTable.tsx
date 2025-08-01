'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';

type Row = Product & { id: number; selected?: boolean };

export default function ProductTable({
  products,
  onChange,
}: {
  products: Row[];
  onChange?: (rows: Row[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>(products);

  const update = <K extends keyof Row>(index: number, field: K, value: Row[K]) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
    onChange?.(copy);
  };

  return (
    <table className="min-w-full border border-gray-300 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Select</th>
          <th className="p-2 border">SKU</th>
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Price</th>
          <th className="p-2 border">Category</th>
          <th className="p-2 border">Type</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.id} className="border-t">
            <td className="p-2 border text-center">
              <input
                type="checkbox"
                checked={!!row.selected}
                onChange={(e) => update(idx, 'selected', e.target.checked)}
              />
            </td>
            <td className="p-2 border">{row.sku}</td>
            <td className="p-2 border">{row.name}</td>
            <td className="p-2 border">
              <input
                type="number"
                className="border p-1 rounded w-24"
                value={row.price ?? ''}
                onChange={(e) =>
                  update(idx, 'price', parseFloat(e.target.value) || 0)
                }
              />
            </td>
            <td className="p-2 border">
              <input
                type="text"
                className="border p-1 rounded"
                value={row.category ?? ''}
                onChange={(e) => update(idx, 'category', e.target.value)}
              />
            </td>
            <td className="p-2 border">{row.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

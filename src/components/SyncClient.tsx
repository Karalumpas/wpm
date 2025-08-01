'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { ShopConfig } from '@/lib/wooApi';
import ProductTable from './ProductTable';
import ShopSelector from './ShopSelector';
import SyncResultModal from './SyncResultModal';

type Row = Product & { id: number; selected?: boolean };

type Props = {
  products: Row[];
  shops: ShopConfig[];
};

export default function SyncClient({ products, shops }: Props) {
  const [rows, setRows] = useState<Row[]>(products);
  const [shopId, setShopId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { sku: string; success: boolean; error?: string }[]>(null);

  const handleSync = async () => {
    const selected = rows.filter((r) => r.selected);
    if (!shopId || selected.length === 0) return;
    setLoading(true);
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        products: selected.map((r) => ({
          sku: r.sku,
          price: r.price ?? 0,
          category: r.category || undefined,
        })),
      }),
    });
    const data = await res.json();
    setResult(data.results);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <ShopSelector shops={shops} value={shopId} onChange={setShopId} />
      <ProductTable products={rows} onChange={setRows} />
      <button className="border rounded px-4 py-2" disabled={loading} onClick={handleSync}>
        {loading ? 'Syncing...' : 'Send til WooCommerce'}
      </button>
      {result && <SyncResultModal results={result} />}
    </div>
  );
}

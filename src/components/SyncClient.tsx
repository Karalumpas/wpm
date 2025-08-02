'use client';

import { useEffect, useState } from 'react';
import type { WooProduct } from '@/lib/wooApi';
import { ProductTable } from './ProductTable';
import { ShopSelector } from './ShopSelector';
import SyncResultModal from './SyncResultModal';

type Row = WooProduct & { selected?: boolean };

export default function SyncClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [shopId, setShopId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    null | { sku: string; success: boolean; error?: string }[]
  >(null);

  useEffect(() => {
    if (!shopId) return;
    fetch(`/api/woo/products?shopId=${shopId}`)
      .then((res) => res.json())
      .then((data: WooProduct[]) =>
        setRows(data.map((p) => ({ ...p, selected: false }))),
      )
      .catch(() => setRows([]));
  }, [shopId]);

  const toggleRow = (id: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

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
      <ShopSelector selected={shopId} onChange={setShopId} />
      <ProductTable products={rows} onToggleSelect={toggleRow} />
      <button
        className="border rounded px-4 py-2"
        disabled={loading}
        onClick={handleSync}
      >
        {loading ? 'Syncing...' : 'Send til WooCommerce'}
      </button>
      {result && <SyncResultModal results={result} />}
    </div>
  );
}

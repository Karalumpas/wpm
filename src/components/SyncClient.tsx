'use client';

import { useEffect, useState } from 'react';
import { Store, Loader2, PackageX, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WooProduct } from '@/lib/wooApi';
import { ProductTable } from './ProductTable';
import SyncResultModal from './SyncResultModal';
import { useShop } from './ShopContext';

type Row = WooProduct & { selected?: boolean };

export default function SyncClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const { shopId } = useShop();
  const [loading, setLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [result, setResult] = useState<{ sku: string; success: boolean; error?: string }[] | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (!shopId) return;
      setIsLoadingProducts(true);
      try {
        const res = await fetch(`/api/woo/products?shopId=${shopId}`);
        if (!res.ok) throw new Error('Kunne ikke hente produkter');
        const data: WooProduct[] = await res.json();
        setRows(data.map((p) => ({ ...p, selected: false })));
      } catch (err) {
        console.error('Fejl ved hentning af produkter:', err);
        setRows([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
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
    try {
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
      
      if (!res.ok) throw new Error('Synkronisering fejlede');
      
      const data = await res.json();
      setResult(data.results);
    } catch (err) {
      console.error('Fejl ved synkronisering:', err);
      setResult([{ sku: 'ERROR', success: false, error: 'Der opstod en fejl ved synkronisering' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!shopId) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Ingen butik valgt</h3>
        <p className="mt-2 text-sm text-gray-500">Vælg en butik for at synkronisere produkter</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoadingProducts ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">Henter produkter...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <PackageX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Ingen produkter fundet</h3>
          <p className="mt-2 text-sm text-gray-500">Der blev ikke fundet nogle produkter at synkronisere</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Synkronisering af produkter</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Vælg de produkter, du vil synkronisere med din WooCommerce butik. 
                  Markerede produkter vil blive opdateret med de seneste data.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <ProductTable products={rows} onToggleSelect={toggleRow} />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {rows.filter(r => r.selected).length} af {rows.length} produkter valgt
            </p>
            <Button
              size="lg"
              onClick={handleSync}
              disabled={loading || rows.filter(r => r.selected).length === 0}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Synkroniserer...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synkroniser valgte
                </>
              )}
            </Button>
          </div>

          {result && <SyncResultModal results={result} />}
        </>
      )}
    </div>
  );
}

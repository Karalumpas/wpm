'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductTable } from '@/components/ProductTable';
import { ShopSelector } from '@/components/ShopSelector';
import { toast } from 'sonner';

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  category?: string;
  type: 'parent' | 'variation';
  selected?: boolean;
};


export default function SyncPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => toast.error('Kunne ikke hente produkter'));
  }, []);

  const handleSync = async () => {
    if (!selectedShop) return toast.error('Vælg en shop først');

    const selected = products.filter((p) => p.selected);
    if (selected.length === 0) return toast.error('Vælg mindst ét produkt');

    setIsLoading(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: selectedShop,
          products: selected.map(({ sku, price, category }) => ({
            sku,
            price,
            category,
          })),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(`Opdateret ${result.successCount} produkter`);
      } else {
        toast.error(result.error || 'Fejl ved synkronisering');
      }
    } catch {
      toast.error('Netværksfejl ved sync');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductSelection = (id: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const updateProduct = (id: number, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Synkroniser produkter</h1>

      <ShopSelector onChange={setSelectedShop} selected={selectedShop} />

      <ProductTable
        products={products}
        onToggleSelect={toggleProductSelection}
        onUpdateProduct={updateProduct}
      />

      <Button onClick={handleSync} disabled={isLoading || !selectedShop}>
        {isLoading ? 'Synkroniserer…' : 'Send til WooCommerce'}
      </Button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopSelector } from '@/components/ShopSelector';
import type { WooProduct } from '@/lib/wooApi';

export default function Dashboard() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [products, setProducts] = useState<WooProduct[]>([]);

  useEffect(() => {
    if (!selectedShop) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/woo/products?shopId=${selectedShop}`);
        const data: WooProduct[] = await res.json();
        setProducts(data);
      } catch {
        console.error('Fejl ved hentning af produkter');
      }
    };
    load();
  }, [selectedShop]);

  const lowStockThreshold = 5;
  const lowStock = products.filter(p => (p.stock ?? 0) < lowStockThreshold).length;
  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.totalSales ?? 0) * p.price, 0);
  const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length;
  const avgPrice = totalProducts
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
    : 0;

  return (
    <div className="p-6 space-y-6">
      <ShopSelector selected={selectedShop} onChange={setSelectedShop} />
      {selectedShop && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Varer med lavt lager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lowStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Samlet antal produkter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Samlet omsætning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalRevenue.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Udsolgte varer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{outOfStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Gennemsnitspris</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {avgPrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

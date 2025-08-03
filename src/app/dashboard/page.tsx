'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, ShoppingCart, Store, TagIcon, AlertCircle } from 'lucide-react';
import type { WooProduct } from '@/lib/wooApi';
import { useShop } from '@/components/ShopContext';

export default function Dashboard() {
  const { shopId } = useShop();
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) return;
    
    const load = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/woo/products?shopId=${shopId}`);
        const data: unknown = await res.json();
        
        if (!res.ok) {
          throw new Error(typeof data === 'string' ? data : 'Kunne ikke hente produkter');
        }
        
        if (!Array.isArray(data)) {
          throw new Error('Ugyldigt data format');
        }
        
        setProducts(data as WooProduct[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Der opstod en fejl ved hentning af produkter');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [shopId]);

  const lowStockThreshold = 5;
  const lowStock = products.filter((p) => (p.stock ?? 0) < lowStockThreshold).length;
  const totalProducts = products.length;
  const totalRevenue = products.reduce(
    (sum, p) => sum + (p.totalSales ?? 0) * p.price,
    0,
  );
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
  const avgPrice = totalProducts
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Oversigt over butikkens nøgletal</p>
        </div>
      </div>

      {!shopId && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Ingen butik valgt</h3>
          <p className="mt-2 text-sm text-gray-500">Vælg en butik i øverste højre hjørne for at se dine produktdata</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Henter produktdata...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

        {shopId && !isLoading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-orange-50 to-white border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-500" />
                <span>Varer med lavt lager</span>
              </CardTitle>
              <p className="text-sm text-gray-500">Produkter med mindre end 5 på lager</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
                <p className="text-sm text-orange-600/60 mt-1">af {totalProducts} produkter</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-blue-500" />
                <span>Samlet antal produkter</span>
              </CardTitle>
              <p className="text-sm text-gray-500">Total antal produkter i butikken</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
                <p className="text-sm text-blue-600/60 mt-1">aktive produkter</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                <span>Samlet omsætning</span>
              </CardTitle>
              <p className="text-sm text-gray-500">Total salg for alle produkter</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-3xl font-bold text-green-600">
                  {totalRevenue.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </p>
                <p className="text-sm text-green-600/60 mt-1">samlet indtjening</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Udsolgte varer</span>
              </CardTitle>
              <p className="text-sm text-gray-500">Produkter uden lager</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
                <p className="text-sm text-red-600/60 mt-1">produkter udsolgt</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <TagIcon className="h-5 w-5 text-purple-500" />
                <span>Gennemsnitspris</span>
              </CardTitle>
              <p className="text-sm text-gray-500">Gennemsnitlig pris pr. produkt</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-3xl font-bold text-purple-600">
                  {avgPrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </p>
                <p className="text-sm text-purple-600/60 mt-1">pr. produkt</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

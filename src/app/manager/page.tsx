'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProductSheetModal from '@/components/ProductSheetModal';
import { ShopSelector } from '@/components/features/shops/ShopSelector';
import { ShopForm } from '@/components/features/shops/ShopForm';
import { ShopList } from '@/components/features/shops/ShopList';
import { ProductList } from '@/components/features/products/ProductList';
import type { WooProduct } from '@/lib/wooApi';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
} from 'lucide-react';

type Product = WooProduct;

type Shop = {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  isConnected: boolean;
  lastSync?: string;
};

function WooCommerceManager() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'shops' ? 'shops' : 'products';
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showNewShopForm, setShowNewShopForm] = useState(false);

  // Update tab based on URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'products' || tab === 'shops') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data: Product[] = await res.json();
        setProducts(data);
      } catch {
        console.error('Fejl ved hentning af produkter');
      }
    };

    const loadShops = async () => {
      try {
        const res = await fetch('/api/shops');
        const data: Shop[] = await res.json();
        setShops(data);
        if (data.length > 0) setSelectedShop(data[0].id);
      } catch {
        console.error('Fejl ved hentning af shops');
      }
    };

    loadProducts();
    loadShops();
  }, []);

  // Shop operations
  const testConnection = async (shop: Shop) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shops/${shop.id}/test`);
      const data = await res.json();
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: data.success } : s)),
      );
      if (data.success) {
        toast.success('Forbindelse etableret!');
      } else {
        toast.error('Forbindelse fejlede!');
      }
    } catch {
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: false } : s)),
      );
      toast.error('Fejl ved test af forbindelse');
    } finally {
      setIsLoading(false);
    }
  };

  const saveShop = async (shopData: Omit<Shop, 'id' | 'isConnected'>) => {
    try {
      if (editingShop) {
        // Update existing shop
        const res = await fetch(`/api/shops/${editingShop.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shopData),
        });
        const updated: Shop = await res.json();
        setShops(prev => prev.map(s => s.id === editingShop.id ? updated : s));
        toast.success('Shop opdateret successfully!');
      } else {
        // Create new shop
        const res = await fetch('/api/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shopData),
        });
        const newShop: Shop = await res.json();
        setShops(prev => [...prev, newShop]);
        toast.success('Shop tilføjet successfully!');
      }
    } catch {
      toast.error('Fejl ved gemning af shop');
    } finally {
      setEditingShop(null);
      setShowNewShopForm(false);
    }
  };

  const deleteShop = async (shopId: string) => {
    try {
      await fetch(`/api/shops/${shopId}`, { method: 'DELETE' });
      setShops(prev => prev.filter(s => s.id !== shopId));
      if (selectedShop === shopId) setSelectedShop(null);
      toast.success('Shop slettet');
    } catch {
      toast.error('Fejl ved sletning af shop');
    }
  };

  const syncProducts = async () => {
    if (!selectedShop) return toast.error('Vælg en shop først');
    
    setIsLoading(true);
    try {
      const shop = shops.find(s => s.id === selectedShop);
      if (!shop?.apiKey || !shop?.apiSecret) {
        toast.error('Shop mangler API-nøgle eller secret');
        return;
      }

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: selectedShop }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.details || errorData.error || 'Ukendt fejl';
        throw new Error(message);
      }

      toast.success('Produkter synkroniseret!');
      
      // Reload products
      const productsRes = await fetch('/api/products');
      const productsData: Product[] = await productsRes.json();
      setProducts(productsData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ukendt fejl';
      toast.error('Fejl ved synkronisering: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shop Selector */}
      <ShopSelector
        shops={shops}
        selectedShop={selectedShop}
        onShopChange={setSelectedShop}
        onSync={syncProducts}
        isLoading={isLoading}
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex border-b">
          <Link
            href={selectedShop ? `/dashboard?shopId=${selectedShop}` : '/dashboard'}
            className="flex items-center px-6 py-4 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-300"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('products')}
            className={`flex items-center px-6 py-4 border-b-2 rounded-none ${
              activeTab === 'products'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Produkter
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('shops')}
            className={`flex items-center px-6 py-4 border-b-2 rounded-none ${
              activeTab === 'shops'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            <Store className="w-4 h-4 mr-2" />
            Shops
          </Button>
        </div>

        <div className="p-6">
          {activeTab === 'products' ? (
            <ProductList
              products={products}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onProductSelect={(product) => {
                setSelectedProduct(product);
                setShowSheet(true);
              }}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-6">
              {/* Shop Form */}
              {(showNewShopForm || editingShop) && (
                <ShopForm
                  shop={editingShop || undefined}
                  onSave={saveShop}
                  onCancel={() => {
                    setShowNewShopForm(false);
                    setEditingShop(null);
                  }}
                />
              )}

              {/* Shop List */}
              <ShopList
                shops={shops}
                onEdit={setEditingShop}
                onDelete={deleteShop}
                onTest={testConnection}
                onAddNew={() => setShowNewShopForm(true)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Sheet Modal */}
      {showSheet && selectedProduct && (
        <ProductSheetModal 
          product={selectedProduct} 
          onClose={() => setShowSheet(false)} 
        />
      )}
    </div>
  );
}

function ManagerPageWithSuspense() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <WooCommerceManager />
    </Suspense>
  );
}

export default ManagerPageWithSuspense;
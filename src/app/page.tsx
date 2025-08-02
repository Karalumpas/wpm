'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductSheetModal from '@/components/ProductSheetModal';
import type { WooProduct } from '@/lib/wooApi';
// Custom toast implementation
const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  }
};
import {
  Plus,
  ShoppingBag,
  Store,
  Edit3,
  Trash2,
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  Save,
  X,
  LayoutDashboard,
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

export default function WooCommerceManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showNewShopForm, setShowNewShopForm] = useState(false);

  // Load data from the backend
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


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedProducts = filteredProducts.slice(0, 25);

  const testConnection = async (shop: Shop, background = false) => {
    if (!background) setIsLoading(true);
    try {
      const res = await fetch(`/api/shops/${shop.id}/test`);
      const data = await res.json();
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: data.success } : s)),
      );
      if (!background) {
        toast.success(data.success ? 'Forbindelse etableret!' : 'Forbindelse fejlede!');
      }
    } catch {
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, isConnected: false } : s)),
      );
      if (!background) {
        toast.error('Fejl ved test af forbindelse');
      }
    } finally {
      if (!background) setIsLoading(false);
    }
  };

  const saveShop = async (shopData: Omit<Shop, 'id' | 'isConnected'>) => {
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData),
      });
      const newShop: Shop = await res.json();
      setShops(prev => [...prev, newShop]);
      toast.success('Shop tilføjet successfully!');
    } catch {
      toast.error('Fejl ved oprettelse af shop');
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
      if (!shop || !shop.apiKey || !shop.apiSecret) {
        toast.error('Shop mangler API-nøgle eller secret');
        setIsLoading(false);
        return;
      }
      // Dynamisk import for at undgå SSR-problemer
      const { fetchWooProducts } = await import('../lib/wooApi');
      const productsFromApi = await fetchWooProducts({
        id: shop.id,
        name: shop.name,
        url: shop.url,
        consumer_key: shop.apiKey,
        consumer_secret: shop.apiSecret,
      });
      setProducts(productsFromApi);
      setShops(prev => prev.map(s =>
        s.id === selectedShop ? { ...s, lastSync: new Date().toISOString() } : s
      ));
      toast.success('Produkter synkroniseret!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukendt fejl';
      toast.error('Fejl ved synkronisering: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  const ShopForm = ({ shop, onSave, onCancel }: {
    shop?: Shop;
    onSave: (data: Omit<Shop, 'id' | 'isConnected'>) => Promise<void>;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: shop?.name || '',
      url: shop?.url || '',
      apiKey: shop?.apiKey || '',
      apiSecret: shop?.apiSecret || ''
    });

    const handleSubmit = async () => {
      if (shop) {
        try {
          const res = await fetch(`/api/shops/${shop.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const updated: Shop = await res.json();
          setShops(prev => prev.map(s =>
            s.id === shop.id ? updated : s
          ));
          toast.success('Shop opdateret successfully!');
        } catch {
          toast.error('Fejl ved opdatering af shop');
        }
      } else {
        await onSave(formData);
      }
      setEditingShop(null);
      setShowNewShopForm(false);
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {shop ? 'Rediger Shop' : 'Ny Shop'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shop Navn</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Min WooCommerce Shop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Shop URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://minshop.dk"
                  type="url"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kunde nøgle</label>
                <Input
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="ck_..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kundekodeord</label>
                <Input
                  value={formData.apiSecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                  placeholder="cs_..."
                  type="password"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                Gem Shop
              </Button>
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Annuller
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WooCommerce Manager</h1>
              <p className="text-gray-600 mt-1">Administrer produkter på tværs af dine WooCommerce shops</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedShop && (
                shops.find((s) => s.id === selectedShop)?.isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )
              )}
              <select
                className={`border rounded px-3 py-1 focus:outline-none ${
                  selectedShop
                    ? shops.find((s) => s.id === selectedShop)?.isConnected
                      ? 'border-green-500 text-green-700'
                      : 'border-red-500 text-red-700'
                    : 'text-gray-600'
                }`}
                value={selectedShop ?? ''}
                onChange={(e) => setSelectedShop(e.target.value)}
              >
                <option value="" disabled>
                  Vælg shop
                </option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex border-b">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-4 font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Produkter
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'shops' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-5 h-5" />
              Shops
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6 space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Søg produkter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={syncProducts} 
                    disabled={isLoading || !selectedShop}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Synkroniser
                  </Button>
                </div>
              </div>

              {/* Product List */}
              {selectedShop ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-4">
                    Viser {displayedProducts.length} af {filteredProducts.length} produkter
                  </div>

                  {displayedProducts.map((product) => (
                    <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                      {/* Parent Product */}
                      <div
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowSheet(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                                {product.variations && product.variations.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.variations.length} varianter
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>SKU: {product.sku}</span>
                                <span>Pris: {product.price} kr</span>
                                <span>Lager: {product.stock}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Vælg en shop for at se produkter</p>
                </div>
              )}
            </div>
          )}

          {/* Shops Tab */}
          {activeTab === 'shops' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">WooCommerce Shops</h2>
                <Button onClick={() => { setEditingShop(null); setShowNewShopForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tilføj Shop
                </Button>
              </div>

              {showNewShopForm && (
                <ShopForm
                  shop={editingShop ?? undefined}
                  onSave={saveShop}
                  onCancel={() => { setEditingShop(null); setShowNewShopForm(false); }}
                />
              )}

              <div className="grid gap-4">
                {shops.map((shop) => (
                  <Card key={shop.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {shop.isConnected ? (
                              <Wifi className="w-5 h-5 text-green-600" />
                            ) : (
                              <WifiOff className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{shop.name}</h3>
                              <p className="text-gray-600 text-sm">{shop.url}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={shop.isConnected ? "default" : "destructive"}>
                              {shop.isConnected ? 'Forbundet' : 'Afbrudt'}
                            </Badge>
                            <button
                              onClick={() => setSelectedShop(shop.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                selectedShop === shop.id
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {selectedShop === shop.id ? 'Aktiv shop' : 'Vælg'}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(shop)}
                            disabled={isLoading}
                          >
                            Test forbindelse
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingShop(shop); setShowNewShopForm(true); }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteShop(shop.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {shop.lastSync && (
                        <div className="mt-3 text-sm text-gray-500">
                          Sidst synkroniseret: {new Date(shop.lastSync).toLocaleString('da-DK')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {shops.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen shops tilføjet endnu</p>
                  <Button className="mt-4" onClick={() => { setEditingShop(null); setShowNewShopForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tilføj din første shop
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showSheet && selectedProduct && <ProductSheetModal product={selectedProduct} onClose={() => setShowSheet(false)} />}
    </div>
  );
}
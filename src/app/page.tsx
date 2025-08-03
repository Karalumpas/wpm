'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductSheetModal from '@/components/ProductSheetModal';
import type { WooProduct } from '@/lib/wooApi';
import {
  Plus, ShoppingBag, Store, Edit3, Trash2, Wifi, WifiOff, Search, RefreshCw, Save, X, LayoutDashboard, Upload, ChevronsUpDown, MoreHorizontal, ArrowUpDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import UploadDropzone from '@/components/UploadDropzone';
import CsvUploadHistory from '@/components/CsvUploadHistory';

// Custom Toast Notifications
const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
      setTimeout(() => document.body.removeChild(toastEl), 500);
    }, 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
      setTimeout(() => document.body.removeChild(toastEl), 500);
    }, 3000);
  }
};

// Types
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
type SortConfig = {
  key: keyof Product;
  direction: 'ascending' | 'descending';
};

// Shop Context for global state
const ShopContext = createContext<{
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  selectedShop: string | null;
  setSelectedShop: (id: string | null) => void;
  testConnection: (shop: Shop, background?: boolean) => Promise<void>;
  isLoading: boolean;
}>({
  shops: [],
  setShops: () => {},
  selectedShop: null,
  setSelectedShop: () => {},
  testConnection: async () => {},
  isLoading: false,
});

export const useShopContext = () => useContext(ShopContext);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const res = await fetch('/api/shops');
        const data: Shop[] = await res.json();
        setShops(data);
        if (data.length > 0 && !selectedShop) {
          setSelectedShop(data[0].id);
        }
      } catch {
        console.error('Fejl ved hentning af shops');
      }
    };
    loadShops();
  }, []);

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

  const value = { shops, setShops, selectedShop, setSelectedShop, testConnection, isLoading };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}


// --- COMPONENTS ---

// Sidebar Navigation
function Sidebar({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void; }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produkter', icon: ShoppingBag },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'upload', label: 'CSV Import', icon: Upload },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col">
      <div className="font-bold text-xl mb-8 px-2">WPM</div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === item.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Header
function Header() {
    const { shops, selectedShop, setSelectedShop, testConnection, isLoading } = useShopContext();
    const currentShop = shops.find(s => s.id === selectedShop);

    return (
        <header className="bg-white border-b p-4 flex items-center justify-between">
            <div>
                {/* Can be used for breadcrumbs or view title */}
            </div>
            <div className="flex items-center gap-4">
                {currentShop && (
                    <Badge variant={currentShop.isConnected ? 'default' : 'destructive'}>
                        {currentShop.isConnected ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
                        {currentShop.isConnected ? 'Forbundet' : 'Afbrudt'}
                    </Badge>
                )}
                <select
                    className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedShop ?? ''}
                    onChange={(e) => setSelectedShop(e.target.value)}
                >
                    <option value="" disabled>Vælg shop</option>
                    {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
                 <Button
                    onClick={() => currentShop && testConnection(currentShop)}
                    disabled={isLoading || !selectedShop}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Test
                </Button>
            </div>
        </header>
    );
}


// Products View
function ProductsView() {
  const { selectedShop } = useShopContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (!selectedShop) {
      setProducts([]);
      return;
    }
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/woo/products?shopId=${selectedShop}`);
        const data: Product[] = await res.json();
        setProducts(data);
      } catch {
        toast.error('Fejl ved hentning af produkter');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [selectedShop]);

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sendToWoo = async (product: Product) => {
    if (!selectedShop) return toast.error("Vælg en shop først.");
    toast.success(`Sender ${product.name} til WooCommerce...`);
    // Implementation for sending product to Woo
    // This would call an API endpoint like POST /api/woo/products
    console.log("Sending to Woo:", product);
  };

  if (!selectedShop) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Vælg en shop for at se produkter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Produkter</CardTitle>
           <div className="flex justify-between items-center pt-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Søg produkter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Opret Produkt
              </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"><Checkbox /></TableHead>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                    Navn <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('sku')} className="cursor-pointer">
                    SKU <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('price')} className="cursor-pointer">
                    Pris <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('stock')} className="cursor-pointer">
                    Lager <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">Henter produkter...</TableCell></TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.price} kr</TableCell>
                      <TableCell>{product.stock ?? 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{product.category ?? 'N/A'}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => sendToWoo(product)}>Send til Woo</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(product); setShowSheet(true); }}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center">Ingen produkter fundet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {showSheet && selectedProduct && <ProductSheetModal product={selectedProduct} onClose={() => setShowSheet(false)} />}
    </div>
  );
}

// Shops View
function ShopsView() {
  const { shops, setShops, testConnection, isLoading } = useShopContext();
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showNewShopForm, setShowNewShopForm] = useState(false);

  const saveShop = async (shopData: Omit<Shop, 'id' | 'isConnected' | 'lastSync'>) => {
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData),
      });
      const newShop: Shop = await res.json();
      setShops(prev => [...prev, newShop]);
      toast.success('Shop tilføjet!');
      setShowNewShopForm(false);
    } catch {
      toast.error('Fejl ved oprettelse af shop');
    }
  };

  const updateShop = async (shopId: string, shopData: Partial<Omit<Shop, 'id' | 'isConnected' | 'lastSync'>>) => {
     try {
        const res = await fetch(`/api/shops/${shopId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shopData),
        });
        const updated: Shop = await res.json();
        setShops(prev => prev.map(s => s.id === shopId ? updated : s));
        toast.success('Shop opdateret!');
        setEditingShop(null);
    } catch {
        toast.error('Fejl ved opdatering af shop');
    }
  };

  const deleteShop = async (shopId: string) => {
    if (!confirm("Er du sikker på du vil slette denne shop?")) return;
    try {
      await fetch(`/api/shops/${shopId}`, { method: 'DELETE' });
      setShops(prev => prev.filter(s => s.id !== shopId));
      toast.success('Shop slettet');
    } catch {
      toast.error('Fejl ved sletning af shop');
    }
  };

  const ShopForm = ({ shop, onSave, onUpdate, onCancel }: {
    shop?: Shop | null;
    onSave: (data: Omit<Shop, 'id' | 'isConnected' | 'lastSync'>) => void;
    onUpdate: (id: string, data: Partial<Omit<Shop, 'id' | 'isConnected' | 'lastSync'>>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: shop?.name || '',
      url: shop?.url || '',
      apiKey: shop?.apiKey || '',
      apiSecret: shop?.apiSecret || ''
    });

    const handleSubmit = () => {
      if (shop) {
        onUpdate(shop.id, formData);
      } else {
        onSave(formData);
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{shop ? 'Rediger Shop' : 'Ny Shop'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} placeholder="Shop Navn" />
          <Input value={formData.url} onChange={(e) => setFormData(p => ({...p, url: e.target.value}))} placeholder="Shop URL" />
          <Input value={formData.apiKey} onChange={(e) => setFormData(p => ({...p, apiKey: e.target.value}))} placeholder="Kunde nøgle" />
          <Input value={formData.apiSecret} onChange={(e) => setFormData(p => ({...p, apiSecret: e.target.value}))} placeholder="Kundekodeord" type="password" />
          <div className="flex gap-2">
            <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" />Gem</Button>
            <Button variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Annuller</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Administrer Shops</h1>
            <Button onClick={() => { setEditingShop(null); setShowNewShopForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Tilføj Shop
            </Button>
        </div>

        {showNewShopForm && !editingShop && (
            <ShopForm onSave={saveShop} onUpdate={updateShop} onCancel={() => setShowNewShopForm(false)} />
        )}

        <div className="space-y-4">
            {shops.map(shop => (
                editingShop?.id === shop.id ? (
                    <ShopForm key={shop.id} shop={editingShop} onSave={saveShop} onUpdate={updateShop} onCancel={() => setEditingShop(null)} />
                ) : (
                <Card key={shop.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {shop.isConnected ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                            <div>
                                <h3 className="font-semibold">{shop.name}</h3>
                                <p className="text-sm text-gray-500">{shop.url}</p>
                            </div>
                            <Badge variant={shop.isConnected ? 'default' : 'destructive'}>
                                {shop.isConnected ? 'Forbundet' : 'Afbrudt'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => testConnection(shop)} disabled={isLoading}>Test</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingShop(shop)}><Edit3 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteShop(shop.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </CardContent>
                </Card>
                )
            ))}
        </div>
    </div>
  );
}

// Upload View
function UploadView() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Importer Produkter fra CSV</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upload fil</CardTitle>
                </CardHeader>
                <CardContent>
                    <UploadDropzone onUploadSuccess={() => { /* refresh history */ console.log('refresh')}} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Historik</CardTitle>
                </CardHeader>
                <CardContent>
                    <CsvUploadHistory />
                </CardContent>
            </Card>
        </div>
    );
}

// Dashboard View
function DashboardView() {
    const { selectedShop } = useShopContext();
    // Fetch dashboard specific data here
    if (!selectedShop) {
        return (
          <div className="text-center py-12 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Vælg en shop for at se dashboardet</p>
          </div>
        );
    }
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><CardTitle>Samlet Omsætning</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">12,345 kr</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Antal Produkter</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">1,234</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Lavt Lager</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">56</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Udsolgte Varer</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">12</p></CardContent></Card>
            </div>
            {/* Add more charts and stats here */}
        </div>
    );
}


// Main App Component
export default function WpmApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialView = searchParams.get('view') || 'dashboard';
  const [activeView, setActiveView] = useState(initialView);

  const handleSetView = (view: string) => {
    setActiveView(view);
    router.push(`/?view=${view}`, { scroll: false });
  };

  const renderView = () => {
    switch (activeView) {
      case 'products':
        return <ProductsView />;
      case 'shops':
        return <ShopsView />;
      case 'upload':
        return <UploadView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <ShopProvider>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar activeView={activeView} setActiveView={handleSetView} />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="p-6 overflow-y-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </ShopProvider>
  );
}

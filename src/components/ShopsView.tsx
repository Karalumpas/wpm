'use client';

import { useState } from 'react';
import { useShopContext } from '@/components/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/utils';
import type { Shop } from '@/lib/types';
import { Plus, Save, X, Wifi, WifiOff, Edit3, Trash2 } from 'lucide-react';

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

export default function ShopsView() {
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

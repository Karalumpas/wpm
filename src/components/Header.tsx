'use client';

import { useShopContext } from '@/components/ShopContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Header() {
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

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingState';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  isConnected: boolean;
  lastSync?: string;
}

interface ShopSelectorProps {
  shops: Shop[];
  selectedShop: string | null;
  onShopChange: (shopId: string) => void;
  onSync: () => void;
  isLoading?: boolean;
}

export function ShopSelector({ 
  shops, 
  selectedShop, 
  onShopChange, 
  onSync,
  isLoading = false 
}: ShopSelectorProps) {
  const currentShop = selectedShop ? shops.find(s => s.id === selectedShop) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            WooCommerce Manager
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Administrer produkter på tværs af dine WooCommerce shops
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Connection Status */}
          {currentShop && (
            <div className="flex items-center gap-2">
              {currentShop.isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Wifi className="w-3 h-3 mr-1" />
                  Forbundet
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Ikke forbundet
                </Badge>
              )}
            </div>
          )}
          
          {/* Shop Selector */}
          <select
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-48"
            value={selectedShop || ''}
            onChange={(e) => onShopChange(e.target.value)}
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
          
          {/* Sync Button */}
          <Button
            onClick={onSync}
            disabled={isLoading || !selectedShop || !currentShop?.isConnected}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Synkroniser
          </Button>
        </div>
      </div>
      
      {/* Last Sync Info */}
      {currentShop?.lastSync && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Sidste synkronisering: {new Date(currentShop.lastSync).toLocaleString('da-DK')}
          </p>
        </div>
      )}
    </div>
  );
}
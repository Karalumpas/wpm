'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingState';
import { 
  Store, 
  Plus, 
  Edit3, 
  Trash2, 
  Wifi, 
  WifiOff,
  TestTube,
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  isConnected: boolean;
  lastSync?: string;
}

interface ShopListProps {
  shops: Shop[];
  onEdit: (shop: Shop) => void;
  onDelete: (shopId: string) => void;
  onTest: (shop: Shop) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function ShopList({ 
  shops, 
  onEdit, 
  onDelete, 
  onTest, 
  onAddNew,
  isLoading = false 
}: ShopListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">WooCommerce Shops</h2>
        <Button onClick={onAddNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tilføj Shop
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {shops.length > 0 ? (
            <div className="grid gap-4">
              {shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        <span className="truncate">{shop.name}</span>
                        {shop.isConnected ? (
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTest(shop)}
                          className="flex items-center gap-1"
                        >
                          <TestTube className="w-3 h-3" />
                          Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(shop)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(shop.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <strong>URL:</strong> 
                        <a 
                          href={shop.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline truncate inline-block max-w-xs"
                        >
                          {shop.url}
                        </a>
                      </div>
                      <div>
                        <strong>API Nøgle:</strong> 
                        <span className="ml-1 font-mono text-xs bg-gray-100 px-1 rounded">
                          {shop.apiKey.substring(0, 8)}...
                        </span>
                      </div>
                      {shop.lastSync && (
                        <div>
                          <strong>Sidste sync:</strong> 
                          <span className="ml-1">
                            {new Date(shop.lastSync).toLocaleString('da-DK')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ingen shops tilføjet endnu
                </h3>
                <p className="text-gray-600 mb-4">
                  Tilføj din første WooCommerce shop for at komme i gang
                </p>
                <Button onClick={onAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tilføj din første shop
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
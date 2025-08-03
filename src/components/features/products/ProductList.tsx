'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingState';
import { Search, ShoppingBag, Edit, Package } from 'lucide-react';

import type { WooProduct } from '@/lib/wooApi';

interface ProductListProps {
  products: WooProduct[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onProductSelect: (product: WooProduct) => void;
  isLoading?: boolean;
}

export function ProductList({ 
  products, 
  searchTerm, 
  onSearchChange, 
  onProductSelect,
  isLoading = false 
}: ProductListProps) {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedProducts = filteredProducts.slice(0, 25);

  const getStockStatus = (stock?: number) => {
    if (stock === undefined || stock === null) return 'unknown';
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-stock': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Søg produkter..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product Count */}
      <div className="text-sm text-gray-600">
        Viser {displayedProducts.length} af {filteredProducts.length} produkter
      </div>

      {/* Product List */}
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
          {displayedProducts.length > 0 ? (
            <div className="space-y-3">
              {displayedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <Card 
                    key={product.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Product Image Placeholder */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                SKU: {product.sku}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {product.price.toLocaleString('da-DK', {
                                    style: 'currency',
                                    currency: 'DKK'
                                  })}
                                </span>
                                {product.status === 'publish' ? (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                                    Aktiv
                                  </Badge>
                                ) : product.status ? (
                                  <Badge variant="secondary">
                                    {product.status}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>

                            {/* Stock and Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <Badge 
                                variant="outline" 
                                className={getStockColor(stockStatus)}
                              >
                                {product.stock !== undefined 
                                  ? `${product.stock} stk`
                                  : 'Ukendt lager'
                                }
                              </Badge>
                              <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </div>
                          </div>

                          {/* Sales Info */}
                          {product.totalSales !== undefined && product.totalSales > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {product.totalSales} solgt
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Ingen produkter fundet' : 'Vælg en shop for at se produkter'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Prøv at ændre dine søgekriterier'
                    : 'Vælg en forbundet shop fra dropdown menuen ovenfor'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
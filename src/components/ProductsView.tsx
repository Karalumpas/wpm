'use client';

import { useState, useEffect } from 'react';
import { useShopContext } from '@/components/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import ProductSheetModal from '@/components/ProductSheetModal';
import { toast } from '@/lib/utils';
import type { WooProduct } from '@/lib/wooApi';
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Search, Plus, ArrowUpDown, Edit3 } from 'lucide-react';

type Product = WooProduct;
type SortConfig = {
  key: keyof Product;
  direction: 'ascending' | 'descending';
};

export default function ProductsView() {
  const { selectedShop } = useShopContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  useEffect(() => {
    if (!selectedShop) {
      setProducts([]);
      return;
    }
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/woo/products?shopId=${selectedShop}&page=${currentPage}`);
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch {
        toast.error('Fejl ved hentning af produkter');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [selectedShop, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, id]);
    } else {
      setSelectedProducts(prev => prev.filter(pId => pId !== id));
    }
  };

  const sortedProducts = Array.isArray(products) ? [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  }) : [];

  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleBulkSendToWoo = () => {
    if (selectedProducts.length === 0) {
      return toast.error("Vælg venligst produkter at sende.");
    }
    toast.success(`Sender ${selectedProducts.length} produkter til WooCommerce...`);
    // Implementation for bulk sending
    console.log("Sending selected products to Woo:", selectedProducts);
  }

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
              <div className="flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Søg produkter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {selectedProducts.length > 0 && (
                  <Button onClick={handleBulkSendToWoo} variant="outline">
                    Send {selectedProducts.length} til Woo
                  </Button>
                )}
              </div>
              <Button onClick={() => {
                setSelectedProduct(null);
                setShowSheet(true);
              }}>
                <Plus className="w-4 h-4 mr-2" /> Opret Produkt
              </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    />
                  </TableHead>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                    Navn <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('sku')} className="cursor-pointer">
                    SKU <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('price')} className="cursor-pointer">
                    Pris <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead onClick={() => requestSort('stock_quantity')} className="cursor-pointer">
                    Lager <ArrowUpDown className="w-4 h-4 inline-block ml-2" />
                  </TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="w-[40px]"><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <TableRow key={product.id} data-state={selectedProducts.includes(product.id) && "selected"}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.price} kr</TableCell>
                      <TableCell>{product.stock_quantity ?? 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{product.categories?.[0]?.name ?? 'N/A'}</Badge></TableCell>
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              Forrige
            </Button>
            <span className="text-sm">Side {currentPage} af {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              Næste
            </Button>
          </div>
        </CardContent>
      </Card>
      {showSheet && <ProductSheetModal product={selectedProduct} onClose={() => setShowSheet(false)} onProductUpdate={(updatedProduct) => {
        if (selectedProduct) {
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        } else {
            setProducts([updatedProduct, ...products]);
        }
      }} />}
    </div>
  );
}

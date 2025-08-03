'use client';

import { useState } from 'react';
import { List, Ruler, Tag, ImageOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WooProduct, WooProductVariation } from '@/lib/wooApi';

type Product = WooProduct & { selected?: boolean };

type Props = {
  products: Product[];
  onToggleSelect: (id: number) => void;
};

function VariationsPopover({ variations }: { variations: WooProductVariation[] }) {
  const [open, setOpen] = useState(false);
  if (!variations || variations.length === 0) return null;
  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-gray-500 hover:text-gray-700"
        aria-label="Vis variationer"
      >
        <List className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute z-20 bg-white border rounded shadow-md p-2 mt-1 whitespace-nowrap">
          <ul className="text-xs space-y-1">
            {variations.map((v) => (
              <li key={v.id}>
                {[v.color, v.size].filter(Boolean).join(' / ') || v.sku} - {v.stockStatus}
                {typeof v.stock === 'number' ? ` (${v.stock})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProductTable({ products, onToggleSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-[40px]">
              <Checkbox
                checked={products.length > 0 && products.every(p => p.selected)}
                onChange={() => {
                  products.forEach(p => onToggleSelect(p.id));
                }}
                aria-label="Vælg alle produkter"
              />
            </TableHead>
            <TableHead>Produkt</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Priser</TableHead>
            <TableHead>Specifikationer</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="w-[100px]">Billede</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={`
                ${product.type === 'variation' ? 'bg-muted/30' : ''}
                ${product.selected ? 'bg-blue-50/50' : ''}
                hover:bg-gray-50/50 transition-colors
              `}
            >
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onChange={() => onToggleSelect(product.id)}
                  aria-label={`Vælg ${product.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {product.type === 'parent' && product.variations && product.variations.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant="secondary" className="text-xs">
                        {product.variations.length} varianter
                      </Badge>
                      <VariationsPopover variations={product.variations} />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {product.sku}
                </code>
              </TableCell>
              <TableCell>
                {product.stockStatus ? (
                  <Badge
                    variant={
                      product.stockStatus === 'instock' 
                        ? 'default' 
                        : product.stockStatus === 'outofstock' 
                        ? 'destructive' 
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {product.stockStatus === 'instock' 
                      ? 'På lager' 
                      : product.stockStatus === 'outofstock' 
                      ? 'Udsolgt' 
                      : 'Restordre'}
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="space-y-1">
                <div className="text-right">
                  {product.regularPrice && (
                    <div className="text-sm text-gray-500">
                      Normal: {product.regularPrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                    </div>
                  )}
                  {product.salePrice && (
                    <div className="font-medium text-red-600">
                      Tilbud: {product.salePrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                    </div>
                  )}
                  {(!product.regularPrice && !product.salePrice) && (
                    <div className="text-sm text-gray-500">
                      {product.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {product.color && (
                    <Badge variant="outline" className="justify-start gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ 
                          backgroundColor: product.color.toLowerCase(),
                          border: product.color.toLowerCase() === 'white' ? '1px solid #e5e7eb' : 'none'
                        }} 
                      />
                      {product.color}
                    </Badge>
                  )}
                  {product.size && (
                    <Badge variant="outline" className="justify-start gap-1">
                      <Ruler className="w-3 h-3" />
                      {product.size}
                    </Badge>
                  )}
                  {product.brand && (
                    <Badge variant="outline" className="justify-start gap-1">
                      <Tag className="w-3 h-3" />
                      {product.brand}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {product.image ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full hover:scale-110 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageOff className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

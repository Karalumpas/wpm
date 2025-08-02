'use client';

import { useState } from 'react';
import { List } from 'lucide-react';
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
    <div className="rounded border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Navn</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Lagerstatus</TableHead>
            <TableHead>Normalpris</TableHead>
            <TableHead>Salgspris</TableHead>
            <TableHead>Farve</TableHead>
            <TableHead>Størrelse</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Billede</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={product.type === 'variation' ? 'bg-muted/30' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onChange={() => onToggleSelect(product.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {product.name}
                {product.type === 'parent' &&
                  product.variations &&
                  product.variations.length > 0 && (
                    <VariationsPopover variations={product.variations} />
                  )}
              </TableCell>
              <TableCell className="text-xs">{product.sku}</TableCell>
              <TableCell>
                {product.stockStatus ? (
                  <Badge
                    variant="secondary"
                    className={
                      product.stockStatus === 'instock'
                        ? 'bg-green-100 text-green-800 capitalize'
                        : product.stockStatus === 'outofstock'
                        ? 'bg-red-100 text-red-800 capitalize'
                        : 'bg-yellow-100 text-yellow-800 capitalize'
                    }
                  >
                    {product.stockStatus}
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{product.regularPrice ?? '-'}</TableCell>
              <TableCell
                className={
                  product.salePrice !== undefined &&
                  product.regularPrice !== undefined &&
                  product.salePrice < product.regularPrice
                    ? 'text-red-600 font-semibold'
                    : undefined
                }
              >
                {product.salePrice ?? '-'}
              </TableCell>
              <TableCell>{product.color}</TableCell>
              <TableCell>{product.size}</TableCell>
              <TableCell>{product.brand}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 object-cover"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

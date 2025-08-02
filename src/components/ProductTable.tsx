'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WooProduct } from '@/lib/wooApi';

type Product = WooProduct & { selected?: boolean };

type Props = {
  products: Product[];
  onToggleSelect: (id: number) => void;
};

export function ProductTable({ products, onToggleSelect }: Props) {
  return (
    <div className="rounded border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Navn</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pris</TableHead>
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
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-xs">{product.sku}</TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {product.status}
              </TableCell>
              <TableCell>{product.price}</TableCell>
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

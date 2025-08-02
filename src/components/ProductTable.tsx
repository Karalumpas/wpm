'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WooProduct } from '@/lib/wooApi';

type Product = WooProduct & { selected?: boolean };

type Props = {
  products: Product[];
  onToggleSelect: (id: number) => void;
  onUpdateProduct: (id: number, data: Partial<Product>) => void;
};

export function ProductTable({ products, onToggleSelect, onUpdateProduct }: Props) {
  return (
    <div className="rounded border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Navn</TableHead>
            <TableHead>Pris</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className={product.type === 'variation' ? 'bg-muted/30' : ''}>
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onChange={() => onToggleSelect(product.id)}
                />
              </TableCell>
              <TableCell className="text-xs">{product.sku}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    onUpdateProduct(product.id, { price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={product.category || ''}
                  onChange={(e) =>
                    onUpdateProduct(product.id, { category: e.target.value })
                  }
                  className="w-40"
                />
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{product.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

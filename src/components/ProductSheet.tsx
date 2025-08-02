'use client';
/* eslint-disable @next/next/no-img-element */

import type { WooProduct } from '@/lib/wooApi';

export default function ProductSheet({ product }: { product: WooProduct }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-32 h-32 object-cover rounded"
          />
        )}
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          <p className="text-sm">Pris: {product.price}</p>
          {typeof product.stock === 'number' && (
            <p className="text-sm">Lager: {product.stock}</p>
          )}
        </div>
      </div>

      {product.variations && product.variations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Farve</th>
                <th className="p-2 text-left">Størrelse</th>
                <th className="p-2 text-left">Pris</th>
                <th className="p-2 text-left">Lager</th>
                <th className="p-2 text-left">Billede</th>
              </tr>
            </thead>
            <tbody>
              {product.variations.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-2">{v.color}</td>
                  <td className="p-2">{v.size}</td>
                  <td className="p-2">{v.price}</td>
                  <td className="p-2">{v.stock}</td>
                  <td className="p-2">
                    {v.image && (
                      <img
                        src={v.image}
                        alt={`${product.name} ${v.sku}`}
                        className="w-12 h-12 object-cover"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


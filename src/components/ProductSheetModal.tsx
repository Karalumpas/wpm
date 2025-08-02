'use client';

import { X } from 'lucide-react';
import type { WooProduct } from '@/lib/wooApi';
import ProductSheet from './ProductSheet';

export default function ProductSheetModal({ product, onClose }: { product: WooProduct; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <ProductSheet product={product} />
      </div>
    </div>
  );
}


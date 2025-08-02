import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/schema';
import SyncClient from '@/components/SyncClient';
import type { WooProduct } from '@/lib/wooApi';

export default async function SyncPage() {
  const raw = await db.select().from(productsTable);
  const products: WooProduct[] = raw.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: p.price ?? 0,
    category: p.category ?? undefined,
    type: p.type,
    parentId: undefined,
    stock: undefined,
    status: p.stockStatus ?? undefined,
    image: undefined,
  }));
  return <SyncClient products={products} />;
}

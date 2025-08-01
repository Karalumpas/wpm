import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/schema';
import SyncClient from '@/components/SyncClient';

export default async function SyncPage() {
  const products = await db.select().from(productsTable);
  return <SyncClient products={products} />;
}

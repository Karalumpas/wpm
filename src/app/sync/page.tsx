import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/schema';
import SyncClient from '@/components/SyncClient';
import { getShopConfigs } from '@/lib/wooApi';

export default async function SyncPage() {
  const products = await db.select().from(productsTable);
  const shops = getShopConfigs();
  return <SyncClient products={products} shops={shops} />;
}

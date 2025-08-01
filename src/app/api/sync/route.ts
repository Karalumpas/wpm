import { NextRequest, NextResponse } from 'next/server';
import { getShopConfig, getWooClient } from '@/lib/wooApi';

type SyncRequest = {
  shopId: string;
  products: {
    sku: string;
    price: number;
    category?: string;
  }[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SyncRequest;

  const shop = getShopConfig(body.shopId);
  if (!shop) return NextResponse.json({ error: 'Shop ikke fundet' }, { status: 404 });

  const client = getWooClient(shop);

  const results: { sku: string; success: boolean; error?: string }[] = [];

  for (const p of body.products) {
    try {
      const search = await client.get('/products', {
        params: { sku: p.sku },
      });

      if (!search.data || search.data.length === 0) {
        results.push({ sku: p.sku, success: false, error: 'Produkt ikke fundet' });
        continue;
      }

      const product = search.data[0];

      // Vælg rigtigt endpoint
      const endpoint =
        product.type === 'variation'
          ? `/products/${product.parent_id}/variations/${product.id}`
          : `/products/${product.id}`;

      const update: any = { regular_price: p.price.toString() };
      if (p.category) update.categories = [{ name: p.category }];

      await client.put(endpoint, update);

      results.push({ sku: p.sku, success: true });
    } catch (err: any) {
      results.push({
        sku: p.sku,
        success: false,
        error: err?.response?.data?.message ?? 'Ukendt fejl',
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  return NextResponse.json({ successCount, results });
}

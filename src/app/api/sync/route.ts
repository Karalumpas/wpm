import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getShopConfigs, updateProduct } from '@/lib/wooApi';

const ItemSchema = z.object({
  sku: z.string(),
  price: z.number(),
  category: z.string().optional(),
});

const BodySchema = z.object({
  shopId: z.string(),
  products: z.array(ItemSchema),
});

export async function POST(req: Request) {
  const body = BodySchema.parse(await req.json());
  const shop = getShopConfigs().find((s) => s.id === body.shopId);
  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 400 });
  }
  const results = [] as { sku: string; success: boolean; error?: string }[];
  for (const item of body.products) {
    try {
      await updateProduct(shop, item.sku, item.price, item.category);
      results.push({ sku: item.sku, success: true });
    } catch (e) {
      results.push({
        sku: item.sku,
        success: false,
        error: (e as Error).message,
      });
    }
  }
  return NextResponse.json({ results });
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchWooProducts } from '@/lib/wooApi';
import { db } from '@/lib/db';
import { shops } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId');
  if (!shopId) {
    return NextResponse.json({ error: 'Missing shopId' }, { status: 400 });
  }
  const [shop] = await db.select().from(shops).where(eq(shops.id, shopId));
  if (!shop || !shop.apiKey || !shop.apiSecret) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }
  try {
    const products = await fetchWooProducts({
      id: shop.id,
      name: shop.name,
      url: shop.url,
      consumer_key: shop.apiKey,
      consumer_secret: shop.apiSecret,
    });
    return NextResponse.json(products);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

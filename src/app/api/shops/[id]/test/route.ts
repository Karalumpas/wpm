import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shops } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getWooClient } from '@/lib/wooApi';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, params.id));
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 });
    }
    if (!shop.apiKey || !shop.apiSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const client = getWooClient({
      id: shop.id,
      name: shop.name,
      url: shop.url,
      consumer_key: shop.apiKey,
      consumer_secret: shop.apiSecret,
    });

    try {
      await client.get('/products', { params: { per_page: 1 } });
      await db.update(shops).set({ isConnected: true }).where(eq(shops.id, shop.id));
      return NextResponse.json({ success: true });
    } catch {
      await db.update(shops).set({ isConnected: false }).where(eq(shops.id, shop.id));
      return NextResponse.json({ success: false });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Connection test failed' }, { status: 500 });
  }
}

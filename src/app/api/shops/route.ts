import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { shops } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getWooClient } from '@/lib/wooApi';

export async function GET() {
  const data = await db.select().from(shops);

  await Promise.all(
    data.map(async (shop) => {
      if (!shop.apiKey || !shop.apiSecret) {
        await db
          .update(shops)
          .set({ isConnected: false })
          .where(eq(shops.id, shop.id));
        shop.isConnected = false;
        return;
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
        await db
          .update(shops)
          .set({ isConnected: true })
          .where(eq(shops.id, shop.id));
        shop.isConnected = true;
      } catch {
        await db
          .update(shops)
          .set({ isConnected: false })
          .where(eq(shops.id, shop.id));
        shop.isConnected = false;
      }
    }),
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uuidv4();
    await db.insert(shops).values({
      id,
      name: body.name,
      url: body.url,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      isConnected: body.isConnected ?? false,
      lastSync: body.lastSync ? new Date(body.lastSync) : null,
    });
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, id));
    return NextResponse.json(shop, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Kunne ikke oprette shop' }, { status: 500 });
  }
}


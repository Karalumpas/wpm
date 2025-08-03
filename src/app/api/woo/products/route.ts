import { NextRequest, NextResponse } from 'next/server';
import { getWooApi } from '@/lib/wooApi';
import { db } from '@/lib/db';
import { shops as shopsSchema } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 20; // Antal produkter pr. side

  if (!shopId) {
    return NextResponse.json({ error: 'Shop ID er påkrævet' }, { status: 400 });
  }

  try {
    const shop = await db.select().from(shopsSchema).where(eq(shopsSchema.id, shopId)).get();

    if (!shop) {
      return NextResponse.json({ error: 'Shop ikke fundet' }, { status: 404 });
    }

    const wooApi = getWooApi(shop.url, shop.apiKey, shop.apiSecret);

    const { data: products, headers } = await wooApi.get('products', {
      page,
      per_page: perPage,
    });

    const totalProducts = headers['x-wp-total'];
    const totalPages = headers['x-wp-totalpages'];

    return NextResponse.json({
      products,
      totalProducts: parseInt(totalProducts, 10),
      totalPages: parseInt(totalPages, 10),
    });
  } catch (error: any) {
    console.error('Fejl ved hentning af produkter fra WooCommerce:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Kunne ikke hente produkter', details: error.response?.data }, { status: 500 });
  }
}


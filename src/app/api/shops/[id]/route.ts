import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shops } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, params.id));
  if (!shop) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(shop);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  await db
    .update(shops)
    .set({
      name: body.name,
      url: body.url,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      isConnected: body.isConnected ?? false,
      lastSync: body.lastSync ? new Date(body.lastSync) : null,
    })
    .where(eq(shops.id, params.id));

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, params.id));
  return NextResponse.json(shop);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await db.delete(shops).where(eq(shops.id, params.id));
  return NextResponse.json({ success: true });
}


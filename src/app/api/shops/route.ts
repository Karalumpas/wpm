import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { shops } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(shops);
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


// src/app/api/shops/route.ts
import { NextResponse } from 'next/server';
import type { ShopConfig } from '@/lib/wooApi';

export async function GET() {
  const raw = process.env.SHOP_CONFIGS;
  if (!raw) return NextResponse.json([], { status: 200 });

  try {
    const shops: ShopConfig[] = JSON.parse(raw);
    const output = shops.map((s) => ({ id: s.id, name: s.name }));
    return NextResponse.json(output);
  } catch {
    return NextResponse.json({ error: 'Ugyldig SHOP_CONFIGS' }, { status: 500 });
  }
}

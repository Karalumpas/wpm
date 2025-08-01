// src/app/api/shops/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const raw = process.env.SHOP_CONFIGS;
  if (!raw) return NextResponse.json([], { status: 200 });

  try {
    const shops = JSON.parse(raw);
    const output = shops.map((s: any) => ({ id: s.id, name: s.name }));
    return NextResponse.json(output);
  } catch {
    return NextResponse.json({ error: 'Ugyldig SHOP_CONFIGS' }, { status: 500 });
  }
}

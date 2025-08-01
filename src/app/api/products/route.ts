import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/schema';

export async function GET() {
  const data = await db.select().from(productsTable);
  return NextResponse.json(data);
}

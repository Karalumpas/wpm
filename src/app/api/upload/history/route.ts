import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploads } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const entries = await db.select().from(uploads).orderBy(desc(uploads.uploadedAt));
  return NextResponse.json(entries);
}

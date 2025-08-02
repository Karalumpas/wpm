import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploads } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(uploads).orderBy(desc(uploads.uploadedAt));
  const entries = rows.map((u) => ({
    ...u,
    content: JSON.parse(u.content),
  }));
  return NextResponse.json(entries);
}

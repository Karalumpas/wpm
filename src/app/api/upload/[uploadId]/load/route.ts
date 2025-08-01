import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploads } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { uploadId: string } }
) {
  const entry = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, params.uploadId));

  if (!entry.length) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.json(JSON.parse(entry[0].content));
}

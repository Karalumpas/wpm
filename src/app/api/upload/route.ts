import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { uploads, products } from '@/lib/schema';
import { parseCsv } from '@/lib/parseCsv';
import { z } from 'zod';

const ProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  type: z.enum(['parent', 'variation']),
  price: z.number().optional(),
  category: z.string().optional().nullable(),
  stockStatus: z.string().optional().nullable(),
  parentSku: z.string().optional().nullable(),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  const ids: string[] = [];

  for (const file of files) {
    const text = await file.text();
    const fileType = file.name.toLowerCase().includes('variation') ? 'variation' : 'parent';
    const productsData = parseCsv(text, fileType);
    const valid = z.array(ProductSchema).parse(productsData);
    const id = uuidv4();

    await db.insert(uploads).values({
      id,
      filename: file.name,
      type: fileType,
      content: JSON.stringify(valid),
      uploadedAt: new Date(),
    });

    if (valid.length > 0) {
      const rows = valid.map((p) => ({
        sku: p.sku,
        name: p.name,
        type: p.type,
        price: p.price ?? null,
        category: p.category ?? null,
        stockStatus: p.stockStatus ?? null,
        parentSku: p.parentSku ?? null,
        attributes: p.attributes ? JSON.stringify(p.attributes) : null,
      }));
      await db.insert(products).values(rows);
    }

    ids.push(id);
  }

  return NextResponse.json({ ids });
}

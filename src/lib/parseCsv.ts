import Papa from 'papaparse';
import { Product } from './types';

export function parseCsv(content: string, type: 'parent' | 'variation'): Product[] {
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => ({
    sku: row.sku || '',
    name: row.name || '',
    type,
    price: row.price ? Number(row.price) : undefined,
    category: row.category || undefined,
    stockStatus: row.stockStatus || undefined,
    parentSku: row.parentSku || undefined,
    attributes: row.attributes ? JSON.parse(row.attributes) : undefined,
  }));
}

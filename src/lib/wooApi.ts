import axios from 'axios';

interface WooProductAttribute {
  name: string;
  options?: string[];
  option?: string;
}

interface WooProductData {
  id: number;
  sku: string;
  name: string;
  price: number | string;
  categories?: { name: string }[];
  variations?: unknown[];
  parent_id?: number;
  stock_quantity?: number;
  status?: string;
  images?: { src: string }[];
  attributes?: WooProductAttribute[];
}

export type WooProduct = {
  id: number;
  sku: string;
  name: string;
  price: number;
  category?: string;
  type: 'parent' | 'variation';
  parentId?: number;
  stock?: number;
  status?: string;
  image?: string;
  color?: string;
  size?: string;
  brand?: string;
};

export type WooShop = {
  id: string;
  name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
};

export type ShopConfig = WooShop;

export function getShopConfigs(): WooShop[] {
  const raw = process.env.SHOP_CONFIGS;
  if (!raw) return [];

  try {
    return JSON.parse(raw) as WooShop[];
  } catch {
    return [];
  }
}

function extractAttribute(
  p: WooProductData,
  names: string[],
): string | undefined {
  const attr = p.attributes?.find((a) =>
    names.includes(a.name.toLowerCase()),
  );
  if (!attr) return undefined;
  if (attr.option) return attr.option;
  if (attr.options && attr.options.length > 0) return attr.options[0];
  return undefined;
}

function mapProduct(p: WooProductData): WooProduct {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    category: p.categories?.[0]?.name,
    type: 'parent',
    parentId: p.parent_id || undefined,
    stock: p.stock_quantity,
    status: p.status,
    image: p.images?.[0]?.src,
    color: extractAttribute(p, ['color', 'colour', 'pa_color', 'farve']),
    size: extractAttribute(p, ['size', 'pa_size', 'størrelse']),
    brand: extractAttribute(p, ['brand', 'pa_brand']),
  };
}

export async function fetchWooProducts(shop: WooShop): Promise<WooProduct[]> {
  const client = getWooClient(shop);
  try {
    const res = await client.get('/products', { params: { per_page: 100 } });
    const data = res.data as WooProductData[];
    const products: WooProduct[] = [];

    for (const p of data) {
      const base = mapProduct(p);
      if (p.variations && (p.variations as unknown[]).length > 0) {
        base.type = 'parent';
        products.push(base);
        const varRes = await client.get(
          `/products/${p.id}/variations`,
          { params: { per_page: 100 } },
        );
        const varData = varRes.data as WooProductData[];
        for (const v of varData) {
          const variation = mapProduct(v);
          variation.type = 'variation';
          variation.parentId = p.id;
          variation.category = base.category;
          if (!variation.brand) variation.brand = base.brand;
          if (!variation.image) variation.image = base.image;
          products.push(variation);
        }
      } else {
        base.type = 'parent';
        products.push(base);
      }
    }

    return products;
  } catch (err: unknown) {
    throw err;
  }
}
export function getShopConfig(shopId: string): WooShop | null {
  const raw = process.env.SHOP_CONFIGS;
  if (!raw) return null;

  try {
    const configs = JSON.parse(raw);
    return configs.find((s: WooShop) => s.id === shopId) ?? null;
  } catch {
    return null;
  }
}

export function getWooClient(shop: WooShop) {
  const instance = axios.create({
    baseURL: `${shop.url}/wp-json/wc/v3`,
    auth: {
      username: shop.consumer_key,
      password: shop.consumer_secret,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
}

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
  regular_price?: number | string;
  sale_price?: number | string;
  categories?: { name: string }[];
  variations?: unknown[];
  parent_id?: number;
  stock_quantity?: number;
  stock_status?: string;
  status?: string;
  images?: { src: string }[];
  attributes?: WooProductAttribute[];
}

export type WooProduct = {
  id: number;
  sku: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  category?: string;
  type: 'parent' | 'variation';
  parentId?: number;
  stock?: number;
  stockStatus?: string;
  status?: string;
  image?: string;
  color?: string;
  size?: string;
  brand?: string;
  variations?: WooProductVariation[];
};

export type WooProductVariation = {
  id: number;
  sku: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  stock?: number;
  stockStatus?: string;
  color?: string;
  size?: string;
  image?: string;
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
    regularPrice:
      p.regular_price !== undefined
        ? typeof p.regular_price === 'string'
          ? parseFloat(p.regular_price)
          : p.regular_price
        : undefined,
    salePrice:
      p.sale_price !== undefined
        ? typeof p.sale_price === 'string'
          ? parseFloat(p.sale_price)
          : p.sale_price
        : undefined,
    category: p.categories?.[0]?.name,
    type: 'parent',
    parentId: p.parent_id || undefined,
    stock: p.stock_quantity,
    stockStatus: p.stock_status,
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
      base.type = 'parent';
      if (p.variations && (p.variations as unknown[]).length > 0) {
        products.push(base);
        const varRes = await client.get(
          `/products/${p.id}/variations`,
          { params: { per_page: 100 } },
        );
        const varData = varRes.data as WooProductData[];
        const summaries: WooProductVariation[] = [];
        for (const v of varData) {
          const variation = mapProduct(v);
          variation.type = 'variation';
          variation.parentId = p.id;
          variation.category = base.category;
          if (!variation.brand) variation.brand = base.brand;
          if (!variation.image) variation.image = base.image;
          summaries.push({
            id: variation.id,
            sku: variation.sku,
            price: variation.price,
            regularPrice: variation.regularPrice,
            salePrice: variation.salePrice,
            stock: variation.stock,
            stockStatus: variation.stockStatus,
            color: variation.color,
            size: variation.size,
            image: variation.image,
          });
        }
        base.variations = summaries;
      } else {
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

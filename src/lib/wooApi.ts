import axios from 'axios';

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

export async function fetchWooProducts(shop: WooShop) {
  const client = getWooClient(shop);
  try {
    const res = await client.get('/products');
    const data = res.data;
    // Map WooCommerce products to local Product type
    return data.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      category: p.categories?.[0]?.name,
      type: p.variations?.length ? 'parent' : 'variation',
      parentId: p.parent_id || undefined,
      stock: p.stock_quantity,
      status: p.status,
      image: p.images?.[0]?.src,
    }));
  } catch (err) {
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

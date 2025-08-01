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

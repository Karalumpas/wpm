import axios from 'axios';

export type ShopConfig = {
  id: string;
  name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
};

export function getShopConfigs(): ShopConfig[] {
  const raw = process.env.SHOP_CONFIGS;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function createClient(shop: ShopConfig) {
  return axios.create({
    baseURL: `${shop.url.replace(/\/$/, '')}/wp-json/wc/v3`,
    auth: {
      username: shop.consumer_key,
      password: shop.consumer_secret,
    },
  });
}

export async function updateProduct(
  shop: ShopConfig,
  sku: string,
  price: number,
  category?: string
) {
  const client = createClient(shop);
  const { data } = await client.get('/products', { params: { sku } });
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Product not found');
  }
  const product = data[0];
  const endpoint =
    product.type === 'variation'
      ? `/products/${product.parent_id}/variations/${product.id}`
      : `/products/${product.id}`;
  const payload: Record<string, unknown> = { regular_price: price.toString() };
  if (category) {
    const id = Number(category);
    payload.categories = [isNaN(id) ? { name: category } : { id }];
  }
  await client.patch(endpoint, payload);
}

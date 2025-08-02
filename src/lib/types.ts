export type Product = {
  sku: string;
  name: string;
  type: 'parent' | 'variation';
  price?: number | null;
  category?: string | null;
  stockStatus?: string | null;
  parentSku?: string | null;
  attributes?: Record<string, unknown> | null;
};

export type UploadEntry = {
  id: string;
  filename: string;
  type: 'parent' | 'variation';
  content: Product[];
  uploadedAt: Date;
};

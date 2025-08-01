import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  type: text('type', { enum: ['parent', 'variation'] }).notNull(),
  content: text('content').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['parent', 'variation'] }).notNull(),
  price: real('price'),
  category: text('category'),
  stockStatus: text('stock_status'),
  parentSku: text('parent_sku'),
  attributes: text('attributes'),
});

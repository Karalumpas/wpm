import Database from 'better-sqlite3';

export function initDb(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    uploaded_at INTEGER NOT NULL
  );`);

  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL,
    category TEXT,
    stock_status TEXT,
    parent_sku TEXT,
    attributes TEXT
  );`);

  db.exec(`CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    is_connected INTEGER NOT NULL DEFAULT 0,
    last_sync INTEGER
  );`);
}

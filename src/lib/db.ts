import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';
import * as schema from './schema';
import { initDb } from './initDb';

const sqlite = new Database(join(process.cwd(), 'sqlite.db'));
initDb(sqlite);
export const db = drizzle(sqlite, { schema });

/**
 * Database connection — Neon serverless driver + Drizzle ORM.
 *
 * Reads DATABASE_URL (Vercel's Neon integration default), falling back to
 * POSTGRES_URL if present. The connection is created LAZILY on first query — never at module
 * import — so `next build` page-data collection doesn't crash when the env var
 * isn't present in the build environment. The error only surfaces if a query
 * actually runs without a configured URL, which is the correct behavior.
 */

import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. It is injected automatically by the Vercel Neon/Postgres integration. See .env.example.',
    );
  }

  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

/**
 * Proxy that defers connection creation until the first property access
 * (i.e. the first real query). Lets route modules `import { db }` safely
 * at the top level without triggering a connection at build time.
 */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export * from './schema';

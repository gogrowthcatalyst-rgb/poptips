import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle config — wired but inactive until Phase 1 item 4.
 * Schema file at lib/db/schema.ts is created when we light up Postgres.
 * Until then, drizzle-kit commands will fail loud, which is the right behavior.
 */
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? '',
  },
  verbose: true,
  strict: true,
});

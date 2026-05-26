/**
 * Magic-link tokens — one-time, short-lived, single-use.
 *
 * createMagicToken: crypto-random token, stored in Postgres with a 15-minute
 * expiry, mapped to a user id + role.
 * consumeMagicToken: looks the token up, rejects if missing/expired, then
 * DELETES it (single-use — a link can never be replayed).
 *
 * Power of Ten: small functions, explicit validation, no token is ever
 * honored past its expiry, returns typed results (no throws into callers).
 */

import { randomBytes } from 'crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db, magicTokens } from '@/lib/db';

export const MAGIC_TTL_SECONDS = 60 * 15; // 15 minutes

export type MagicRole = 'recipient' | 'tipper' | 'business';

export interface ConsumedToken {
  userId: string;
  role: MagicRole;
}

/** Generate a URL-safe random token (43 chars, 256 bits of entropy). */
function newToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Create and persist a magic token for a user. Returns the token string.
 */
export async function createMagicToken(userId: string, role: MagicRole): Promise<string> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + MAGIC_TTL_SECONDS * 1000);
  await db.insert(magicTokens).values({ token, userId, role, expiresAt });
  return token;
}

/**
 * Consume a token: valid + unexpired -> returns { userId, role } and deletes
 * the row (single-use). Invalid/expired -> returns null.
 */
export async function consumeMagicToken(token: string): Promise<ConsumedToken | null> {
  if (!token || token.length < 16) return null;

  const now = new Date();
  const rows = await db
    .select()
    .from(magicTokens)
    .where(and(eq(magicTokens.token, token), gt(magicTokens.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Single-use: delete immediately so the link can't be replayed.
  await db.delete(magicTokens).where(eq(magicTokens.token, token));

  const role: MagicRole =
    row.role === 'tipper' ? 'tipper' : row.role === 'business' ? 'business' : 'recipient';
  return { userId: row.userId, role };
}

/**
 * Best-effort cleanup of expired tokens. Safe to call opportunistically;
 * expired tokens are never honored regardless, so this is just hygiene.
 */
export async function purgeExpiredTokens(): Promise<void> {
  await db.delete(magicTokens).where(lt(magicTokens.expiresAt, new Date()));
}

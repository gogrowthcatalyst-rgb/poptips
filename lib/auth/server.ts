/**
 * Server-side session access.
 *
 * Reads the signed session cookie and verifies it. Used by protected pages
 * (server components) and API routes to identify the current user. Returns
 * null when there's no valid session — callers decide how to handle that
 * (redirect, 401, etc.).
 */

import { cookies } from 'next/headers';
import { readSessionValue, SESSION_COOKIE, type SessionPayload } from '@/lib/session';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  return readSessionValue(raw);
}

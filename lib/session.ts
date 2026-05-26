/**
 * Sessions — stateless, signed-cookie auth.
 *
 * After a magic link is verified we issue a signed cookie carrying the user's
 * id + role. The cookie is HMAC-signed with SESSION_SECRET so it can't be
 * forged or tampered with. Stateless = no per-request datastore lookup.
 *
 * Power of Ten: small single-purpose functions, constant-time signature
 * comparison, explicit null returns (never throws into request handling).
 */

import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'poptips_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  role: 'recipient' | 'tipper' | 'business';
  userId: string;
  handle?: string;
  /** business sessions only: the business + the admin's RBAC role/scope */
  businessId?: string;
  businessRole?: 'owner' | 'manager' | 'analyst';
  propertyId?: string | null;
  /** issued-at, epoch seconds */
  iat: number;
}

function getSecret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/**
 * Build a signed session cookie VALUE (payload.signature).
 * Returns null if SESSION_SECRET is not configured.
 */
export function createSessionValue(
  payload: Omit<SessionPayload, 'iat'>,
): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const full: SessionPayload = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(full));
  const sig = sign(body, secret);
  return `${body}.${sig}`;
}

/**
 * Verify a session cookie value and return the payload, or null if missing,
 * malformed, or the signature doesn't match.
 */
export function readSessionValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  const secret = getSecret();
  if (!secret) return null;

  const dot = value.lastIndexOf('.');
  if (dot <= 0) return null;

  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  const expected = sign(body, secret);
  // Constant-time compare; lengths must match for timingSafeEqual.
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (parsed.role !== 'recipient' && parsed.role !== 'tipper' && parsed.role !== 'business') {
      return null;
    }
    if (typeof parsed.userId !== 'string' || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

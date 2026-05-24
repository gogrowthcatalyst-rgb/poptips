/**
 * GET /auth/verify?token=…
 *
 * The magic-link landing. Consumes the one-time token, establishes a signed
 * session, and routes the user to the right place:
 *   - recipient -> /dashboard (then profile completion)
 *   - tipper    -> /dashboard/tipper
 *
 * Invalid / expired / already-used token -> /auth/expired (offers resend).
 * The token is single-use: consumeMagicToken deletes it, so a link can't be
 * replayed even within the TTL window.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { consumeMagicToken } from '@/lib/auth/tokens';
import { getRecipientById } from '@/lib/db/recipients';
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/session';

export const runtime = 'nodejs';

function redirectTo(request: Request, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') ?? '';

  const consumed = await consumeMagicToken(token);
  if (!consumed) {
    return redirectTo(request, '/auth/expired');
  }

  // For recipients, attach the handle to the session and decide where to land:
  // a recipient with no payment apps still needs to complete their profile.
  let handle: string | undefined;
  let recipientNeedsOnboarding = false;
  if (consumed.role === 'recipient') {
    const recipient = await getRecipientById(consumed.userId);
    handle = recipient?.handle;
    recipientNeedsOnboarding = !recipient || recipient.paymentApps.length === 0;
  }

  const sessionValue = createSessionValue({
    role: consumed.role,
    userId: consumed.userId,
    handle,
  });

  if (!sessionValue) {
    // SESSION_SECRET missing — auth can't be completed safely.
    console.error('[auth] SESSION_SECRET not set — cannot create session.');
    return redirectTo(request, '/auth/expired');
  }

  const dest =
    consumed.role === 'tipper'
      ? '/dashboard/tipper'
      : recipientNeedsOnboarding
        ? '/onboarding'
        : '/dashboard';
  const res = redirectTo(request, dest);

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return res;
}

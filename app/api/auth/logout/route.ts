/**
 * POST /api/auth/logout
 *
 * Sign-out / "Pop me out" — clears the signed session cookie and redirects to
 * /account, which (without a session) renders the SignedOutLanding with the
 * "Pop me back in" form. One-tap return path stays open.
 *
 * POST-only on purpose: link prefetchers, SMS scanners, and browser preview
 * bots issue GET requests. A GET endpoint here would let any drive-by URL
 * scan log a user out. POST + a real form is the standard guard.
 *
 * The localStorage `poptips:hasAccount` flag is NOT cleared — it survives
 * sign-out because the device still belongs to a known member, and the
 * "Pop me back in" CTA on the home page should keep working post-logout.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const store = await cookies();
  // Explicit overwrite + maxAge:0 mirrors how the cookie was set, so the
  // browser unambiguously drops it (cleaner than just .delete()).
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.redirect(new URL('/account', request.url), { status: 303 });
}

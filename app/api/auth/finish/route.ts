/**
 * POST /api/auth/finish  (form-encoded: token=…)
 *
 * The real magic-link consume endpoint. Triggered by the auto-submit form on
 * /auth/finish — so only real browsers (or noscript users hitting the
 * manual button) reach this code. SMS link previewers GET the page but
 * never POST here, which means they can no longer accidentally burn tokens.
 *
 * Logic mirrors the legacy /auth/verify GET handler: consume one-time token,
 * resolve role-specific landing (recipient onboarding state, business user),
 * set the signed session cookie, and redirect.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { consumeMagicToken } from '@/lib/auth/tokens';
import { getRecipientById } from '@/lib/db/recipients';
import { getBusinessUserById } from '@/lib/db/business';
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/session';

export const runtime = 'nodejs';

function redirectTo(request: Request, path: string, reason?: string): NextResponse {
  const url = new URL(path, request.url);
  if (reason) url.searchParams.set('why', reason);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  let token = '';
  try {
    const form = await request.formData();
    token = (form.get('token') ?? '').toString();
  } catch {
    return redirectTo(request, '/auth/expired', 'no-form');
  }

  if (!token || token.length < 16) {
    return redirectTo(request, '/auth/expired', 'no-token');
  }

  const consumed = await consumeMagicToken(token);
  if (!consumed) {
    return redirectTo(request, '/auth/expired', 'token-invalid');
  }

  // Recipient: attach handle to session; route to onboarding if incomplete.
  let handle: string | undefined;
  let recipientNeedsOnboarding = false;
  if (consumed.role === 'recipient') {
    const recipient = await getRecipientById(consumed.userId);
    handle = recipient?.handle;
    recipientNeedsOnboarding = !recipient || recipient.paymentApps.length === 0;
  }

  // Business: pull business + role context so the session is properly scoped.
  let businessId: string | undefined;
  let businessRole: 'owner' | 'manager' | 'analyst' | undefined;
  let propertyId: string | null | undefined;
  if (consumed.role === 'business') {
    const bu = await getBusinessUserById(consumed.userId);
    if (!bu) return redirectTo(request, '/auth/expired', 'business-user-missing');
    businessId = bu.businessId;
    businessRole = bu.role ?? 'owner';
    propertyId = bu.propertyId;
  }

  const sessionValue = createSessionValue({
    role: consumed.role,
    userId: consumed.userId,
    handle,
    businessId,
    businessRole,
    propertyId,
  });

  if (!sessionValue) {
    console.error('[auth] SESSION_SECRET not set — cannot create session.');
    return redirectTo(request, '/auth/expired', 'session-secret-missing');
  }

  const dest =
    consumed.role === 'business'
      ? '/admin'
      : consumed.role === 'tipper'
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

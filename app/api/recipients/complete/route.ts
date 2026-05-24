/**
 * POST /api/recipients/complete
 *
 * Session-gated profile completion for the logged-in recipient. Replaces their
 * payment apps and updates photo/message/role. Hard gate: >= 1 payment app
 * with a valid handle (a recipient with zero apps can't be tipped, so we never
 * let the profile go "live" empty).
 *
 * A user can only complete THEIR OWN profile — the recipient id comes from the
 * verified session, never from the request body.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PAYMENT_APPS } from '@/lib/db';
import { getSession } from '@/lib/auth/server';
import { updateRecipientProfile } from '@/lib/db/recipients';
import { normalizeHandle } from '@/lib/deep-links';
import { PHOTO_WINDOW_HOURS } from '@/lib/recipient-status';

export const runtime = 'nodejs';

const AppSchema = z.object({
  app: z.enum(PAYMENT_APPS),
  appHandle: z.string().min(1).max(64),
  isPrimary: z.boolean().optional(),
});

const BodySchema = z.object({
  apps: z.array(AppSchema).min(1, 'Add at least one payment app.').max(3),
  role: z.string().max(80).optional(),
  message: z.string().max(280).optional(),
  photoUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'recipient') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Normalize each handle; reject any that normalize to empty.
  const apps = data.apps.map((a) => ({
    app: a.app,
    appHandle: normalizeHandle(a.app, a.appHandle),
    isPrimary: a.isPrimary,
  }));
  if (apps.some((a) => !a.appHandle)) {
    return NextResponse.json(
      { error: 'One of your payment handles looks empty.', field: 'apps' },
      { status: 422 },
    );
  }

  // De-dupe by app (one entry per app max).
  const seen = new Set<string>();
  for (const a of apps) {
    if (seen.has(a.app)) {
      return NextResponse.json(
        { error: 'You listed the same app twice.', field: 'apps' },
        { status: 422 },
      );
    }
    seen.add(a.app);
  }

  // No photo at go-live starts the 48h compliance window; a photo clears it.
  const photoRequiredBy = data.photoUrl
    ? null
    : new Date(Date.now() + PHOTO_WINDOW_HOURS * 60 * 60 * 1000);

  await updateRecipientProfile({
    recipientId: session.userId,
    role: data.role ?? null,
    message: data.message ?? null,
    photoUrl: data.photoUrl ?? null,
    photoRequiredBy,
    apps,
  });

  const origin = (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
  return NextResponse.json({
    ok: true,
    handle: session.handle,
    profileUrl: session.handle ? `${origin}/${session.handle}` : undefined,
  });
}

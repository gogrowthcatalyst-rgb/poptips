/**
 * POST /api/recipients
 *
 * The recipient write path. Called by the profile-completion step after the
 * GHL signup form (Slice 2 wires the GHL redirect → this), and usable
 * directly for seeding/testing.
 *
 * Validates the handle (shape + reserved + uniqueness), validates the
 * payment apps, then creates the recipient with a generated QR.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, recipients, PAYMENT_APPS } from '@/lib/db';
import { createRecipient } from '@/lib/db/recipients';
import { checkHandle } from '@/lib/reserved-handles';
import { normalizeHandle } from '@/lib/deep-links';

export const runtime = 'nodejs';

const AppSchema = z.object({
  app: z.enum(PAYMENT_APPS),
  appHandle: z.string().min(1).max(64),
  isPrimary: z.boolean().optional(),
});

const BodySchema = z.object({
  handle: z.string().min(2).max(30),
  displayName: z.string().min(1).max(80),
  role: z.string().max(80).optional(),
  message: z.string().max(280).optional(),
  photoUrl: z.string().url().optional(),
  workplaceName: z.string().max(160).optional(),
  workplaceAddress: z.string().max(240).optional(),
  workplacePhone: z.string().max(40).optional(),
  ghlContactId: z.string().max(120).optional(),
  apps: z.array(AppSchema).min(1).max(3),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const handle = data.handle.toLowerCase();

  // Handle shape + reserved check (shared source of truth with the UI).
  const handleProblem = checkHandle(handle);
  if (handleProblem) {
    return NextResponse.json({ error: handleProblem, field: 'handle' }, { status: 422 });
  }

  // Uniqueness.
  const existing = await db
    .select({ id: recipients.id })
    .from(recipients)
    .where(eq(recipients.handle, handle))
    .limit(1);

  if (existing[0]) {
    return NextResponse.json(
      { error: 'That handle is already taken.', field: 'handle' },
      { status: 409 },
    );
  }

  // Normalize each app handle (strip @ / $ / paypal.me/).
  const apps = data.apps.map((a) => ({
    app: a.app,
    appHandle: normalizeHandle(a.app, a.appHandle),
    isPrimary: a.isPrimary,
  }));

  // Reject any app whose handle normalized to empty.
  if (apps.some((a) => !a.appHandle)) {
    return NextResponse.json(
      { error: 'One of your payment handles looks empty.', field: 'apps' },
      { status: 422 },
    );
  }

  const recipient = await createRecipient({
    handle,
    displayName: data.displayName,
    role: data.role,
    message: data.message,
    photoUrl: data.photoUrl,
    workplaceName: data.workplaceName,
    workplaceAddress: data.workplaceAddress,
    workplacePhone: data.workplacePhone,
    ghlContactId: data.ghlContactId,
    apps,
  });

  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips';
  return NextResponse.json({
    ok: true,
    handle: recipient.handle,
    profileUrl: `${origin.replace(/\/$/, '')}/${recipient.handle}`,
    qrUrl: recipient.qrUrl,
  });
}

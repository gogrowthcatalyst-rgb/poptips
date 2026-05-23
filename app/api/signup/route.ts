/**
 * POST /api/signup
 *
 * Native signup for both roles. Our DB is the source of truth; GHL is a
 * best-effort downstream push (CRM + magic-link/drip automations).
 *
 * Flow (Power of Ten aligned — validate at the boundary, check every return,
 * no fatal coupling to external services):
 *   1. Validate the payload by role.
 *   2. Recipient: verify handle (shape/reserved/unique), create the recipient
 *      with the claimed handle + a generated QR. Payment apps + photo come in
 *      the post-confirmation profile-completion step, so apps start empty and
 *      the profile shows "still setting up" until completed.
 *   3. Tipper: create the tipper with self-reported apps.
 *   4. Best-effort: upsert the GHL contact (tagged by role) so the magic-link
 *      workflow can fire. A GHL failure is logged, never fatal.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, recipients, tippers, PAYMENT_APPS } from '@/lib/db';
import { createRecipient } from '@/lib/db/recipients';
import { checkHandle } from '@/lib/reserved-handles';
import { upsertGhlContact } from '@/lib/ghl';

export const runtime = 'nodejs';

const BaseFields = {
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  phone: z.string().min(7).max(40),
  email: z.string().email().max(160),
  smsConsent: z.literal(true, {
    errorMap: () => ({ message: 'SMS consent is required to receive your magic link.' }),
  }),
};

const RecipientSchema = z.object({
  role: z.literal('recipient'),
  handle: z.string().min(2).max(30),
  ...BaseFields,
});

const TipperSchema = z.object({
  role: z.literal('tipper'),
  usesApps: z.array(z.enum(PAYMENT_APPS)).max(3).optional().default([]),
  ...BaseFields,
});

const BodySchema = z.discriminatedUnion('role', [RecipientSchema, TipperSchema]);

export async function POST(request: Request) {
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
  const displayName = `${data.firstName} ${data.lastName}`.trim();

  if (data.role === 'recipient') {
    const handle = data.handle.toLowerCase();

    const handleProblem = checkHandle(handle);
    if (handleProblem) {
      return NextResponse.json({ error: handleProblem, field: 'handle' }, { status: 422 });
    }

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

    // GHL push first so we can store the contact id on the record (best-effort).
    const ghl = await upsertGhlContact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      tags: ['poptips-recipient', 'recipient-signup'],
    });

    const recipient = await createRecipient({
      handle,
      displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      ghlContactId: ghl.contactId ?? null,
      apps: [], // added during profile completion
    });

    const origin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips';
    return NextResponse.json({
      ok: true,
      role: 'recipient',
      handle: recipient.handle,
      profileUrl: `${origin.replace(/\/$/, '')}/${recipient.handle}`,
      qrUrl: recipient.qrUrl,
      ghlPushed: ghl.ok,
    });
  }

  // Tipper
  const ghl = await upsertGhlContact({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    tags: ['poptips-tipper', 'tipper-signup'],
  });

  const inserted = await db
    .insert(tippers)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      usesApps: data.usesApps,
      ghlContactId: ghl.contactId ?? null,
    })
    .returning({ id: tippers.id });

  return NextResponse.json({
    ok: true,
    role: 'tipper',
    tipperId: inserted[0].id,
    ghlPushed: ghl.ok,
  });
}

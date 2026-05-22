/**
 * POST /api/tips
 *
 * Records a tip event the moment a customer taps a payment app on the send
 * page. Status starts as 'initiated' — we know the customer was handed off
 * to their app with a prefilled amount, but we can't verify the money cleared
 * (Pop Tips never touches it). Recipients later confirm receipt (Slice 6),
 * or it auto-confirms after 7 days.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, recipients, tipEvents, PAYMENT_APPS } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const BodySchema = z.object({
  handle: z.string().min(2).max(30),
  app: z.enum(PAYMENT_APPS),
  amountCents: z.number().int().positive().max(100_000_00), // cap $100k sanity
  note: z.string().max(280).optional(),
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

  const { handle, app, amountCents, note } = parsed.data;

  // Resolve the recipient so we store a real FK + denormalized handle.
  const found = await db
    .select({ id: recipients.id, handle: recipients.handle })
    .from(recipients)
    .where(eq(recipients.handle, handle.toLowerCase()))
    .limit(1);

  const recipient = found[0];
  if (!recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }

  const inserted = await db
    .insert(tipEvents)
    .values({
      recipientId: recipient.id,
      recipientHandle: recipient.handle,
      amountCents,
      app,
      note: note ?? null,
      status: 'initiated',
    })
    .returning({ id: tipEvents.id });

  return NextResponse.json({ ok: true, tipEventId: inserted[0].id });
}
